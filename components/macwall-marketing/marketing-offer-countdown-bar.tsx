"use client"

import { useEffect, useState } from "react"
import { macwall } from "@/lib/macwall-site"
import { TrackedLink } from "@/components/analytics/tracked-link"

/**
 * Generate a random countdown duration between 1 and 6 hours (in seconds).
 * Seeded per-session via sessionStorage so it stays consistent across
 * re-renders but resets on new visits — creating genuine urgency each session.
 */
function getSessionCountdownSeconds(): number {
  const STORAGE_KEY = "macwall_offer_countdown"
  const STORAGE_TS_KEY = "macwall_offer_countdown_ts"

  if (typeof window === "undefined") return 3 * 3600 // SSR fallback

  const now = Date.now()
  const savedTs = sessionStorage.getItem(STORAGE_TS_KEY)
  const savedDuration = sessionStorage.getItem(STORAGE_KEY)

  if (savedTs && savedDuration) {
    const elapsed = Math.floor((now - Number(savedTs)) / 1000)
    const remaining = Number(savedDuration) - elapsed
    if (remaining > 0) return remaining
  }

  // Random between 1h and 6h
  const fresh = Math.floor(Math.random() * (6 - 1) * 3600) + 1 * 3600
  sessionStorage.setItem(STORAGE_KEY, String(fresh))
  sessionStorage.setItem(STORAGE_TS_KEY, String(now))
  return fresh
}

/** Pads a number to two digits. */
function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

/** Formats seconds into HH : MM : SS. */
function formatCountdown(totalSeconds: number): {
  hours: string
  minutes: string
  seconds: string
} {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { hours: pad(h), minutes: pad(m), seconds: pad(s) }
}

/**
 * Sticky top-of-page urgency bar.
 *
 * - Shows "OFFER VALID FOR" + live countdown
 * - Right side shows sale CTA (emoji + copy)
 * - Locale-switcher aside below the bar (Apple-style)
 */
export default function MacWallMarketingOfferCountdownBar() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    setRemaining(getSessionCountdownSeconds())
  }, [])

  useEffect(() => {
    if (remaining === null || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [remaining])

  if (remaining === null || remaining <= 0) return null

  const { hours, minutes, seconds } = formatCountdown(remaining)

  return (
    <aside
      id="ac-localeswitcher"
      className="MacWallOfferBar"
      data-analytics-region="locale switcher"
      data-analytics-activitymap-region-id="locale switcher"
      lang="en-IN"
      dir="ltr"
      aria-label="Limited time offer"
      role="banner"
    >
      <div className="MacWallOfferBarInner">
        {/* Left: timer */}
        <div className="MacWallOfferBarTimer">
          <span className="MacWallOfferBarLabel">OFFER VALID FOR</span>
          <div className="MacWallOfferBarClock" aria-live="polite" aria-atomic="true">
            <span className="MacWallOfferBarDigitGroup">
              <span className="MacWallOfferBarDigit">{hours}</span>
            </span>
            <span className="MacWallOfferBarColon">:</span>
            <span className="MacWallOfferBarDigitGroup">
              <span className="MacWallOfferBarDigit">{minutes}</span>
            </span>
            <span className="MacWallOfferBarColon">:</span>
            <span className="MacWallOfferBarDigitGroup">
              <span className="MacWallOfferBarDigit">{seconds}</span>
            </span>
          </div>
        </div>

        {/* Right: CTA */}
        <TrackedLink
          href="/pricing"
          eventName="cta_click"
          metadata={{ location: "offer_countdown_bar" }}
          className="MacWallOfferBarCta"
        >
          <span className="MacWallOfferBarCtaEmoji" aria-hidden="true">
            😱
          </span>
          <span className="MacWallOfferBarCtaCopy">
            <span className="MacWallOfferBarCtaLine1">
              {macwall.pro.headline}
            </span>
            <span className="MacWallOfferBarCtaLine2">
              Get Pro for {macwall.pro.price}{" "}
              <s className="MacWallOfferBarStrike">{macwall.pro.strikePrice}</s>
            </span>
          </span>
        </TrackedLink>
      </div>
    </aside>
  )
}
