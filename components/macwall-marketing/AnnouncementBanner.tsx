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
        className="mx-auto flex h-full max-w-7xl items-center justify-center gap-x-1.5 overflow-hidden px-3 text-center transition-opacity hover:opacity-80 sm:gap-x-2 sm:px-4"
      >
        <span className="truncate text-[11px] font-semibold tracking-tight text-black sm:text-[13px]">
          {pricing.bannerHeadline}
        </span>

        <span className="shrink-0 text-black/25" aria-hidden>
          ·
        </span>

        <span className="inline-flex shrink-0 items-baseline gap-x-1 text-[11px] sm:text-[13px]">
          <span className="font-medium text-black/55">Pro</span>
          <span className="text-black/40 line-through decoration-black/45 decoration-1">
            {pricing.permanentStrikePrice}
          </span>
          <span className="font-semibold text-black tabular-nums">
            {pricing.permanentPrice}
          </span>
        </span>

        <span className="hidden shrink-0 text-black/25 sm:inline" aria-hidden>
          ·
        </span>

        <span className="hidden truncate text-[11px] font-semibold text-black sm:inline sm:text-[13px]">
          {pricing.bannerCta}
        </span>
      </Link>
    </div>
  )
}
