import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  macwall,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallTrial,
} from "@/lib/macwall-site"
import {
  formatPriceCents,
  proPriceFor,
  type SaleAwarePrice,
} from "@/lib/pricing/sale-aware-price"

import { DefaultPricingOnly, ProPriceInline } from "./pro-price-inline"

/** "macOS 26", without the release name, for a short sentence. */
const LOCK_SCREEN_MACOS = macwallLockScreenMacOSVersion.replace(
  /\s*\(.*\)$/,
  ""
)

/** The price as the server renders it: the sale price after the struck regular one. */
function PriceText({ price }: Readonly<{ price: SaleAwarePrice }>) {
  if (price.saleCents === null)
    return <>{formatPriceCents(price.currentCents)}</>
  return (
    <>
      <s className="tabular-nums opacity-60">
        <span className="sr-only">Regular price </span>
        {formatPriceCents(price.regularCents)}
      </s>{" "}
      {formatPriceCents(price.currentCents)}
    </>
  )
}

/**
 * A short, answer-first definition of the product before the FAQ: what it is,
 * what it costs and what it needs, in one paragraph an answer engine can
 * quote. Facts come from lib/macwall-site.ts and the price from the
 * sale-aware helper (the sale-boundary cron re-renders the page when a sale
 * starts or ends).
 */
export function WhatIsMacWall({ now }: Readonly<{ now?: number }>) {
  const pro = proPriceFor("default", now)

  return (
    <MarketingSection
      id="what-is-macwall"
      aria-labelledby="what-is-macwall-heading"
    >
      <LandingSectionHeader
        id="what-is-macwall-heading"
        title={`What is ${macwall.name}?`}
        lead={
          <>
            {macwall.name} is a native macOS app that plays video loops as your
            desktop, Lock Screen and screen saver wallpaper:{" "}
            {macwallCatalog.liveCountLabel} live wallpapers, most in 4K, plus
            your own videos with Pro. Every Mac gets a {macwallTrial.name}, then
            Pro is{" "}
            <ProPriceInline>
              <PriceText price={pro} />
            </ProPriceInline>{" "}
            once for {pro.macs} Macs.
            {pro.saleCents !== null && pro.label && pro.endsLabel ? (
              <DefaultPricingOnly>
                {" "}
                {pro.label}: {pro.percentOff}% off until {pro.endsLabel}.
              </DefaultPricingOnly>
            ) : null}{" "}
            It runs on {macwallMinimumMacOSVersion} or later; the live Lock
            Screen needs {LOCK_SCREEN_MACOS}.
          </>
        }
      />
    </MarketingSection>
  )
}
