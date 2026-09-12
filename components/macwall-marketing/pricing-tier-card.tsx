import type { LucideIcon } from "lucide-react"
import {
  BadgePercent,
  Battery,
  Film,
  FlipVertical2,
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

  if (line.includes("bend") || line.includes("lid") || line.includes("fold"))
    return FlipVertical2
  if (line.includes("affordable") || line.includes("price")) return BadgePercent
  if (line.includes("wallpaper") || line.includes("1,000")) return Film
  if (line.includes("lock screen") || line.includes("screen saver"))
    return Monitor
  if (line.includes("import") || line.includes("your own")) return Upload
  if (line.includes("hardware") || line.includes("multi-display")) return Monitor
  if (line.includes("lower price")) return BadgePercent
  if (line.includes("battery") || line.includes("pauses")) return Battery
  if (line.includes("switch macs") || line.includes("license")) return Laptop
  if (line.includes("mac")) return Laptop
  if (line.includes("subscription") || line.includes("one payment"))
    return Infinity
  if (line.includes("lifetime") || line.includes("update")) return Star
  if (line.includes("music")) return Music2
  if (line.includes("everything in pro") || line.includes("including bend"))
    return Layers
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
  reserveTopCenterSlot = false,
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
  reserveTopCenterSlot?: boolean
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

  const showTopCenterRow = Boolean(topCenter) || reserveTopCenterSlot

  return (
    <div className={cn("relative flex h-full flex-col pt-2.5", className)}>
      {badgeLabels.length > 0 ? (
        <PricingRotatingBadge
          labels={badgeLabels}
          className={
            isFeatured
              ? "rounded-full bg-blue-800 px-2.5 py-0.5 text-[11px] leading-4 font-medium tracking-normal text-white normal-case"
              : "rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] leading-4 font-medium text-white"
          }
        />
      ) : null}

      <article
        aria-labelledby={id}
        className={cn(
          "flex h-full min-h-0 flex-1 flex-col rounded-2xl border px-5 py-5 shadow-none sm:px-6 sm:py-6",
          isFeatured
            ? "border-blue-800/70 bg-[#171717] bg-[linear-gradient(180deg,rgba(30,64,175,0.22)_0%,transparent_48%)]"
            : "border-landing-rule bg-[#111]"
        )}
        data-highlight={isFeatured || undefined}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-[3.25rem]">
            <h2
              id={id}
              className="font-sans text-[19px] font-normal tracking-tight text-white"
            >
              {title}
            </h2>
            <p className="mt-1 min-h-[2.5rem] text-[13px] leading-snug text-landing-muted">
              {subtitle}
            </p>
          </div>

          {showTopCenterRow ? (
            <div className="mt-3 flex min-h-[28px] items-center">
              {topCenter ?? (
                <div
                  className="invisible flex w-fit rounded-full p-0.5 ring-1 ring-transparent"
                  aria-hidden
                >
                  <span className="px-2 py-1 text-[10px] leading-none">5 Macs</span>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-3 flex min-h-[3.75rem] flex-col justify-start">
            <p className="flex min-h-[2rem] flex-wrap items-baseline gap-x-2">
              <PricingPriceDisplay
                price={price}
                priceMajor={priceMajor}
                currency={currency}
                className="text-[36px] leading-none font-normal tracking-tight text-white"
              />
              {strikePrice ? (
                <span
                  className="font-instrument text-[14px] tabular-nums text-landing-muted line-through decoration-landing-muted decoration-1"
                  aria-label={`Was ${strikePrice}`}
                >
                  {strikePrice}
                </span>
              ) : null}
              {priceSuffix ? (
                <span className="text-[12px] text-landing-muted">{priceSuffix}</span>
              ) : null}
            </p>
            <p
              className={cn(
                "mt-1 min-h-[1.125rem] font-instrument text-[12px] leading-snug tabular-nums text-landing-muted",
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
              isFeatured ? "bg-blue-800/35" : "bg-landing-rule"
            )}
            aria-hidden
          />

          <p className="mt-3 text-[11px] font-medium tracking-wide text-landing-muted">
            {featuresPrefix}
          </p>

          <ul role="list" className="mt-2.5 min-h-[12.5rem] flex-1 space-y-2.5">
            {features.map((feature) => {
              const Icon = featureIcon(feature)
              return (
                <li
                  key={feature}
                  className="flex gap-x-2.5 text-[13px] leading-snug text-zinc-200"
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      isFeatured ? "text-blue-400" : "text-landing-muted"
                    )}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    {highlightFeatureText(feature, highlightMacsLabel)}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="mt-auto space-y-2 pt-5">
            <div className="flex w-full items-center [&_a]:w-full [&_button]:w-full">
              {action}
            </div>
            {footer ? (
              <div className="pt-0.5 text-center text-[11px] leading-snug text-landing-muted sm:text-[12px]">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  )
}
