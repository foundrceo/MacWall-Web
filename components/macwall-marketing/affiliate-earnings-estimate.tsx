"use client"

import NumberFlow from "@number-flow/react"
import { useId, useState, type CSSProperties } from "react"

import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import {
  AFFILIATE_COMMISSION_PERCENT,
  AFFILIATE_EXAMPLE_EARNING,
  AFFILIATE_EXAMPLE_PRICE_USD,
  macwallAffiliateCopy as copy,
} from "@/lib/macwall-affiliate-copy"

const MIN_SALES = 1
const MAX_SALES = 200
const START_SALES = 20

const PER_SALE_USD =
  (AFFILIATE_EXAMPLE_PRICE_USD * AFFILIATE_COMMISSION_PERCENT) / 100

/** The three facts the estimate is built from, shown under the slider. */
const FACTS = [
  { label: "Per sale", value: AFFILIATE_EXAMPLE_EARNING },
  { label: "Commission", value: `${AFFILIATE_COMMISSION_PERCENT}%` },
  { label: "Link tracks for", value: `${AFFONSO_COOKIE_DURATION_DAYS} days` },
] as const

/**
 * Sales a month in, estimated earnings out. It sits straight on the page: a
 * centred heading, one large number, one slider and the three facts behind
 * the sum. The point is to make the commission concrete, not to model it.
 */
export default function AffiliateEarningsEstimate({
  headingId,
}: Readonly<{ headingId?: string }>) {
  const sliderId = useId()
  const [sales, setSales] = useState(START_SALES)
  const earnings = Math.round(sales * PER_SALE_USD)
  const fill = ((sales - MIN_SALES) / (MAX_SALES - MIN_SALES)) * 100

  return (
    <div className="flex flex-col items-center text-center">
      <LandingSectionHeader
        id={headingId}
        align="center"
        title={copy.estimateTitle}
        lead={copy.estimateLead}
        className="pb-10 lg:pb-12"
      />

      <p
        className="flex items-baseline justify-center gap-3 text-white"
        aria-live="polite"
      >
        <NumberFlow
          className="text-[clamp(5rem,16vw,9.5rem)] leading-none font-light tracking-[-0.045em] tabular-nums"
          value={earnings}
          format={{
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }}
        />
        <span className="text-[17px] leading-7 text-ink-2">
          {copy.estimateResultLabel}
        </span>
      </p>

      <div className="mt-10 w-full max-w-[640px] lg:mt-12">
        <label
          htmlFor={sliderId}
          className="block text-[15px] leading-6 text-ink-2"
        >
          <span className="text-ink tabular-nums">{sales}</span>{" "}
          {copy.estimateSalesLabel}
        </label>
        <input
          id={sliderId}
          type="range"
          min={MIN_SALES}
          max={MAX_SALES}
          step={1}
          value={sales}
          onChange={(event) => setSales(Number(event.target.value))}
          className="mt-2 h-11 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[image:var(--track)] [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[image:var(--track)] [&::-webkit-slider-thumb]:-mt-[9px] [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgb(0_0_0/0.5)] focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-white/25"
          style={
            {
              "--track": `linear-gradient(to right, rgb(255 255 255 / 0.92) ${fill}%, rgb(255 255 255 / 0.14) ${fill}%)`,
            } as CSSProperties
          }
        />
        <div
          className="flex justify-between text-[13px] leading-5 text-ink-3 tabular-nums"
          aria-hidden
        >
          <span>{MIN_SALES}</span>
          <span>{MAX_SALES}</span>
        </div>

        <dl className="mt-10 grid grid-cols-3 divide-x divide-hairline border-y border-hairline">
          {FACTS.map((fact) => (
            <div key={fact.label} className="px-2 py-6">
              <dt className="text-[13px] leading-5 text-ink-3">{fact.label}</dt>
              <dd className="mt-1 text-[22px] leading-7 font-medium tracking-tight text-ink tabular-nums">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mx-auto mt-6 max-w-[52ch] text-[13px] leading-5 text-ink-3">
          {copy.estimateNote}
        </p>
      </div>
    </div>
  )
}
