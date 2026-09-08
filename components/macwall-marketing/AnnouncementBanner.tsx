"use client"

import Link from "next/link"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"

function Dot() {
  return (
    <span className="shrink-0 text-black/40" aria-hidden>
      ·
    </span>
  )
}

/** Pricing strip above the navbar — honest one-time offer, no fake countdown. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()

  return (
    <div id="launch-banner" className="launch-banner">
      <Link
        href="/pricing"
        className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-y-0.5 px-3 text-center transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black/30 sm:flex-row sm:flex-wrap sm:gap-x-2 sm:gap-y-0 sm:px-4"
      >
        <span className="max-w-full text-[11px] font-semibold tracking-tight text-balance text-black sm:truncate sm:text-[13px]">
          {pricing.isIndia ? (
            <>
              <span aria-hidden className="mr-1">
                🇮🇳
              </span>
              <span className="sr-only">India offer: </span>
            </>
          ) : null}
          {pricing.bannerHeadline}
        </span>

        <span className="hidden sm:inline" aria-hidden>
          <Dot />
        </span>

        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2">
          <span className="inline-flex shrink-0 items-baseline gap-x-1 text-[11px] sm:text-[13px]">
            <span className="font-medium text-black/70">Pro</span>
            <span className="text-black/55 line-through decoration-black/50 decoration-1">
              {pricing.bannerStrikePrice}
            </span>
            <span className="font-semibold text-black tabular-nums">
              {pricing.bannerSalePrice}
            </span>
          </span>

          <Dot />

          <span className="shrink-0 text-[11px] font-semibold text-black sm:text-[13px]">
            {pricing.bannerCta}
          </span>
        </span>
      </Link>
    </div>
  )
}
