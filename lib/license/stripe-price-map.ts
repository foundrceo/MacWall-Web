import "server-only"

import type { LicenseOfferSlug } from "@/lib/license/offers.shared"

/**
 * Real Stripe Price IDs — exactly 3, under the "MacWall Pro (2026 Pricing)"
 * product (prod_UrOJX8fIfNB2Gs):
 *   - permanent:    price_1TrfXjIZgqo0QIlXBoimbJ17  ($9.99, one-time)
 *   - annual:       price_1TrfXPIZgqo0QIlXvzJrJgPU  ($4.99/year, subscription)
 *   - permanent_5:  price_1TrfXxIZgqo0QIlXSFDQfPsu  ($14.99, one-time, fixed for everyone)
 *
 * India pricing is NOT a separate price — it's the same base price with the
 * "INDIA" promotion code (macwall_india_20, 20% off forever) applied
 * automatically at checkout for permanent/annual only. The 5-Mac bundle never
 * gets the discount.
 *
 * Legacy `pro` / `pro_plus` prices (price_1TlWD3IZgqo0QIlX5ZpOgLSn,
 * price_1TpUUZIZgqo0QIlXY2Ym4gub, price_1TpB5mIZgqo0QIlXWHhDhw7W) are left
 * untouched in Stripe and intentionally not referenced here.
 */
const STRIPE_PRICE_IDS: Record<LicenseOfferSlug, string> = {
  permanent: "price_1TrfXjIZgqo0QIlXBoimbJ17",
  annual: "price_1TrfXPIZgqo0QIlXvzJrJgPU",
  permanent_5: "price_1TrfXxIZgqo0QIlXSFDQfPsu",
}

/** Stripe Coupon id backing the "INDIA" promotion code (20% off, forever). */
export const INDIA_COUPON_ID = "macwall_india_20"

export function stripePriceIdForOffer(offerSlug: LicenseOfferSlug): string {
  return STRIPE_PRICE_IDS[offerSlug]
}
