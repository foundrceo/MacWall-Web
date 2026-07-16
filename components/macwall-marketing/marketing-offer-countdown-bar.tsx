"use client"

import { useEffect, useState } from "react"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import {
  formatOfferCountdown,
  getSessionCountdownSeconds,
  OFFER_COUNTDOWN_PLACEHOLDER,
} from "@/lib/marketing-offer-countdown"
import { TrackedLink } from "@/components/analytics/tracked-link"
import { cn } from "@/lib/utils"

/**
 * Single top-of-page ribbon component.
 *
 * - Offer active: countdown timer + Pro CTA pill (separate blocks, not merged copy)
 * - Offer expired: Apple education-ribbon markup (span + StandardsLink)
 */
export default function MacWallMarketingOfferCountdownBar() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const ribbon = macwallExactCopy.ribbon

  useEffect(() => {
    const seconds = getSessionCountdownSeconds()
    setRemaining(seconds)
    if (seconds <= 0) return

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (remaining === 0) {
    return (
      <div
        className="MacWallRibbon MacWallRibbon--bg-neutral MacWallRibbon--row MacWallRibbon--animate"
        id="macwall-announcement-ribbon"
        data-analytics-activitymap-region-id="macwall announcement ribbon"
      >
        <div className="MacWallRibbonContentWrapper">
          <p className="MacWallRibbonColumn MacWallRibbonContent MacWallRibbonLarge10 MacWallRibbonLargeCentered">
            <span>{ribbon.lineBeforeLink}</span>
            <TrackedLink
              href={macwallInstallerLatestPath}
              eventName="download_click"
              metadata={{ location: "offer_bar_announcement" }}
              className="MacWallRibbonLink MacWallStandardsLink MacWallStandardsLinkIconWrapper"
              aria-label={ribbon.linkText}
            >
              <span className="MacWallStandardsLinkCopy">
                <span>{ribbon.linkText}</span>
              </span>
              <span
                className="MacWallStandardsLinkIcon MacWallStandardsLinkIconAfter MacWallStandardsLinkIconMore"
                aria-hidden
              />
            </TrackedLink>
          </p>
        </div>
      </div>
    )
  }

  const { hours, minutes, seconds } =
    remaining === null
      ? OFFER_COUNTDOWN_PLACEHOLDER
      : formatOfferCountdown(remaining)

  return (
    <aside
      className="MacWallOfferBar"
      data-analytics-activitymap-region-id="macwall offer countdown bar"
      aria-label="Limited time offer"
    >
      <div className="MacWallOfferBarInner">
        <div className="MacWallOfferBarTimer">
          <span className="MacWallOfferBarLabel">OFFER VALID FOR</span>
          <div
            className="MacWallOfferBarClock"
            aria-live="polite"
            aria-atomic="true"
            aria-busy={remaining === null}
          >
            <span className="MacWallOfferBarDigitGroup">
              <span
                className={cn(
                  "MacWallOfferBarDigit",
                  remaining === null && "MacWallOfferBarDigit--placeholder"
                )}
              >
                {hours}
              </span>
            </span>
            <span className="MacWallOfferBarColon">:</span>
            <span className="MacWallOfferBarDigitGroup">
              <span
                className={cn(
                  "MacWallOfferBarDigit",
                  remaining === null && "MacWallOfferBarDigit--placeholder"
                )}
              >
                {minutes}
              </span>
            </span>
            <span className="MacWallOfferBarColon">:</span>
            <span className="MacWallOfferBarDigitGroup">
              <span
                className={cn(
                  "MacWallOfferBarDigit",
                  remaining === null && "MacWallOfferBarDigit--placeholder"
                )}
              >
                {seconds}
              </span>
            </span>
          </div>
        </div>

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
