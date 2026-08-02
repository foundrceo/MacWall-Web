import "server-only"

import type { LicenseOfferSlug } from "@/lib/license/offers.shared"

/**
 * Catalog Stripe Prices under "MacWall Pro (2026 Pricing)"
 * (prod_UrOJX8fIfNB2Gs):
 *   - permanent:    price_1TrfXjIZgqo0QIlXBoimbJ17  ($9.99, one-time)
 *   - annual:       price_1TrfXPIZgqo0QIlXvzJrJgPU  ($4.99/year, archived)
 *   - permanent_5:  price_1TrfXxIZgqo0QIlXSFDQfPsu  ($14.99, one-time)
 *
 * India: same Price IDs + amount-off coupons → $3.99 Pro / $5.99 Pro+.
 * Normal Checkout line items keep Adaptive Pricing + local payment methods.
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
