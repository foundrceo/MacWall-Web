"use client"

import Link from "next/link"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { LAUNCH_BANNER_CLASS } from "@/lib/marketing-chrome"

function PricingAnnouncement() {
  const pricing = useMarketingPricing()

  return (
    <Link
      href="/pricing"
      className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-0.5 px-4 py-2.5 text-center transition-opacity hover:opacity-80 sm:h-9 sm:flex-row sm:gap-0 sm:py-0"
    >
      <span className="text-[12px] font-medium text-black sm:text-[14px]">
        {pricing.bannerHeadline}
      </span>
      <span className="text-[12px] leading-snug text-black/65 sm:ml-1.5 sm:text-[14px]">
        {pricing.bannerSubline}
      </span>
    </Link>
  )
}

/** Same announcement layout everywhere; India only receives different copy/prices. */
export default function AnnouncementBanner() {
  return (
    <div id="launch-banner" className={LAUNCH_BANNER_CLASS}>
      <PricingAnnouncement />
    </div>
  )
}
