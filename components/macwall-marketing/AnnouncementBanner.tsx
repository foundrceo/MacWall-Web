"use client"

import Link from "next/link"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { macwall } from "@/lib/macwall-site"
import { indiaPromo, indiaPromoPricingHref } from "@/lib/marketing-india-promo"
import { indiaBannerSubline } from "@/lib/pricing/marketing-pricing"
import { useIndiaPromoCountdown } from "@/lib/marketing/use-india-promo-countdown"
import { LAUNCH_BANNER_CLASS } from "@/lib/marketing-chrome"

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
        Pro {pricing.salePrice}
        {pricing.suffix ? ` ${pricing.suffix}` : ""}{" "}
        {pricing.fullPrice ? (
          <>
            <span className="line-through decoration-black/35">
              {pricing.fullPrice}
            </span>
            {" · "}
          </>
        ) : null}
        One Mac per license
      </span>
    </Link>
  )
}

function IndiaFlashBanner() {
  const pricing = useMarketingPricing()
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
        {pricing.bannerHeadline}
      </span>
      <span className="text-[12px] leading-snug text-black/70 sm:ml-1.5 sm:text-[14px]">
        {indiaBannerSubline(pricing, indiaPromo.code, countdownLabel)}
      </span>
    </Link>
  )
}

/** Geo-aware launch strip — India gets prefetched INR flash pricing. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()

  return (
    <div id="launch-banner" className={LAUNCH_BANNER_CLASS}>
      {pricing.isIndia ? <IndiaFlashBanner /> : <DefaultLaunchBanner />}
    </div>
  )
}
