"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { isVisitorFromIndia } from "@/lib/geo/country-client"

/** Full-bleed offer strip. India vs rest from cookie, then /api/pricing. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()
  const [india, setIndia] = useState(false)

  useEffect(() => {
    setIndia(isVisitorFromIndia())
  }, [])

  useEffect(() => {
    setIndia(pricing.isIndia || isVisitorFromIndia())
  }, [pricing.isIndia])

  const now = india ? "$3.99" : "$7.99"
  const soon = india ? "$4.99" : "$9.99"
  const flag = india ? "🇮🇳" : "🔥"

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
          {flag} Last 10 Pro licenses at {now}: after they&apos;re gone, the
          price is {soon}
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
