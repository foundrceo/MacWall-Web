"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"

/**
 * Full-bleed sale strip above the navbar, shown while `SITE_SALE` runs.
 * Same slot and height as `AnnouncementBanner`. Prices come from the
 * pricing context, so they are regional and drop back to the plain price
 * line if a cached page outlives the sale.
 */
export default function SaleBanner() {
  const pricing = useMarketingPricing()
  const sale = pricing.sale

  return (
    <div
      id="launch-banner"
      className="fixed inset-x-0 top-0 z-[51] h-[var(--marketing-banner-height)] bg-[#67EDEC] lg:static lg:z-auto"
    >
      <Link
        href="/pricing"
        className="flex h-full w-full items-center justify-center gap-1.5 px-4 text-black outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#67EDEC] sm:px-6"
      >
        <span className="line-clamp-2 min-w-0 text-center text-[12px] leading-4 font-medium tracking-normal sm:line-clamp-1 sm:text-[13px] sm:leading-5">
          {sale ? (
            <>
              <strong className="font-semibold">
                {sale.name}: {sale.percentOff}% off
              </strong>{" "}
              Pro is now{" "}
              <s className="opacity-60">{sale.regular.permanentPrice}</s>{" "}
              <strong className="font-semibold">
                {pricing.permanentPrice}
              </strong>
              , paid once. Ends {sale.endsLabel}.
            </>
          ) : (
            pricing.priceLine
          )}
        </span>
        <ArrowUpRight
          className="size-3.5 shrink-0 sm:size-4"
          strokeWidth={2}
          aria-hidden
        />
      </Link>
    </div>
  )
}
