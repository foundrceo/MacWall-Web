import "server-only"

import type { LicenseOfferSlug } from "@/lib/license/offers.shared"

/**
 * Catalog Stripe Prices under "MacWall Pro (2026 Pricing)"
 * (prod_UrOJX8fIfNB2Gs):
 *   - permanent:    price_1TrfXjIZgqo0QIlXBoimbJ17  ($9.99, one-time)
 *   - annual:       price_1TrfXPIZgqo0QIlXvzJrJgPU  ($4.99/year, archived)
 *   - permanent_5:  price_1TrfXxIZgqo0QIlXSFDQfPsu  ($14.99, one-time)
 *
 * India does NOT use a coupon or extra Prices. Checkout passes
 * `price_data` with this same product + indiaUsdCents ($3.99 Pro / $5.99 Pro+).
 */
export const MACWALL_PRO_PRODUCT_ID = "prod_UrOJX8fIfNB2Gs"

const STRIPE_PRICE_IDS: Record<LicenseOfferSlug, string> = {
  permanent: "price_1TrfXjIZgqo0QIlXBoimbJ17",
  annual: "price_1TrfXPIZgqo0QIlXvzJrJgPU",
  permanent_5: "price_1TrfXxIZgqo0QIlXSFDQfPsu",
}

export function stripePriceIdForOffer(offerSlug: LicenseOfferSlug): string {
  return STRIPE_PRICE_IDS[offerSlug]
}
