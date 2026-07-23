"use client"

import { useState } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { indiaPromo } from "@/lib/marketing-india-promo"
import { useIndiaPromoCountdown } from "@/lib/marketing/use-india-promo-countdown"
import {
  CheckIcon,
  MarketingCard,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwall } from "@/lib/macwall-site"

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

/** India Pro plan card — same shell as Pro / Pro Plus for a balanced two-column row. */
export default function IndiaPricingOffer() {
  const pricing = useMarketingPricing()
  const {
    countdownLabel,
    ready: countdownReady,
  } = useIndiaPromoCountdown(pricing.showIndiaOfferCard)

  if (!pricing.showIndiaOfferCard) return null

  return (
    <MarketingCard
      id={indiaPromo.pricingAnchor}
      className="MacWallPricingPlanCard MacWallIndiaOfferCard MacWallPricingPlanCard--highlighted"
    >
      <div className="MacWallIndiaOfferAccent" aria-hidden />

      <div className="MacWallPricingPlanHead">
        <p className="MacWallIndiaOfferBadge">{indiaPromo.pricing.badge}</p>
        <h2 className="MacWallPricingPlanTitle">Pro</h2>
        <h3 className="MacWallPricingPlanDescription">
          {indiaPromo.pricing.hook}
        </h3>
      </div>

      <div className="MacWallPricingPlanDivider" aria-hidden />

      <ul className="MacWallPricingPlanCardFeatures MacWallPricingProFeatures">
        <li className="MacWallPricingProFeature">
          <CheckIcon />
          <span>
            <strong>{indiaPromo.discountPercent}% off</strong> with{" "}
            {indiaPromo.code} at checkout
          </span>
        </li>
        <li className="MacWallPricingProFeature">
          <CheckIcon />
          <span>Up to {macwall.maxLicensedMacs} personal Macs</span>
        </li>
        <li className="MacWallPricingProFeature">
          <CheckIcon />
          <span>Full catalog + Lock Screen video</span>
        </li>
        <li className="MacWallPricingProFeature MacWallIndiaOfferCountdownFeature">
          <CheckIcon />
          <span className="MacWallIndiaOfferCountdownInline">
            {countdownReady
              ? `${countdownLabel} left on your timer`
              : "Starting your 24-hour timer…"}
          </span>
        </li>
      </ul>

      <div className="MacWallPricingPlanCardCta MacWallIndiaOfferCtaStack">
        <PromoCodeCopy />
        <TrackedPricingButton
          href={pricing.checkoutUrl}
          location="india_pricing_offer"
          ariaLabel={pricing.buyProAria}
        >
          {pricing.buyProCta}
        </TrackedPricingButton>
      </div>
    </MarketingCard>
  )
}