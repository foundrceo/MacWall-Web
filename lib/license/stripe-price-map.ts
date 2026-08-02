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
 *   - permanent:    price_1TrfXjIZgqo0QIlXBoimbJ17  ($9.99, 3 Macs)
 *   - permanent_5:  price_1TrfXxIZgqo0QIlXSFDQfPsu  ($14.99, 5 Macs)
 *   - annual:       price_1TrfXPIZgqo0QIlXvzJrJgPU  ($4.99/year, archived)
 *
 * India (same product, separate Prices — no coupon):
 *   - permanent:    price_1TzHoFIZgqo0QIlXPhvHpxR2  ($3.99, 3 Macs)
 *   - permanent_5:  price_1TzHoFIZgqo0QIlXaK0LOgEy  ($6.99, 5 Macs)
 */
export const MACWALL_PRO_PRODUCT_ID = "prod_UrOJX8fIfNB2Gs"

const STRIPE_PRICE_IDS: Record<LicenseOfferSlug, string> = {
  permanent: "price_1TrfXjIZgqo0QIlXBoimbJ17",
  annual: "price_1TrfXPIZgqo0QIlXvzJrJgPU",
  permanent_5: "price_1TrfXxIZgqo0QIlXSFDQfPsu",
}

const STRIPE_INDIA_PRICE_IDS: Partial<Record<LicenseOfferSlug, string>> = {
  permanent: "price_1TzHoFIZgqo0QIlXPhvHpxR2",
  permanent_5: "price_1TzHoFIZgqo0QIlXaK0LOgEy",
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
