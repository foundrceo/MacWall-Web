"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"

const TIMER_STORAGE_KEY = "macwall_sale_deadline_ms"
const DAY_MS = 24 * 60 * 60 * 1000

type Remaining = {
  hours: string
  minutes: string
  seconds: string
}

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0")
}

function remainingFromDeadline(deadlineMs: number, nowMs: number): Remaining {
  const totalSec = Math.max(0, Math.floor((deadlineMs - nowMs) / 1000))
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  return {
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  }
}

function readOrCreateDeadline(nowMs: number): number {
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY)
    const parsed = raw ? Number(raw) : NaN
    if (Number.isFinite(parsed) && parsed > nowMs) {
      return parsed
    }
  } catch {
    // localStorage unavailable — fall through
  }

  const deadline = nowMs + DAY_MS
  try {
    window.localStorage.setItem(TIMER_STORAGE_KEY, String(deadline))
  } catch {
    // ignore write failures
  }
  return deadline
}

function BannerCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null)

  useEffect(() => {
    let deadline = readOrCreateDeadline(Date.now())

    const tick = () => {
      const now = Date.now()
      if (deadline <= now) {
        deadline = now + DAY_MS
        try {
          window.localStorage.setItem(TIMER_STORAGE_KEY, String(deadline))
        } catch {
          // ignore
        }
      }
      setRemaining(remainingFromDeadline(deadline, now))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const time = remaining ?? { hours: "24", minutes: "00", seconds: "00" }

  return (
    <span
      className="inline-flex shrink-0 items-center gap-x-1 text-[11px] font-semibold tabular-nums tracking-tight text-black sm:text-[13px]"
      aria-label={`Sale ends in ${time.hours} hours ${time.minutes} minutes ${time.seconds} seconds`}
      aria-hidden={!remaining}
    >
      <span className="font-medium text-black/55">Ends in</span>
      <span>
        {time.hours}:{time.minutes}:{time.seconds}
      </span>
    </span>
  )
}

function Dot() {
  return (
    <span className="shrink-0 text-black/25" aria-hidden>
      ·
    </span>
  )
}

/** Launch offer strip above the navbar — tease the deal, drive to pricing. */
export default function AnnouncementBanner() {
  const pricing = useMarketingPricing()

  return (
    <div id="launch-banner" className="launch-banner">
      <Link
        href="/pricing"
        className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-y-0.5 px-3 text-center transition-opacity hover:opacity-80 sm:flex-row sm:flex-wrap sm:gap-x-2 sm:gap-y-0 sm:px-4"
      >
        <span className="max-w-full text-[11px] font-semibold tracking-tight text-balance text-black sm:truncate sm:text-[13px]">
          {pricing.isIndia ? (
            <span aria-hidden className="mr-1">
              🇮🇳
            </span>
          ) : null}
          {pricing.bannerHeadline}
        </span>

        <span className="hidden sm:inline" aria-hidden>
          <Dot />
        </span>

        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2">
          <span className="inline-flex shrink-0 items-baseline gap-x-1 text-[11px] sm:text-[13px]">
            <span className="font-medium text-black/55">Pro</span>
            <span className="text-black/40 line-through decoration-black/45 decoration-1">
              {pricing.bannerStrikePrice}
            </span>
            <span className="font-semibold text-black tabular-nums">
              {pricing.bannerSalePrice}
            </span>
          </span>

          <Dot />

          <BannerCountdown />

          <Dot />

          <span className="shrink-0 text-[11px] font-semibold text-black sm:text-[13px]">
            {pricing.bannerCta}
          </span>
        </span>
      </Link>
    </div>
  )
}
