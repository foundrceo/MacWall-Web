import "server-only"

import type Stripe from "stripe"

import type {
  LicenseOfferSlug,
  PricingRegion,
} from "@/lib/license/offers.shared"

/**
 * Stripe catalog (2026-10). Four Products, one Price per region each. Price
 * metadata tells the license webhook how many Macs a line item is worth:
 * `max_devices` on licenses, `adds_devices` on add-ons.
 *
 *   Product                    Shown at Checkout          Global (USD)  India (USD)
 *   macwall_pro                MacWall Pro (3 Macs)            $12.99       $4.99
 *   macwall_pro_plus           MacWall Pro+ (5 Macs)           $19.99       $7.99
 *   macwall_upgrade_pro_plus   Upgrade to Pro+ (+2 Macs)        $7.00       $3.00  optional on Pro
 *   macwall_addon_5_macs       Add 5 more Macs                 $15.00       $5.00  optional on Pro+,
 *                                                                               required for 10 Macs
 *
 * All Prices are USD. Adaptive Pricing converts at Checkout; the old INR
 * India Prices are archived.
 *
 * Every ID can be overridden with an env var (see .env.example). Prices
 * without an ID are resolved by lookup key: `<product>_<global|india>`.
 */
type RegionCatalog = {
  pro: string | null
  proPlus: string | null
  upgradeProPlus: string | null
  addon5Macs: string | null
}

type CatalogItem = keyof RegionCatalog

const LOOKUP_KEYS: Record<CatalogItem, string> = {
  pro: "macwall_pro",
  proPlus: "macwall_pro_plus",
  upgradeProPlus: "macwall_upgrade_pro_plus",
  addon5Macs: "macwall_addon_5_macs",
}

function envPrice(name: string, fallback: string | null): string | null {
  return process.env[name]?.trim() || fallback
}

const CATALOG: Record<PricingRegion, RegionCatalog> = {
  default: {
    pro: envPrice("STRIPE_PRICE_PRO_GLOBAL", "price_1UKa1iIZgqo0QIlXRhrViZYR"),
    proPlus: envPrice(
      "STRIPE_PRICE_PRO_PLUS_GLOBAL",
      "price_1UKa1jIZgqo0QIlXbRe8YZEq"
    ),
    upgradeProPlus: envPrice(
      "STRIPE_PRICE_UPGRADE_PRO_PLUS_GLOBAL",
      "price_1UKa1kIZgqo0QIlXb5bDqCzF"
    ),
    addon5Macs: envPrice(
      "STRIPE_PRICE_ADDON_5_MACS_GLOBAL",
      "price_1UKakeIZgqo0QIlX3NBuNSO7"
    ),
  },
  india: {
    pro: envPrice("STRIPE_PRICE_PRO_INDIA", "price_1UKaSHIZgqo0QIlXNuzrWEh0"),
    proPlus: envPrice(
      "STRIPE_PRICE_PRO_PLUS_INDIA",
      "price_1UKaSIIZgqo0QIlXGFVs0yOZ"
    ),
    upgradeProPlus: envPrice(
      "STRIPE_PRICE_UPGRADE_PRO_PLUS_INDIA",
      "price_1UKaSJIZgqo0QIlX4Xow4wYD"
    ),
    addon5Macs: envPrice(
      "STRIPE_PRICE_ADDON_5_MACS_INDIA",
      "price_1UKaSKIZgqo0QIlX1UAok3ar"
    ),
  },
}

export type CheckoutPrices = {
  /** Always charged. */
  lineItems: string[]
  /** Offered as one-click cross-sells on the Checkout page. */
  optionalItems: string[]
}

const LOOKUP_MISS_TTL_MS = 5 * 60_000
const lookupCache = new Map<string, { id: string | null; at: number }>()

async function lookupPriceId(
  stripe: Stripe,
  lookupKey: string
): Promise<string | null> {
  const cached = lookupCache.get(lookupKey)
  if (cached?.id) return cached.id
  if (cached && Date.now() - cached.at < LOOKUP_MISS_TTL_MS) return null

  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    })
    const id = prices.data[0]?.id ?? null
    lookupCache.set(lookupKey, { id, at: Date.now() })
    if (!id) console.error(`[checkout] No active Price with lookup_key ${lookupKey}`)
    return id
  } catch (error) {
    console.error(
      "[checkout] price lookup failed",
      error instanceof Error ? error.message : "error"
    )
    return null
  }
}

async function priceId(
  stripe: Stripe,
  region: PricingRegion,
  item: CatalogItem
): Promise<string | null> {
  const configured = CATALOG[region][item]
  if (configured) return configured
  const suffix = region === "india" ? "india" : "global"
  return lookupPriceId(stripe, `${LOOKUP_KEYS[item]}_${suffix}`)
}

async function requiredPriceId(
  stripe: Stripe,
  region: PricingRegion,
  item: CatalogItem
): Promise<string> {
  const id = await priceId(stripe, region, item)
  if (!id) throw new Error("This pricing option is unavailable right now.")
  return id
}

export async function checkoutPricesForOffer(
  stripe: Stripe,
  offerSlug: LicenseOfferSlug,
  region: PricingRegion = "default"
): Promise<CheckoutPrices> {
  switch (offerSlug) {
    case "permanent_5": {
      const [proPlus, addon] = await Promise.all([
        requiredPriceId(stripe, region, "proPlus"),
        priceId(stripe, region, "addon5Macs"),
      ])
      return { lineItems: [proPlus], optionalItems: addon ? [addon] : [] }
    }
    case "permanent_10":
    case "permanent_15":
    case "permanent_20": {
      const [proPlus, addon] = await Promise.all([
        requiredPriceId(stripe, region, "proPlus"),
        requiredPriceId(stripe, region, "addon5Macs"),
      ])
      return { lineItems: [proPlus, addon], optionalItems: [] }
    }
    case "permanent":
    case "annual": {
      const [pro, upgrade] = await Promise.all([
        requiredPriceId(stripe, region, "pro"),
        priceId(stripe, region, "upgradeProPlus"),
      ])
      return { lineItems: [pro], optionalItems: upgrade ? [upgrade] : [] }
    }
  }
}
