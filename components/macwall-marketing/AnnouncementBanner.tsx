"use client"

import Link from "next/link"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { LAUNCH_BANNER_CLASS } from "@/lib/marketing-chrome"

/** Launch offer strip above the navbar — tease the deal, drive to pricing. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()

  return (
    <div id="launch-banner" className={LAUNCH_BANNER_CLASS}>
      <Link
        href="/pricing"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 px-4 py-2.5 text-center transition-opacity hover:opacity-80 sm:h-9 sm:flex-nowrap sm:py-0"
      >
        <span className="text-[12px] font-semibold tracking-tight text-black sm:text-[13px]">
          {pricing.bannerHeadline}
        </span>

        <span className="text-black/25" aria-hidden>
          ·
        </span>

        <span className="inline-flex items-baseline gap-x-1 text-[12px] sm:text-[13px]">
          <span className="font-medium text-black/55">Pro</span>
          <span className="text-black/35 line-through decoration-black/30">
            {pricing.permanentStrikePrice}
          </span>
          <span className="font-semibold tabular-nums text-black">
            {pricing.permanentPrice}
          </span>
        </span>

        <span className="text-black/25" aria-hidden>
          ·
        </span>

        <span className="text-[12px] font-semibold text-black sm:text-[13px]">
          {pricing.bannerCta}
        </span>
      </Link>
    </div>
  )
}
