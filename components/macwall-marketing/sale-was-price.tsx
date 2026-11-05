"use client"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { cn } from "@/lib/utils"

/**
 * Pro's full price struck through, followed by a space, while a sale runs.
 * Put it right before `pricing.permanentPrice` (already the sale price).
 */
export function SaleWasPrice({ className }: Readonly<{ className?: string }>) {
  const sale = useMarketingPricing().sale
  if (!sale) return null
  return (
    <>
      <s className={cn("tabular-nums opacity-60", className)}>
        <span className="sr-only">Was </span>
        {sale.regular.permanentPrice}
      </s>{" "}
    </>
  )
}
