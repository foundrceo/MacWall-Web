"use client"

import { TrackedLink } from "@/components/analytics/tracked-link"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

const linkClassName =
  "font-medium text-foreground/85 underline decoration-foreground/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground/50"

/** One-line Reel refund hook below pricing cards. */
export function PricingTryFreeRow({
  className,
}: Readonly<{ className?: string }>) {
  const copy = p.reelRefundHook

  return (
    <p className={cn("text-center text-[13px] sm:text-[14px]", className)}>
      <TrackedLink
        href={copy.href}
        eventName="pricing_click"
        metadata={{ location: "pricing_reel_refund_hook" }}
        className={linkClassName}
      >
        {copy.line}
      </TrackedLink>
    </p>
  )
}
