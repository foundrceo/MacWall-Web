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
 *   - permanent:     $7.99 / 3 Macs
 *   - permanent_5:   $12.99 / 5 Macs
 *   - permanent_10:  $24.99 / 10 Macs
 *   - permanent_15:  $33.99 / 15 Macs
 *   - permanent_20:  $39.99 / 20 Macs
 *   - annual:        $4.99/year (archived)
 *
 * India (same product, separate Prices — no coupon):
 *   - permanent:     $3.99
 *   - permanent_5:   $6.99
 *   - permanent_10:  $12.99
 *   - permanent_15:  $17.99
 *   - permanent_20:  $21.99
 */
export const MACWALL_PRO_PRODUCT_ID = "prod_UrOJX8fIfNB2Gs"

const STRIPE_PRICE_IDS: Record<LicenseOfferSlug, string> = {
  permanent: "price_1TzXi9IZgqo0QIlXq15x1mQM",
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
