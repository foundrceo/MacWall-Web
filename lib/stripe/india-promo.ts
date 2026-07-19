import "server-only"

import { INDIA_PROMO_CODE } from "@/lib/marketing-india-promo"
import { isIndiaCountry } from "@/lib/geo/country"

/** Live Stripe promotion code for INDIA50 (50% off MacWall Pro). */
const STRIPE_INDIA_PROMOTION_CODE_ID = "promo_1TlWDRIZgqo0QIlXjugcordH"

export function shouldApplyIndiaPromo(input: {
  country: string | null
  requestedPromo?: string | null
}): boolean {
  if (!isIndiaCountry(input.country)) return false

  const promo = input.requestedPromo?.trim().toUpperCase()
  if (promo && promo !== INDIA_PROMO_CODE) return false

  return true
}

export function indiaCheckoutDiscount(): { promotion_code: string } {
  return { promotion_code: STRIPE_INDIA_PROMOTION_CODE_ID }
}
