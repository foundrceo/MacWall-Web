export const LICENSE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
  "permanent_10",
  "permanent_15",
  "permanent_20",
] as const

export type LicenseOfferSlug = (typeof LICENSE_OFFER_SLUGS)[number]
export type LicenseBillingModel = "permanent" | "annual"
export type PricingRegion = "default" | "india"

export type LicenseOffer = {
  slug: LicenseOfferSlug
  name: string
  billingModel: LicenseBillingModel
  maxDevices: number
  usdCents: number
  /** India price in USD cents. Charged in USD; the site shows live INR. */
  indiaUsdCents: number
}

/** Percent off vs catalog USD (rounded). */
export function indiaDiscountPercentOff(
  usdCents: number,
  indiaUsdCents: number
): number {
  if (usdCents <= 0) return 0
  return Math.round((1 - indiaUsdCents / usdCents) * 100)
}

/**
 * 2026-10 catalog. Every pack is Pro — packs only differ by Mac count.
 *
 *   Global (USD): Pro 3 Macs $12.99 · Pro+ 5 Macs $19.99 · 10 Macs $34.99
 *   India  (USD): Pro 3 Macs  $4.99 · Pro+ 5 Macs  $7.99 · 10 Macs $12.99
 *
 * Everything is charged in USD. India visitors see prices converted to INR
 * at the live rate on the site. The 10-Mac pack is Pro+ plus the “Add 5 more
 * Macs” add-on. 15/20-Mac packs are retired; old links normalize to 10 Macs.
 */
export const LICENSE_OFFERS: Record<LicenseOfferSlug, LicenseOffer> = {
  permanent: {
    slug: "permanent",
    name: "Pro",
    billingModel: "permanent",
    maxDevices: 3,
    usdCents: 1299,
    indiaUsdCents: 499,
  },
  annual: {
    slug: "annual",
    name: "Annual plan",
    billingModel: "annual",
    maxDevices: 3,
    usdCents: 499,
    indiaUsdCents: 199,
  },
  permanent_5: {
    slug: "permanent_5",
    name: "Pro+ (5 Macs)",
    billingModel: "permanent",
    maxDevices: 5,
    usdCents: 1999,
    indiaUsdCents: 799,
  },
  permanent_10: {
    slug: "permanent_10",
    name: "Pro+ (10 Macs)",
    billingModel: "permanent",
    maxDevices: 10,
    usdCents: 3499,
    indiaUsdCents: 1299,
  },
  // Retired — kept so old checkout links and analytics still resolve.
  permanent_15: {
    slug: "permanent_15",
    name: "15-Mac license (retired)",
    billingModel: "permanent",
    maxDevices: 15,
    usdCents: 3499,
    indiaUsdCents: 1299,
  },
  permanent_20: {
    slug: "permanent_20",
    name: "20-Mac license (retired)",
    billingModel: "permanent",
    maxDevices: 20,
    usdCents: 3499,
    indiaUsdCents: 1299,
  },
}

export const DEFAULT_LICENSE_OFFER_SLUG: LicenseOfferSlug = "permanent"

/**
 * India on Cashfree is charged fixed rupee prices that mirror the India
 * catalog digit for digit: $4.99 → ₹499, $7.99 → ₹799, $12.99 → ₹1,299.
 * Not an exchange rate — a fixed ₹100 per catalog dollar.
 */
export const INDIA_FIXED_INR_PER_USD = 100

export function indiaFixedInr(indiaUsdCents: number): number {
  return (indiaUsdCents * INDIA_FIXED_INR_PER_USD) / 100
}

/** Checkout cross-sell add-ons in USD cents, per region. */
export const CHECKOUT_ADDONS = {
  /** Pro → Pro+ (+2 Macs). */
  upgradeProPlus: { usd: 700, indiaUsd: 300 },
  /** Pro+ → 10 Macs (+5 Macs). */
  addon5Macs: { usd: 1500, indiaUsd: 500 },
} as const

export function checkoutAddonAmount(
  addon: keyof typeof CHECKOUT_ADDONS,
  region: PricingRegion
): number {
  const amounts = CHECKOUT_ADDONS[addon]
  return region === "india" ? amounts.indiaUsd : amounts.usd
}

/** Multi-Mac packs on sale (Pro+). */
export const MULTI_MAC_OFFER_SLUGS = [
  "permanent_5",
  "permanent_10",
] as const satisfies readonly LicenseOfferSlug[]

export const INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
  "permanent_10",
  "permanent_15",
  "permanent_20",
] as const satisfies readonly LicenseOfferSlug[]

export function isIndiaDiscountEligible(slug: LicenseOfferSlug): boolean {
  return (INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS as readonly string[]).includes(
    slug
  )
}

export function isMultiMacOfferSlug(
  value: string | null | undefined
): value is (typeof MULTI_MAC_OFFER_SLUGS)[number] {
  return (MULTI_MAC_OFFER_SLUGS as readonly string[]).includes(value ?? "")
}

export function isLicenseOfferSlug(
  value: string | null | undefined
): value is LicenseOfferSlug {
  if (!value) return false
  return (LICENSE_OFFER_SLUGS as readonly string[]).includes(value)
}

export function normalizeLicenseOfferSlug(
  value: string | null | undefined
): LicenseOfferSlug {
  // Annual is retired — old ?offer=annual links become permanent one-time.
  if (value === "annual") return "permanent"
  // 15/20-Mac packs are retired — the largest pack is 10 Macs.
  if (value === "permanent_15" || value === "permanent_20") return "permanent_10"

  if (isLicenseOfferSlug(value)) return value

  // Preserve old shared checkout links while moving off Pro / Pro Plus.
  if (value === "pro_plus" || value === "pro_max") return "permanent_5"
  return DEFAULT_LICENSE_OFFER_SLUG
}

export function licenseOfferFromSlug(
  slug: string | null | undefined
): LicenseOffer {
  return LICENSE_OFFERS[normalizeLicenseOfferSlug(slug)]
}

/** What the buyer is charged, in USD cents. */
export function licenseOfferPriceCents(
  offer: LicenseOffer,
  region: PricingRegion
): number {
  return region === "india" ? offer.indiaUsdCents : offer.usdCents
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function licenseOfferCheckoutPath(slug: LicenseOfferSlug): string {
  return `/api/checkout/create-session?${new URLSearchParams({ offer: slug }).toString()}`
}
