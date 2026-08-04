import type { LucideIcon } from "lucide-react"
import {
  BadgePercent,
  BarChart3,
  Film,
  Infinity,
  Laptop,
  Layers,
  Lock,
  Monitor,
  Music2,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import type { ReactNode } from "react"

import { PricingPriceDisplay } from "@/components/macwall-marketing/pricing-price-display"
import { PricingRotatingBadge } from "@/components/macwall-marketing/pricing-rotating-badge"
import { cn } from "@/lib/utils"

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
      <span className="font-medium text-blue-300">{needle}</span>
      {feature.slice(index + needle.length)}
    </>
  )
}

function featureIcon(feature: string): LucideIcon {
  const line = feature.toLowerCase()

  if (line.includes("affordable") || line.includes("price")) return BadgePercent
  if (line.includes("more benefits") || line.includes("benefits than"))
    return Sparkles
  if (line.includes("wallpaper") || line.includes("1,000")) return Film
  if (line.includes("lock screen") || line.includes("screen saver"))
    return Monitor
  if (line.includes("import") || line.includes("your own")) return Upload
  if (line.includes("mac")) return Laptop
  if (line.includes("subscription") || line.includes("one investment"))
    return Infinity
  if (line.includes("lifetime") || line.includes("update")) return Star
  if (line.includes("music")) return Music2
  if (line.includes("everything in pro")) return Layers
  if (line.includes("larger") || line.includes("exclusive")) return BarChart3
  if (line.includes("forever") || line.includes("same pro")) return Lock

  return Sparkles
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
  featured = false,
  highlight = false,
  badge,
  badgeAlt,
  badgeLabels: badgeLabelsProp,
  highlightMacsLabel,
  topCenter,
  footer,
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
  /** Non-US: ₹… · charged in INR */
  localPriceHint?: string | null
  features: readonly string[]
  featuresPrefix?: string
  action: ReactNode
  actionSlot?: ReactNode
  showActionSlot?: boolean
  featured?: boolean
  highlight?: boolean
  badge?: string
  badgeAlt?: string
  badgeLabels?: readonly string[]
  highlightMacsLabel?: string
  topCenter?: ReactNode
  footer?: ReactNode
  className?: string
}>) {
  const isFeatured = featured || highlight
  const badgeLabels =
    badgeLabelsProp && badgeLabelsProp.length > 0
      ? [...badgeLabelsProp]
      : [
          badge ?? (isFeatured ? "Most Popular" : undefined),
          badgeAlt,
        ].filter((label): label is string => Boolean(label))

  return (
    <div className={cn("relative flex h-full flex-col pt-2.5", className)}>
      {badgeLabels.length > 0 ? (
        <PricingRotatingBadge
          labels={badgeLabels}
          className={
            isFeatured
              ? "bg-blue-800 text-[10px] font-semibold tracking-[0.08em] text-white uppercase"
              : "bg-white/10 text-[10px] font-semibold tracking-[0.08em] text-white/80 uppercase"
          }
        />
      ) : null}

      <article
        aria-labelledby={id}
        className={cn(
          "flex h-full min-h-0 flex-1 flex-col rounded-[24px] border px-5 py-5 sm:px-6 sm:py-6",
          isFeatured
            ? "border-blue-800/70 bg-secondary bg-[linear-gradient(180deg,rgba(30,64,175,0.22)_0%,transparent_48%)]"
            : "border-white/[0.08] bg-secondary"
        )}
        data-highlight={isFeatured || undefined}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-[2.75rem]">
            <h2
              id={id}
              className="font-sans text-[19px] font-normal tracking-tight text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Same height on both cards so price + features line up */}
          <div className="mt-3 flex min-h-[28px] items-center">
            {topCenter ?? <span className="invisible select-none" aria-hidden />}
          </div>

          <div className="mt-3 flex min-h-[3.75rem] flex-col justify-start">
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
          ) : null}

          <div
            className={cn(
              "mt-4 h-px w-full",
              isFeatured ? "bg-blue-800/35" : "bg-white/[0.08]"
            )}
            aria-hidden
          />

          <p className="mt-3 text-[11px] font-medium tracking-wide text-muted-foreground">
            {featuresPrefix}
          </p>

          <ul role="list" className="mt-2.5 flex-1 space-y-2">
            {features.map((feature) => {
              const Icon = featureIcon(feature)
              return (
                <li
                  key={feature}
                  className="flex gap-x-2 text-[13px] leading-snug text-foreground"
                >
                  <Icon
                    className={cn(
                      "mt-px size-3.5 shrink-0",
                      isFeatured ? "text-blue-400" : "text-muted-foreground"
                    )}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="line-clamp-2 min-w-0">
                    {highlightFeatureText(feature, highlightMacsLabel)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-5 space-y-2.5">
          <div className="flex w-full items-center [&_a]:w-full [&_button]:w-full">
            {action}
          </div>
          {footer ? (
            <div className="min-h-[2rem] text-center text-[11px] leading-relaxed text-muted-foreground">
              {footer}
            </div>
          ) : (
            <div className="min-h-[2rem]" aria-hidden />
          )}
        </div>
      </article>
    </div>
  )
}
