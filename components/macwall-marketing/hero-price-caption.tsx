"use client"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"

/**
 * Price-led microcopy under the hero download CTA.
 * Regional price hydrates client-side via `/api/pricing`
 * (static USD fallback on first paint), so hero HTML stays static.
 */
export function HeroPriceCaption() {
  const pricing = useMarketingPricing()

  return (
    <p className="mt-4 text-center text-[13px] whitespace-nowrap text-muted-foreground">
      Free for 24 hours, then{" "}
      <span className="text-foreground">{pricing.permanentPrice}</span> once.
    </p>
  )
}
