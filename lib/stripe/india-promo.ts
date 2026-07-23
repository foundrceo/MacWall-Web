import "server-only"

import { INDIA_PROMO_CODE } from "@/lib/marketing-india-promo"
import { isIndiaCountry } from "@/lib/geo/country"

/** Live Stripe promotion code for INDIA50 (50% off all MacWall plans in India). */
const STRIPE_INDIA_PROMOTION_CODE_ID = "promo_1TlWDRIZgqo0QIlXjugcordH"

export function shouldApplyIndiaPromo(input: {
  country: string | null
  requestedPromo?: string | null
  planSlug?: string | null
}): boolean {
  // INDIA50 is geo-gated — non-India visitors always pay full USD price.
  if (!isIndiaCountry(input.country)) return false

  // Distinguish absent param (null) from explicit empty `?promo=`.
  if (input.requestedPromo != null) {
    const promo = input.requestedPromo.trim().toUpperCase()
    if (!promo) return false
    return promo === INDIA_PROMO_CODE
  }

  return true
}

export function indiaCheckoutDiscount(): { promotion_code: string } {
  return { promotion_code: STRIPE_INDIA_PROMOTION_CODE_ID }
}
