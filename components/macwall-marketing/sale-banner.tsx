"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import {
  Diya,
  DiwaliLights,
  useTimeLeft,
} from "@/components/macwall-marketing/diwali-decor"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { cn } from "@/lib/utils"

/**
 * Full-bleed sale strip above the navbar while any `SITE_SALES` entry runs.
 * Same slot and height as `AnnouncementBanner`. Content follows the
 * visitor's regional sale (Diwali for India, Black Friday elsewhere) and
 * drops back to the plain price line when their region has none.
 */
export default function SaleBanner() {
  const pricing = useMarketingPricing()
  const sale = pricing.sale
  const diwali = sale?.theme === "diwali"
  const timeLeft = useTimeLeft(diwali ? sale.endsAt : null)

  return (
    <div
      id="launch-banner"
      className={cn(
        "fixed inset-x-0 top-0 z-[51] h-[var(--marketing-banner-height)] lg:relative",
        diwali
          ? "bg-[linear-gradient(90deg,#3A0A12_0%,#6B1A0C_50%,#3A0A12_100%)] text-[#FFE3A3]"
          : "bg-[#67EDEC] text-black lg:z-auto"
      )}
    >
      <Link
        href="/pricing"
        className={cn(
          "flex h-full w-full items-center justify-center gap-1.5 px-4 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-2 sm:px-6",
          diwali
            ? "focus-visible:ring-[#FFC93C]/60 focus-visible:ring-offset-[#3A0A12]"
            : "focus-visible:ring-black/30 focus-visible:ring-offset-[#67EDEC]"
        )}
      >
        {diwali ? <Diya className="size-5 sm:size-6" /> : null}
        <span className="line-clamp-2 min-w-0 text-center text-[12px] leading-4 font-medium tracking-normal sm:line-clamp-1 sm:text-[13px] sm:leading-5">
          {sale ? (
            <>
              <strong
                className={cn("font-semibold", diwali && "text-[#FFC93C]")}
              >
                {sale.name}: {sale.percentOff}% off
              </strong>{" "}
              Pro is now{" "}
              <s className="opacity-60">{sale.regular.permanentPrice}</s>{" "}
              <strong className="font-semibold">
                {pricing.permanentPrice}
              </strong>
              {diwali ? (
                <>
                  <span className="hidden sm:inline">, paid once</span>. Ends{" "}
                  {sale.endsLabel}
                  {timeLeft ? ` · ${timeLeft}` : ""}
                  <span className="hidden sm:inline">
                    , grab it before it&apos;s gone
                  </span>
                  .
                </>
              ) : (
                <>, paid once. Ends {sale.endsLabel}.</>
              )}
            </>
          ) : (
            pricing.priceLine
          )}
        </span>
        {diwali ? (
          <Diya className="hidden size-6 sm:block" />
        ) : (
          <ArrowUpRight
            className="size-3.5 shrink-0 sm:size-4"
            strokeWidth={2}
            aria-hidden
          />
        )}
      </Link>
      {diwali ? <DiwaliLights className="absolute inset-x-0 top-full" /> : null}
    </div>
  )
}
