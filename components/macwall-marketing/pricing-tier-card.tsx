import type { ReactNode } from "react"

import { PricingPriceDisplay } from "@/components/macwall-marketing/pricing-price-display"
import { PricingRotatingBadge } from "@/components/macwall-marketing/pricing-rotating-badge"
import { cn } from "@/lib/utils"

/** Newspaper-style yellow marker on key phrases inside feature lines. */
function highlightFeatureText(
  feature: string,
  highlightMacsLabel?: string
): ReactNode {
  const needle = highlightMacsLabel?.trim() || "5 Mac"
  const index = feature.indexOf(needle)
  if (index === -1) return feature

  return (
    <>
      {feature.slice(0, index)}
      <mark className="rounded-[3px] bg-yellow-300 px-1 py-px font-medium text-black [box-decoration-break:clone]">
        {needle}
      </mark>
      {feature.slice(index + needle.length)}
    </>
  )
}

export function PricingTierCard({
  id,
  title,
  subtitle,
  price,
  priceMajor,
  currency = "usd",
  priceSuffix,
  strikePrice,
  localPriceHint,
  features,
  featuresPrefix = "Benefits:",
  action,
  actionSlot,
  showActionSlot = false,
  highlight = false,
  badge,
  badgeAlt,
  highlightMacsLabel,
  topCenter,
  className,
}: Readonly<{
  id: string
  title: string
  subtitle: string
  price: ReactNode
  priceMajor?: number
  currency?: string
  priceSuffix?: ReactNode
  strikePrice?: string | null
  /** Non-US: ≈ ₹… · charged in INR */
  localPriceHint?: string | null
  features: readonly string[]
  featuresPrefix?: string
  action: ReactNode
  actionSlot?: ReactNode
  showActionSlot?: boolean
  highlight?: boolean
  badge?: string
  /** Optional second label — rotates with `badge` via motion */
  badgeAlt?: string
  /** Yellow-mark this Macs label inside features (e.g. "10 Macs"). */
  highlightMacsLabel?: string
  /** Above the card, right-aligned (e.g. Pro+ Mac pack picker). */
  topCenter?: ReactNode
  className?: string
}>) {
  const badgeLabels = [
    badge ?? (highlight ? "Most Popular" : undefined),
    badgeAlt,
  ].filter((label): label is string => Boolean(label))

  return (
    <div className={cn("relative h-full pt-2.5", className)}>
      {badgeLabels.length > 0 ? (
        <PricingRotatingBadge labels={badgeLabels} />
      ) : null}

      {topCenter ? (
        <div className="absolute top-0 right-3 z-10 sm:right-4">
          {topCenter}
        </div>
      ) : null}

      <article
        aria-labelledby={id}
        className="flex h-full flex-col rounded-[24px] bg-secondary px-5 py-6 sm:px-6 sm:py-7"
        data-highlight={highlight || undefined}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <h2
            id={id}
            className="font-sans text-[19px] font-normal tracking-tight text-foreground"
          >
            {title}
          </h2>

          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            {subtitle}
          </p>

          {/* Fixed price-block height so feature prefixes align across cards */}
          <div className="mt-3.5 flex min-h-[3.75rem] flex-col justify-start">
            <p className="flex min-h-[2rem] flex-wrap items-baseline gap-x-2">
              <PricingPriceDisplay
                price={price}
                priceMajor={priceMajor}
                currency={currency}
                className="text-[1.75rem] font-normal tracking-tight text-foreground"
              />
              {strikePrice ? (
                <span
                  className="text-[14px] text-muted-foreground line-through decoration-muted-foreground decoration-1"
                  aria-label={`Was ${strikePrice}`}
                >
                  {strikePrice}
                </span>
              ) : null}
              {priceSuffix ? (
                <span className="text-[12px] text-muted-foreground">
                  {priceSuffix}
                </span>
              ) : null}
            </p>
            <p
              className={cn(
                "mt-1 min-h-[1.125rem] text-[12px] leading-snug text-muted-foreground",
                !localPriceHint && "invisible select-none"
              )}
              aria-hidden={!localPriceHint}
            >
              {localPriceHint ?? "\u00a0"}
            </p>
          </div>

          {showActionSlot || actionSlot ? (
            <div className="mt-2 flex min-h-4 items-center">{actionSlot}</div>
          ) : (
            <div className="mt-3 min-h-5" aria-hidden />
          )}

          <p
            className={cn(
              "text-[11px] font-medium tracking-wide text-muted-foreground",
              showActionSlot || actionSlot ? "mt-3" : "mt-5"
            )}
          >
            {featuresPrefix}
          </p>

          <ul role="list" className="mt-2.5 space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex gap-x-2 text-[13px] leading-snug text-foreground"
              >
                <span
                  className="mt-px shrink-0 text-[12px] text-muted-foreground"
                  aria-hidden
                >
                  ✓
                </span>
                <span className="line-clamp-2 min-w-0">
                  {highlightFeatureText(feature, highlightMacsLabel)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-start">{action}</div>
      </article>
    </div>
  )
}
