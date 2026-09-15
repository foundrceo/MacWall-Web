import "server-only"

import type {
  LicenseOfferSlug,
  PricingRegion,
} from "@/lib/license/offers.shared"

/**
 * Catalog Stripe Prices under "MacWall Pro (2026 Pricing)"
 * (prod_UrOJX8fIfNB2Gs):
 *
 * Global:
 *   - permanent:     $9.99 / 3 Macs
 *   - permanent_5:   $12.99 / 5 Macs
 *   - permanent_10:  $24.99 / 10 Macs
 *   - permanent_15:  $33.99 / 15 Macs
 *   - permanent_20:  $39.99 / 20 Macs
 *   - annual:        $4.99/year (archived)
 *
 * Checkout add-on (separate product prod_VGNMGYek2P7KCl):
 *   - extra macs:    $3.99, offered on 3-Mac Pro only
 *
 * India (same product, separate Prices — no coupon):
 *   - permanent:     $3.99
 *   - permanent_5:   $6.99
 *   - permanent_10:  $12.99
 *   - permanent_15:  $17.99
 *   - permanent_20:  $21.99
 */
export const MACWALL_PRO_PRODUCT_ID = "prod_UrOJX8fIfNB2Gs"

/** Checkout add-on: Pro (3 Macs) to 5 Macs for $3.99. */
export const EXTRA_MACS_PRODUCT_ID = "prod_VGNMGYek2P7KCl"
export const EXTRA_MACS_PRICE_ID = "price_1UFqbqIZgqo0QIlX8ilJPEiU"
export const EXTRA_MACS_DEVICE_LIMIT = 5

const STRIPE_PRICE_IDS: Record<LicenseOfferSlug, string> = {
  permanent: "price_1UFPVKIZgqo0QIlXnuOInCqk",
  annual: "price_1TrfXPIZgqo0QIlXvzJrJgPU",
  permanent_5: "price_1TzXi9IZgqo0QIlXDYmQvXI2",
  permanent_10: "price_1TzXuqIZgqo0QIlXn93A3OAA",
  permanent_15: "price_1TzXurIZgqo0QIlX7QAS8MOp",
  permanent_20: "price_1TzXurIZgqo0QIlXn4P4bPjP",
}

const STRIPE_INDIA_PRICE_IDS: Partial<Record<LicenseOfferSlug, string>> = {
  permanent: "price_1TzHoFIZgqo0QIlXPhvHpxR2",
  permanent_5: "price_1TzHoFIZgqo0QIlXaK0LOgEy",
  permanent_10: "price_1TzXusIZgqo0QIlXpamfNZwf",
  permanent_15: "price_1TzXutIZgqo0QIlXN2pqtqwz",
  permanent_20: "price_1TzXutIZgqo0QIlXADikdWlO",
  // Annual retired — India permanent Price used if somehow requested.
  annual: "price_1TzHoFIZgqo0QIlXPhvHpxR2",
}

export function stripePriceIdForOffer(
  offerSlug: LicenseOfferSlug,
  region: PricingRegion = "default"
): string {
  if (region === "india") {
    return STRIPE_INDIA_PRICE_IDS[offerSlug] ?? STRIPE_PRICE_IDS[offerSlug]
  }
  return STRIPE_PRICE_IDS[offerSlug]
}

export function extraMacsPriceId(): string {
  return process.env.STRIPE_PRICE_ID_EXTRA_MACS?.trim() || EXTRA_MACS_PRICE_ID
}

/** 3-Mac Pro checkout only. Multi-Mac packs already include 5+ seats. */
export function extraMacsOptionalItems(
  offerSlug: LicenseOfferSlug
): Array<{ price: string; quantity: number }> | undefined {
  if (offerSlug !== "permanent") return undefined
  return [{ price: extraMacsPriceId(), quantity: 1 }]
}
