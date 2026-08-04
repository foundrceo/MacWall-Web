"use client"

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import { prefetchCheckoutSession } from "@/lib/checkout/prefetch-checkout"
import type { MarketingMultiMacOffer } from "@/lib/pricing/marketing-pricing"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const pricingMutedButtonClass =
  "inline-flex h-8 min-h-8 w-full items-center justify-center rounded-full bg-white/[0.08] px-3.5 text-[14px] font-medium text-white no-underline ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12]"

const PICKER_NAME = "tier-picker-pro-plus-macs"

function featureLinesForMacs(
  baseFeatures: readonly string[],
  macs: number
): string[] {
  return baseFeatures.map((feature) =>
    feature.includes("5 Macs") || feature.includes("5 Mac")
      ? `Up to ${macs} Mac`
      : feature
  )
}

/** Sliding pill radio control — same pattern as the Pro / Pro+ / Ultra picker. */
function MacPackPillPicker({
  offers,
  selectedMacs,
  onSelect,
}: Readonly<{
  offers: readonly MarketingMultiMacOffer[]
  selectedMacs: number
  onSelect: (macs: number) => void
}>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLLabelElement | null)[]>([])
  const [thumb, setThumb] = useState({ left: 2, width: 0 })

  const selectedIndex = Math.max(
    0,
    offers.findIndex((o) => o.macs === selectedMacs)
  )

  useLayoutEffect(() => {
    const track = trackRef.current
    const label = labelRefs.current[selectedIndex]
    if (!track || !label) return

    const trackBox = track.getBoundingClientRect()
    const labelBox = label.getBoundingClientRect()
    setThumb({
      left: labelBox.left - trackBox.left,
      width: labelBox.width,
    })
  }, [selectedIndex, offers])

  useEffect(() => {
    const onResize = () => {
      const track = trackRef.current
      const label = labelRefs.current[selectedIndex]
      if (!track || !label) return
      const trackBox = track.getBoundingClientRect()
      const labelBox = label.getBoundingClientRect()
      setThumb({
        left: labelBox.left - trackBox.left,
        width: labelBox.width,
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [selectedIndex])

  return (
    <div
      ref={trackRef}
      className="relative flex w-fit rounded-full bg-white/[0.06] p-0.5 text-center ring-1 ring-white/10"
      role="radiogroup"
      aria-label="Choose how many Macs"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-white transition-all duration-300 ease-out"
        style={{
          left: thumb.left,
          width: thumb.width,
          top: 2,
          bottom: 2,
        }}
      />
      {offers.map((offer, index) => {
        const active = offer.macs === selectedMacs
        return (
          <label
            key={offer.slug}
            ref={(el) => {
              labelRefs.current[index] = el
            }}
            className="group relative cursor-pointer whitespace-nowrap rounded-full border border-transparent px-2 py-1 text-[10px] leading-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-secondary"
            onPointerEnter={() => {
              void prefetchCheckoutSession(offer.slug)
            }}
          >
            <input
              className="absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
              type="radio"
              name={PICKER_NAME}
              value={String(offer.macs)}
              checked={active}
              onChange={() => onSelect(offer.macs)}
            />
            <span
              className={cn(
                "relative z-10 whitespace-nowrap transition-colors",
                active
                  ? "text-black"
                  : "text-foreground/70 group-hover:text-foreground"
              )}
            >
              {offer.macs} Mac
            </span>
          </label>
        )
      })}
    </div>
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
  badge,
  buttonClassName,
  footer,
}: Readonly<{
  offers: readonly MarketingMultiMacOffer[]
  title: string
  subtitle: string
  featuresPrefix: string
  features: readonly string[]
  cta: string
  badge?: string
  buttonClassName?: string
  footer?: ReactNode
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
      highlightMacsLabel={`${selected.macs} Mac`}
      badge={badge}
      topCenter={
        <MacPackPillPicker
          offers={sorted}
          selectedMacs={selected.macs}
          onSelect={setMacs}
        />
      }
      action={
        <TrackedPricingButton
          href={selected.checkoutUrl}
          location={`pricing_multi_mac_${selected.macs}`}
          ariaLabel={`Invest in ${macwall.name} Pro Plus for ${selected.macs} Macs at ${selected.price}`}
          size="pill"
          className={cn(pricingMutedButtonClass, buttonClassName)}
        >
          {cta}
        </TrackedPricingButton>
      }
      footer={footer}
    />
  )
}
