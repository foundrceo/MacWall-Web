"use client"

import { useState } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { indiaPromo } from "@/lib/marketing-india-promo"
import { useIndiaPromoCountdown } from "@/lib/marketing/use-india-promo-countdown"
import { MarketingCard } from "@/components/macwall-marketing/marketing-primitives"

import "./marketing-india-offer.css"

function PromoCodeCopy() {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(indiaPromo.code)
      setCopied(true)
      globalThis.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyCode()}
      className="MacWallIndiaOfferCodeBtn"
      aria-label={`Copy discount code ${indiaPromo.code}`}
    >
      <span className="MacWallIndiaOfferCode">{indiaPromo.code}</span>
      <span className="MacWallIndiaOfferCodeHint">
        {copied ? indiaPromo.pricing.copiedLabel : indiaPromo.pricing.copyLabel}
      </span>
    </button>
  )
}

/** India-only flash offer — pricing is prefetched on the server before render. */
export default function IndiaPricingOffer() {
  const pricing = useMarketingPricing()
  const {
    countdownLabel,
    expired,
    ready: countdownReady,
  } = useIndiaPromoCountdown(pricing.showIndiaOfferCard)

  if (!pricing.showIndiaOfferCard) return null

  return (
    <MarketingCard
      id={indiaPromo.pricingAnchor}
      className="MacWallIndiaOfferCard"
    >
      <div className="MacWallIndiaOfferAccent" aria-hidden />

      <div className="MacWallIndiaOfferLayout">
        <div className="min-w-0">
          <p className="MacWallIndiaOfferBadge">{indiaPromo.pricing.badge}</p>
          <h2 className="MacWallIndiaOfferTitle">{indiaPromo.pricing.title}</h2>
          <p className="MacWallIndiaOfferHook">{indiaPromo.pricing.hook}</p>

          <div className="MacWallIndiaOfferPriceRow">
            <span className="MacWallIndiaOfferPrice">{pricing.salePrice}</span>
            {pricing.fullPrice ? (
              <span className="MacWallIndiaOfferStrike">
                {pricing.fullPrice}
              </span>
            ) : null}
            <span className="MacWallIndiaOfferDiscount">
              {indiaPromo.discountPercent}% OFF
            </span>
          </div>

          <p
            className={
              expired
                ? "MacWallIndiaOfferCountdown MacWallIndiaOfferCountdown--expired"
                : "MacWallIndiaOfferCountdown"
            }
          >
            {countdownReady
              ? expired
                ? "24-hour window ended — try INDIA50 at checkout anyway"
                : `⏳ ${countdownLabel} left on your personal timer`
              : "⏳ Starting your 24-hour timer…"}
          </p>

          <p className="MacWallIndiaOfferMeta">
            {indiaPromo.pricing.lifetimeNote} · Live Whop price ·{" "}
            {indiaPromo.code} at checkout
          </p>
        </div>

        <div className="MacWallIndiaOfferActions">
          <PromoCodeCopy />
          <TrackedPricingButton
            href={pricing.checkoutUrl}
            location="india_pricing_offer"
            ariaLabel={pricing.buyProAria}
            size="pill"
            className="MacWallIndiaOfferCta"
          >
            {pricing.buyProCta}
          </TrackedPricingButton>
          <p className="MacWallIndiaOfferFootnote">
            {indiaPromo.pricing.checkoutNote}
          </p>
        </div>
      </div>
    </MarketingCard>
  )
}
