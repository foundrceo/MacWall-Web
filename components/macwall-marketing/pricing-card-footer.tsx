"use client"

import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"

/** Post-CTA trust line under pricing card buttons. */
export function PricingCardFooter() {
  const f = p.cardFooter

  return (
    <p>
      {f.tryFreeLabel} · {f.macOSLabel} · {f.updatesLabel}
    </p>
  )
}
