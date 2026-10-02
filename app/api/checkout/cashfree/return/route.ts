import { NextResponse } from "next/server"

import {
  fulfilCashfreeOrder,
  isMacWallCashfreeOrderId,
} from "@/lib/cashfree/fulfil-order"
import { resolveCheckoutSiteOrigin } from "@/lib/stripe/checkout-origin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cashfree sends the buyer back here. The order is re-read from Cashfree
 * before anything is activated; the query string is never trusted.
 */
export async function GET(request: Request) {
  const origin = resolveCheckoutSiteOrigin(request.url)
  const orderId = new URL(request.url).searchParams.get("order_id")?.trim()
  const back = (message: string) => {
    const url = new URL("/pricing", origin)
    url.searchParams.set("checkout_error", message)
    return NextResponse.redirect(url, 303)
  }

  if (!orderId || !isMacWallCashfreeOrderId(orderId)) {
    return back("We couldn't find that order.")
  }

  try {
    const result = await fulfilCashfreeOrder(orderId)
    if (!result.paid) {
      return back(
        result.orderStatus === "ACTIVE"
          ? "Payment was not completed. You can try again."
          : "This checkout expired. Please start again."
      )
    }
    const activate = new URL("/activate", origin)
    activate.searchParams.set("key", result.licenseKey)
    activate.searchParams.set("provider", "cashfree")
    return NextResponse.redirect(activate, 303)
  } catch (error) {
    console.error(
      "[checkout/cashfree/return]",
      error instanceof Error ? error.message : "error"
    )
    return back(
      "We couldn't confirm your payment yet. If you were charged, email support@macwall.app."
    )
  }
}
