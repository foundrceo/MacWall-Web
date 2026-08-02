"use client"

import { useEffect, useMemo, useState } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import { GradientTracing } from "@/components/ui/gradient-tracing"
import { prefetchCheckoutSession } from "@/lib/checkout/prefetch-checkout"
import type { MarketingMultiMacOffer } from "@/lib/pricing/marketing-pricing"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const pricingPrimaryButtonClass =
  "inline-flex h-8 min-h-8 items-center justify-center rounded-full bg-white px-3.5 text-[14px] font-normal text-black no-underline transition-opacity hover:opacity-90"

function featureLinesForMacs(
  baseFeatures: readonly string[],
  macs: number
): string[] {
  return baseFeatures.map((feature) =>
    feature.includes("5 Macs") ? `Up to ${macs} Macs` : feature
  )
}

/** Pro+ card with 5 / 10 / 15 / 20 Mac pack switcher. */
export function ProPlusPackCard({
  offers,
  title,
  subtitle,
  featuresPrefix,
  features,
  cta,
}: Readonly<{
  offers: readonly MarketingMultiMacOffer[]
  title: string
  subtitle: string
  featuresPrefix: string
  features: readonly string[]
  cta: string
}>) {
  const sorted = useMemo(
    () => [...offers].sort((a, b) => a.macs - b.macs),
    [offers]
  )
  const [macs, setMacs] = useState(sorted[0]?.macs ?? 5)
  const selected = sorted.find((o) => o.macs === macs) ?? sorted[0]

  useEffect(() => {
    if (!selected?.slug) return
    void prefetchCheckoutSession(selected.slug)
  }, [selected?.slug])

  if (!selected) return null

  return (
    <PricingTierCard
      id="tier-pro-plus"
      title={title}
      subtitle={subtitle}
      price={selected.price}
      priceMajor={selected.priceMajor}
      currency="usd"
      strikePrice={selected.strikePrice}
      localPriceHint={selected.localPriceHint}
      priceSuffix="one-time"
      features={featureLinesForMacs(features, selected.macs)}
      featuresPrefix={featuresPrefix}
      badge={selected.offLabel}
      highlightMacsLabel={`${selected.macs} Macs`}
      showActionSlot
      actionSlot={
        <div className="flex w-full flex-col gap-2.5">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Choose how many Macs"
          >
            {sorted.map((offer) => {
              const active = offer.macs === selected.macs
              return (
                <button
                  key={offer.slug}
                  type="button"
                  onClick={() => setMacs(offer.macs)}
                  onPointerEnter={() => {
                    void prefetchCheckoutSession(offer.slug)
                  }}
                  className={cn(
                    "inline-flex h-6 items-center rounded-full px-2 text-[11px] transition",
                    active
                      ? "bg-white text-black"
                      : "bg-white/10 text-foreground/80 hover:bg-white/15"
                  )}
                  aria-pressed={active}
                >
                  {offer.macs} Macs
                </button>
              )
            })}
          </div>
          <GradientTracing
            width={160}
            height={12}
            baseColor="white"
            gradientColors={["#F1C40F", "#F1C40F", "#E67E22"]}
            strokeWidth={1.5}
            animationDuration={2.2}
          />
        </div>
      }
      action={
        <TrackedPricingButton
          href={selected.checkoutUrl}
          location={`pricing_multi_mac_${selected.macs}`}
          ariaLabel={`Buy ${macwall.name} Pro Plus for ${selected.macs} Macs at ${selected.price}`}
          size="pill"
          className={pricingPrimaryButtonClass}
        >
          {cta}
        </TrackedPricingButton>
      }
    />
  )
}
