"use client"

import Link from "next/link"
import { Fragment } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { LAUNCH_BANNER_CLASS } from "@/lib/marketing-chrome"
import {
  indiaPromo,
  indiaPromoPricingHref,
} from "@/lib/marketing-india-promo"
import { useIndiaPromoCountdown } from "@/lib/marketing/use-india-promo-countdown"

function DefaultLaunchBanner() {
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
        {pricing.bannerPrices.map((tier, index) => (
          <Fragment key={tier.label}>
            {index > 0 ? <span className="mx-1.5">·</span> : null}
            <span>
              {tier.label}{" "}
              <span className="font-medium text-black">{tier.price}</span>{" "}
              <span className="text-black/40 line-through">{tier.strike}</span>
            </span>
          </Fragment>
        ))}
      </span>
    </Link>
  )
}

function IndiaFlashBanner() {
  const { countdownLabel } = useIndiaPromoCountdown(true)

  return (
    <Link
      href={indiaPromoPricingHref()}
      onClick={() =>
        trackSiteEventClient("cta_click", {
          location: "announcement_bar",
          audience: "india",
          promo_code: indiaPromo.code,
        })
      }
      className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-0.5 bg-gradient-to-r from-[#FFF7ED] via-white to-[#F0FDF4] px-4 py-2.5 text-center transition-opacity hover:opacity-90 sm:h-9 sm:flex-row sm:gap-0 sm:py-0"
    >
      <span className="text-[12px] font-semibold text-black sm:text-[14px]">
        {indiaPromo.banner.headline}
      </span>
      <span className="text-[12px] leading-snug text-black/70 sm:ml-1.5 sm:text-[14px]">
        {indiaPromo.banner.subline(indiaPromo.code, countdownLabel)}
      </span>
    </Link>
  )
}

/** Geo-aware launch strip — India gets the flash sale + countdown. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()

  return (
    <div id="launch-banner" className={LAUNCH_BANNER_CLASS}>
      {pricing.isIndia ? <IndiaFlashBanner /> : <DefaultLaunchBanner />}
    </div>
  )
}
