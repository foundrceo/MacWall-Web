"use client"

import { useEffect } from "react"

import { openCashfreeCheckout, type CashfreeMode } from "@/lib/cashfree/client"
import { pricingPathWithCheckoutError } from "@/lib/checkout/checkout-session-client"

/** Renders nothing; opens Cashfree, or returns to pricing if it can't. */
export function CashfreeHandoff({
  session,
  mode,
}: {
  session: string
  mode: CashfreeMode
}) {
  useEffect(() => {
    void openCashfreeCheckout(session, mode).then((opened) => {
      if (!opened) {
        window.location.replace(
          pricingPathWithCheckoutError("Checkout didn't open. Please try again.")
        )
      }
    })
  }, [mode, session])

  return null
}
