"use client"

import {
  BadgeCheck,
  CircleDollarSign,
  Lock,
  Star,
  Zap,
} from "lucide-react"

import { TrackedLink } from "@/components/analytics/tracked-link"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

function StarRating({
  count,
  className,
}: Readonly<{ count: number; className?: string }>) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <Star
          key={index}
          className="size-3.5 fill-yellow-400 text-yellow-400"
        />
      ))}
    </div>
  )
}

export function PricingSocialProof({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
        className
      )}
    >
      <StarRating count={p.socialProofRating} />
      <span className="text-[13px] font-medium text-foreground/85 sm:text-[14px]">
        {p.socialProofLine}
      </span>
    </div>
  )
}

function StripeWordmark({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn("h-4 w-auto shrink-0", className)}
      viewBox="54 36 360.02 149.84"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Stripe"
    >
      <path
        fill="currentColor"
        d="M414,113.4c0-25.6-12.4-45.8-36.1-45.8c-23.8,0-38.2,20.2-38.2,45.6c0,30.1,17,45.3,41.4,45.3c11.9,0,20.9-2.7,27.7-6.5v-20c-6.8,3.4-14.6,5.5-24.5,5.5c-9.7,0-18.3-3.4-19.4-15.2h48.9C413.8,121,414,115.8,414,113.4z M364.6,103.9c0-11.3,6.9-16,13.2-16c6.1,0,12.6,4.7,12.6,16H364.6z"
      />
      <path
        fill="currentColor"
        d="M301.1,67.6c-9.8,0-16.1,4.6-19.6,7.8l-1.3-6.2h-22v116.6l25-5.3l0.1-28.3c3.6,2.6,8.9,6.3,17.7,6.3c17.9,0,34.2-14.4,34.2-46.1C335.1,83.4,318.6,67.6,301.1,67.6z M295.1,136.5c-5.9,0-9.4-2.1-11.8-4.7l-0.1-37.1c2.6-2.9,6.2-4.9,11.9-4.9c9.1,0,15.4,10.2,15.4,23.3C310.5,126.5,304.3,136.5,295.1,136.5z"
      />
      <path fill="currentColor" d="M223.8,61.7 L248.9,56.3 L248.9,36 L223.8,41.3 Z" />
      <path
        fill="currentColor"
        d="M223.8,69.3h25.1v87.5h-25.1V69.3z"
      />
      <path
        fill="currentColor"
        d="M196.9,76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7,15.9-6.3,19-5.2v-23C214.5,68.1,202.8,65.9,196.9,76.7z"
      />
      <path
        fill="currentColor"
        d="M146.9,47.6l-24.4,5.2l-0.1,80.1c0,14.8,11.1,25.7,25.9,25.7c8.2,0,14.2-1.5,17.5-3.3V135c-3.2,1.3-19,5.9-19-8.9V90.6h19V69.3h-19L146.9,47.6z"
      />
      <path
        fill="currentColor"
        d="M79.3,94.7c0-3.9,3.2-5.4,8.5-5.4c7.6,0,17.2,2.3,24.8,6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5,67.6,54,78.2,54,95.9c0,27.6,38,23.2,38,35.1c0,4.6-4,6.1-9.6,6.1c-8.3,0-18.9-3.4-27.3-8v23.8c9.3,4,18.7,5.7,27.3,5.7c20.8,0,35.1-10.3,35.1-28.2C117.4,100.6,79.3,105.9,79.3,94.7z"
      />
    </svg>
  )
}

/** Compact reassurance row — sits above pricing cards. */
export function PricingTrustStripCompact({
  className,
}: Readonly<{ className?: string }>) {
  const t = p.trust

  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-marketing-muted sm:text-[13px]",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Lock className="size-3.5 shrink-0 text-blue-400" aria-hidden />
        {t.checkoutLabel}
      </span>
      <span className="hidden text-white/20 sm:inline" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Zap className="size-3.5 shrink-0 text-amber-300/90" aria-hidden />
        {t.deliveryLabel}
      </span>
      <span className="hidden text-white/20 sm:inline" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        <BadgeCheck className="size-3.5 shrink-0 text-emerald-300/90" aria-hidden />
        {t.noSubLabel}
      </span>
      <span className="hidden text-white/20 sm:inline" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CircleDollarSign
          className="size-3.5 shrink-0 text-green-400/95"
          aria-hidden
        />
        {t.guaranteeLabel}
      </span>
    </div>
  )
}

/** Stripe checkout line — sits below pricing cards. */
export function PricingTrustStrip({
  className,
}: Readonly<{ className?: string }>) {
  const pricing = useMarketingPricing()

  return (
    <p
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 text-center text-[12px] text-marketing-muted",
        className
      )}
    >
      <Lock className="size-3.5 shrink-0" aria-hidden />
      Checkout secured by
      <TrackedLink
        href={pricing.checkoutUrl}
        eventName="pricing_click"
        metadata={{ location: "pricing_trust_stripe_badge" }}
        external
        className="inline-flex items-center text-foreground/90 transition-opacity hover:opacity-80"
        ariaLabel="Go to secure checkout"
      >
        <StripeWordmark />
      </TrackedLink>
    </p>
  )
}
