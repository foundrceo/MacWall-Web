"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useSyncExternalStore } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { isVisitorFromIndia } from "@/lib/geo/country-client"

const noopSubscribe = () => () => {}

/** Full-bleed offer strip. India vs rest from cookie, then /api/pricing. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()
  // Cookie is client-only: false during SSR, real value after hydration.
  const indiaCookie = useSyncExternalStore(
    noopSubscribe,
    isVisitorFromIndia,
    () => false
  )
  const flag = pricing.isIndia || indiaCookie ? "🇮🇳" : "🔥"

  return (
    <div
      id="launch-banner"
      className="fixed inset-x-0 top-0 z-[51] h-[var(--marketing-banner-height)] bg-[#67EDEC] lg:static lg:z-auto"
    >
      <Link
        href="/pricing"
        className="flex h-full w-full items-center justify-center gap-1.5 px-4 text-black outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#67EDEC] sm:px-6"
      >
        <span className="min-w-0 truncate text-[12px] leading-4 font-medium tracking-normal sm:text-[13px] sm:leading-5">
          {flag} {pricing.bannerText}
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
