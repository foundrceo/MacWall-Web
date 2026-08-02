import "server-only"

import type { LicenseOfferSlug } from "@/lib/license/offers.shared"

/**
 * Real Stripe Price IDs — under "MacWall Pro (2026 Pricing)"
 * (prod_UrOJX8fIfNB2Gs). No India-specific Prices — India is 50% off via
 * coupon INDIA50 on these same Prices at Checkout.
 *
 *   - permanent:    price_1TrfXjIZgqo0QIlXBoimbJ17  ($9.99, one-time)
 *   - annual:       price_1TrfXPIZgqo0QIlXvzJrJgPU  ($4.99/year, archived)
 *   - permanent_5:  price_1TrfXxIZgqo0QIlXSFDQfPsu  ($14.99, one-time)
 */
const STRIPE_PRICE_IDS: Record<LicenseOfferSlug, string> = {
  permanent: "price_1TrfXjIZgqo0QIlXBoimbJ17",
  annual: "price_1TrfXPIZgqo0QIlXvzJrJgPU",
  permanent_5: "price_1TrfXxIZgqo0QIlXSFDQfPsu",
}

/** Stripe Coupon: 50% off forever — auto-applied for India visitors. */
export const INDIA_COUPON_ID = "INDIA50"

export function stripePriceIdForOffer(offerSlug: LicenseOfferSlug): string {
  return STRIPE_PRICE_IDS[offerSlug]
}
