import "server-only"

import type { getStripe } from "@/lib/stripe/server"

/**
 * Stable Dashboard label for this web Checkout surface.
 * Stripe best practice: include an 8-letter suffix for flow comparison.
 */
export const CHECKOUT_INTEGRATION_ID = "macwall_web_checkout_kxqmvrnp"

export type CreateCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number }

export function checkoutErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Checkout session failed."

  if (/expired api key/i.test(message)) {
    return "Checkout is temporarily unavailable. Please try again shortly or email support@macwall.app."
  }
  if (/invalid api key/i.test(message)) {
    return "Checkout is temporarily unavailable. Please try again shortly or email support@macwall.app."
  }
  if (/no such price/i.test(message)) {
    return "This pricing option is unavailable right now. Please refresh and try again."
  }

  return "Could not start checkout. Please try again."
}

export async function resolvePromotionCodeId(
  stripe: ReturnType<typeof getStripe>,
  code: string
): Promise<string | null> {
  try {
    const listed = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    })
    return listed.data[0]?.id ?? null
  } catch (error) {
    console.error(
      "[checkout] promotion code lookup failed",
      error instanceof Error ? error.message : "error"
    )
    return null
  }
}
