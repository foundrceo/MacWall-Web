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
    <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground sm:text-[12px]">
      Only from {pricing.permanentPrice} · 24-hour free trial
    </p>
  )
}
