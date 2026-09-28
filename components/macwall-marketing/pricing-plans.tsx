"use client"

import {
  ArrowDataTransferHorizontalIcon,
  BatteryCharging01Icon,
  ComputerIcon,
  DiscountTag01Icon,
  FileImportIcon,
  InfinityCircleIcon,
  LaptopCheckIcon,
  LaptopIcon,
  Layers01Icon,
  MusicNote01Icon,
  SparklesIcon,
  SquareLock02Icon,
  Tick02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { useId, useMemo, useState, type ReactNode } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { PricingPriceDisplay } from "@/components/macwall-marketing/pricing-price-display"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { macwall } from "@/lib/macwall-site"
import type { MarketingMultiMacOffer } from "@/lib/pricing/marketing-pricing"
import { cn } from "@/lib/utils"

type Tone = "featured" | "default"

/** Copy-driven so feature lines can change in `macwall-pricing-copy` alone. */
function featureIcon(feature: string): IconSvgElement {
  const line = feature.toLowerCase()
  if (line.includes("switch macs")) return ArrowDataTransferHorizontalIcon
  if (line.includes("lower price")) return DiscountTag01Icon
  if (line.includes("works on up to")) return LaptopCheckIcon
  if (line.includes("bend") || line.includes("lid")) return LaptopIcon
  if (line.includes("wallpaper")) return Video01Icon
  if (line.includes("lock screen") || line.includes("screen saver"))
    return SquareLock02Icon
  if (line.includes("import") || line.includes("your own"))
    return FileImportIcon
  if (line.includes("music")) return MusicNote01Icon
  if (line.includes("display") || line.includes("hardware")) return ComputerIcon
  if (line.includes("battery") || line.includes("pauses"))
    return BatteryCharging01Icon
  if (line.includes("payment") || line.includes("update"))
    return InfinityCircleIcon
  return Tick02Icon
}

/** Bold the Mac count inside a feature line ("Works on up to 10 Macs"). */
function emphasizeMacs(feature: string): ReactNode {
  const match = feature.match(/\d+ Macs?/)
  if (!match || match.index === undefined) return feature
  return (
    <>
      {feature.slice(0, match.index)}
      <span className="font-medium text-white">{match[0]}</span>
      {feature.slice(match.index + match[0].length)}
    </>
  )
}

function withMacCount(features: readonly string[], macs: number): string[] {
  return features.map((feature) =>
    /works on up to \d+ macs?/i.test(feature)
      ? `Works on up to ${macs} Macs`
      : feature
  )
}

/** Cards stay short: drop version qualifiers like "(macOS 26+)". */
function cardFeatures(features: readonly string[]): string[] {
  return features.map((feature) => feature.replace(/\s*\(macOS[^)]*\)/i, ""))
}

function stripColon(label: string): string {
  return label.replace(/:\s*$/, "")
}

/** Hairline with a centred label, like a section break inside the card. */
function LabelledRule({
  children,
  tone,
}: Readonly<{ children: ReactNode; tone: Tone }>) {
  const line = cn(
    "h-px flex-1",
    tone === "featured" ? "bg-blue-400/20" : "bg-white/[0.08]"
  )
  return (
    <div className="flex items-center gap-3 text-[12px] text-zinc-500">
      <span aria-hidden className={line} />
      <span className="shrink-0">{children}</span>
      <span aria-hidden className={line} />
    </div>
  )
}

/**
 * Two-layer card: a thin outer shell holding a raised glass panel (plan,
 * price, CTA) above a plain feature list.
 */
function PlanCard({
  id,
  tone,
  icon,
  title,
  subtitle,
  headerAside,
  price,
  priceMajor,
  currency,
  locale,
  localPriceHint,
  action,
  featuresLabel,
  features,
}: Readonly<{
  id: string
  tone: Tone
  icon: IconSvgElement
  title: string
  subtitle: string
  headerAside?: ReactNode
  price: string
  priceMajor: number
  currency: string
  locale: string
  localPriceHint: string | null
  action: ReactNode
  featuresLabel: string
  features: readonly string[]
}>) {
  const featured = tone === "featured"

  return (
    <article
      aria-labelledby={id}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-1.5 backdrop-blur-xl",
        featured
          ? "border-blue-500/25 bg-blue-950/[0.08] shadow-[0_40px_120px_-50px_rgba(37,99,235,0.7)]"
          : "border-white/[0.08] bg-white/[0.012] shadow-xl"
      )}
    >
      {/* Raised panel */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5 sm:p-6",
          featured
            ? "border-blue-400/20 bg-[linear-gradient(180deg,rgba(37,99,235,0.16)_0%,rgba(37,99,235,0.04)_100%)]"
            : "border-white/[0.07] bg-white/[0.03]"
        )}
      >
        {/* Glass sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 45%, rgba(0,0,0,0) 100%)",
          }}
        />
        {featured ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent"
          />
        ) : null}

        <div className="relative">
          <div className="flex min-h-7 items-center justify-between gap-3">
            <h2
              id={id}
              className="flex items-center gap-2 text-[15px] leading-none font-medium text-zinc-200"
            >
              <HugeiconsIcon
                icon={icon}
                size={17}
                strokeWidth={1.75}
                className={featured ? "text-blue-300" : "text-zinc-400"}
                aria-hidden
              />
              {title}
            </h2>
            {headerAside}
          </div>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <PricingPriceDisplay
              price={price}
              priceMajor={priceMajor}
              currency={currency}
              locale={locale}
              className="font-display text-[52px] leading-[0.9] font-normal tracking-tight text-white"
            />
            {localPriceHint ? (
              <span className="text-[13px] leading-4 whitespace-nowrap text-zinc-400 tabular-nums">
                {localPriceHint}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-[13px] leading-5 text-zinc-400">{subtitle}</p>

          <div className="mt-5">{action}</div>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-5 sm:px-5">
        <LabelledRule tone={tone}>{featuresLabel}</LabelledRule>
        <ul role="list" className="space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-[14px] leading-5 text-zinc-300"
            >
              <HugeiconsIcon
                icon={featureIcon(feature)}
                size={17}
                strokeWidth={1.75}
                className={cn(
                  "mt-px shrink-0",
                  featured ? "text-blue-400" : "text-zinc-500"
                )}
                aria-hidden
              />
              <span className="min-w-0">{emphasizeMacs(feature)}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/** Segmented 5 / 10 Macs radio group; thumb slides without measuring the DOM. */
function MacCountSwitch({
  offers,
  selectedMacs,
  onSelect,
}: Readonly<{
  offers: readonly MarketingMultiMacOffer[]
  selectedMacs: number
  onSelect: (macs: number) => void
}>) {
  const name = useId()
  const index = Math.max(
    0,
    offers.findIndex((offer) => offer.macs === selectedMacs)
  )

  return (
    <div
      role="radiogroup"
      aria-label="Number of Macs"
      className="relative grid shrink-0 rounded-full border border-white/[0.08] bg-black/30 p-0.5"
      style={{
        gridTemplateColumns: `repeat(${offers.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-full bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
        style={{
          width: `calc((100% - 4px) / ${offers.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {offers.map((offer) => {
        const active = offer.macs === selectedMacs
        return (
          <label
            key={offer.slug}
            className="relative z-10 cursor-pointer rounded-full px-2.5 py-1 text-center text-[12px] leading-4 whitespace-nowrap has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-400/60"
          >
            <input
              type="radio"
              name={name}
              value={offer.macs}
              checked={active}
              onChange={() => onSelect(offer.macs)}
              className="sr-only"
            />
            <span
              className={cn(
                "transition-colors",
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {offer.macs} Macs
            </span>
          </label>
        )
      })}
    </div>
  )
}

const ctaBase =
  "inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-[15px] font-semibold no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"

/**
 * Pro / Pro+ cards. Same offers, checkout URLs, and analytics locations as
 * the live cards, so funnel numbers stay comparable between designs.
 */
export function PricingPlans({
  checkoutUrl,
}: Readonly<{ checkoutUrl: string }>) {
  const pricing = useMarketingPricing()
  const plans = p.plans

  const offers = useMemo(
    () => [...pricing.multiMacOffers].sort((a, b) => a.macs - b.macs),
    [pricing.multiMacOffers]
  )
  const [macs, setMacs] = useState(offers[0]?.macs ?? 5)
  const selected = offers.find((offer) => offer.macs === macs) ?? offers[0]

  return (
    <div
      className={cn(
        "mx-auto grid max-w-[46rem] grid-cols-1 items-stretch gap-4 sm:gap-5",
        selected && "md:grid-cols-2"
      )}
    >
      <PlanCard
        id="tier-pro"
        tone="featured"
        icon={SparklesIcon}
        title={plans.pro.title}
        subtitle={plans.pro.subtitle}
        headerAside={
          <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[11px] leading-none text-blue-200">
            {plans.pro.badge}
          </span>
        }
        price={pricing.permanentPrice}
        priceMajor={pricing.permanentPriceMajor}
        currency={pricing.currency}
        locale={pricing.locale}
        localPriceHint={pricing.permanentLocalHint}
        featuresLabel={stripColon(plans.pro.featuresPrefix)}
        features={cardFeatures(p.pro.features)}
        action={
          <TrackedPricingButton
            href={checkoutUrl}
            location="pricing_card_permanent"
            warmOnView
            ariaLabel={pricing.buyProAria}
            size="pill"
            className={cn(
              ctaBase,
              "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:from-blue-400 hover:to-blue-600 focus-visible:ring-blue-400"
            )}
          >
            {pricing.getProCta}
          </TrackedPricingButton>
        }
      />

      {selected ? (
        <PlanCard
          id="tier-pro-plus"
          tone="default"
          icon={Layers01Icon}
          title={plans.proPlus.title}
          subtitle={plans.proPlus.subtitle}
          headerAside={
            <MacCountSwitch
              offers={offers}
              selectedMacs={selected.macs}
              onSelect={setMacs}
            />
          }
          price={selected.price}
          priceMajor={selected.priceMajor}
          currency={selected.currency}
          locale={pricing.locale}
          localPriceHint={selected.localPriceHint}
          featuresLabel={stripColon(plans.proPlus.featuresPrefix)}
          features={cardFeatures(
            withMacCount(p.proPlus.features, selected.macs)
          )}
          action={
            <TrackedPricingButton
              href={selected.checkoutUrl}
              location={`pricing_multi_mac_${selected.macs}`}
              warmOnView
              ariaLabel={`Get ${macwall.name} Pro+ for ${selected.macs} Macs at ${selected.price}`}
              size="pill"
              className={cn(
                ctaBase,
                "bg-gradient-to-b from-white/[0.14] to-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10 ring-inset hover:from-white/[0.2] hover:to-white/[0.08] focus-visible:ring-white/60"
              )}
            >
              {pricing.getProPlusCta}
            </TrackedPricingButton>
          }
        />
      ) : null}
    </div>
  )
}
