"use client"

import NumberFlow from "@number-flow/react"
import { useId, useState } from "react"

import {
  AFFILIATE_COMMISSION_PERCENT,
  AFFILIATE_EXAMPLE_PRICE_USD,
  macwallAffiliateCopy as copy,
} from "@/lib/macwall-affiliate-copy"

const MIN_SALES = 1
const MAX_SALES = 200
const START_SALES = 20

const PER_SALE_USD =
  (AFFILIATE_EXAMPLE_PRICE_USD * AFFILIATE_COMMISSION_PERCENT) / 100

/**
 * Sales a month in, estimated earnings out. One slider and one number: the
 * point is to make the commission concrete, not to model anything.
 */
export default function AffiliateEarningsEstimate() {
  const sliderId = useId()
  const [sales, setSales] = useState(START_SALES)
  const earnings = Math.round(sales * PER_SALE_USD)
  const fill = ((sales - MIN_SALES) / (MAX_SALES - MIN_SALES)) * 100

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
      <div>
        <h2 className="max-w-[14ch] font-display text-3xl font-normal tracking-tighter md:text-5xl">
          {copy.estimateTitle}
        </h2>
        <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.55] text-white/60">
          {copy.estimateLead}
        </p>
      </div>

      <div>
        <p
          className="text-[clamp(3.5rem,9vw,5.5rem)] leading-none font-light tracking-[-0.04em] text-white"
          aria-live="polite"
        >
          <NumberFlow
            className="tabular-nums"
            value={earnings}
            format={{
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }}
          />
          <span className="ml-3 text-[15px] font-normal tracking-normal text-white/60">
            {copy.estimateResultLabel}
          </span>
        </p>

        <label
          htmlFor={sliderId}
          className="mt-8 flex items-baseline justify-between text-[14px] text-white/60"
        >
          <span>
            <span className="text-white tabular-nums">{sales}</span>{" "}
            {copy.estimateSalesLabel}
          </span>
          <span className="tabular-nums">
            {AFFILIATE_COMMISSION_PERCENT}% of ${AFFILIATE_EXAMPLE_PRICE_USD}
          </span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={MIN_SALES}
          max={MAX_SALES}
          step={1}
          value={sales}
          onChange={(event) => setSales(Number(event.target.value))}
          className="mt-3 h-11 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[image:var(--track)] [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[image:var(--track)] [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-white/25"
          style={
            {
              "--track": `linear-gradient(to right, rgb(255 255 255 / 0.9) ${fill}%, rgb(255 255 255 / 0.14) ${fill}%)`,
            } as React.CSSProperties
          }
        />
        <p className="mt-4 max-w-[52ch] text-[13px] leading-[1.5] text-white/40">
          {copy.estimateNote}
        </p>
      </div>
    </div>
  )
}
