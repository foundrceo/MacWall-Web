"use client"

import { Clapperboard, Flame, Hash, Mail, Check } from "lucide-react"
import type { ComponentType, ReactNode } from "react"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import {
  MarketingContainer,
  MarketingReelInfluencerCopy,
  MarketingRichText,
  SectionLead,
  SectionTitle,
  TextLink,
} from "@/components/macwall-marketing/marketing-primitives"
import {
  macwallPricingCopy as p,
  type ReelRefundStepIcon,
} from "@/lib/macwall-pricing-copy"
import {
  MARKETING_PAGE_CLASS,
  HERO_SECONDARY_BTN_CLASS,
  HERO_PRIMARY_BTN_CLASS,
} from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"

const reelStepIcons = {
  video: Clapperboard,
  tag: Hash,
  views: Flame,
  email: Mail,
} as const satisfies Record<
  ReelRefundStepIcon,
  ComponentType<{ className?: string; strokeWidth?: number }>
>

function ReelStepIcon({ kind }: Readonly<{ kind: ReelRefundStepIcon }>) {
  const Icon = reelStepIcons[kind]
  return (
    <span
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground"
      aria-hidden
    >
      <Icon className="size-3.5" strokeWidth={1.75} />
    </span>
  )
}

/** Premium pricing tier card — clean, elevated, no heavy borders */
function PricingTierCard({
  badge,
  title,
  subtitle,
  priceLine,
  priceHint,
  features,
  action,
  highlighted = false,
}: Readonly<{
  badge: string
  title: string
  subtitle: string
  priceLine: string
  priceHint: string
  features: readonly string[]
  action: ReactNode
  highlighted?: boolean
}>) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl bg-card p-6 transition-all duration-300 md:p-8",
        highlighted
          ? "shadow-[0_0_0_1px_rgba(var(--primary)/0.3),_0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-primary/30"
          : "shadow-sm hover:shadow-md"
      )}
    >
      {/* Highlight indicator — subtle top accent */}
      {highlighted && (
        <div className="absolute top-0 left-1/2 size-px -translate-x-1/2 bg-primary" />
      )}

      {/* Badge + Title */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
          {badge}
        </span>
        <h2 className="mt-4 text-[30px] leading-[1.1] font-normal tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-[15px] leading-[1.5] text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Price block — clean, no separator lines */}
      <div className="mb-6">
        <p className="text-[42px] leading-[1] font-light tracking-[-0.03em] text-foreground">
          {priceLine}
        </p>
        <p className="mt-1.5 text-[14px] leading-[1.4] text-muted-foreground">
          {priceHint}
        </p>
      </div>

      {/* Features — minimal checkmarks */}
      <ul className="mb-8 flex flex-1 flex-col gap-3" role="list">
        {features.map((line) => (
          <li
            key={line}
            className="flex items-start gap-3 text-[14px] leading-[1.5] text-foreground/85"
          >
            <Check
              className="mt-0.5 size-4.5 shrink-0 text-primary"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto">{action}</div>
    </article>
  )
}

export default function MacWallMarketingPricingPage() {
  const reel = p.reelRefund
  const pricing = useMarketingPricing()
  const fiveMacOffer = pricing.multiMacOffers.find((offer) => offer.macs === 5)

  return (
    <div className={MARKETING_PAGE_CLASS}>
      <MarketingSiteChrome />

      <main id="main-content" className={MARKETING_MAIN_OFFSET_CLASS}>
        {/* Hero Section — spacious, centered, minimal */}
        <section className="relative py-16 md:py-24 lg:py-32">
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent"
            aria-hidden="true"
          />
          <MarketingContainer wide>
            <div className="relative mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5 text-[13px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                Transparent pricing
              </span>
              <SectionTitle as="h1" className="mt-6">
                {p.heroTitle}
              </SectionTitle>
              <SectionLead className="mx-auto mt-6 max-w-2xl text-[19px] leading-[1.55] text-muted-foreground">
                {p.heroLead}
              </SectionLead>
              <p className="mt-8 text-[16px] font-medium text-foreground/70">
                Choose permanent ownership or annual access — both unlock the
                full Pro experience.
              </p>
            </div>
          </MarketingContainer>
        </section>

        {/* Pricing Cards — generous grid, aligned bottom CTAs */}
        <section className="relative pb-16 md:pb-24 lg:pb-32">
          <MarketingContainer wide>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:mx-auto lg:max-w-5xl">
              {/* Permanent — PRIMARY */}
              <PricingTierCard
                badge="ONE-TIME"
                title="Permanent"
                subtitle="Pay once. Own it forever. Free updates for life."
                priceLine={`${pricing.permanentPrice}`}
                priceHint="Up to 3 Macs • Lifetime updates included"
                features={p.pro.features}
                action={
                  <TrackedPricingButton
                    href={pricing.checkoutUrl}
                    location="pricing_card_permanent"
                    ariaLabel={`Buy MacWall permanent license for ${pricing.permanentPrice}`}
                    size="pill"
                    className={cn(
                      HERO_PRIMARY_BTN_CLASS,
                      "w-full justify-center"
                    )}
                  >
                    Get Permanent License
                  </TrackedPricingButton>
                }
                highlighted
              />

              {/* Annual — SECONDARY */}
              <PricingTierCard
                badge="ANNUAL"
                title="Annual"
                subtitle="Lower upfront cost. Same Pro features. Cancel anytime."
                priceLine={`${pricing.annualPrice}/year`}
                priceHint="Up to 3 Macs • Renews yearly until canceled"
                features={[
                  ...p.pro.features.slice(0, 4),
                  "Annual billing",
                  "Cancel before renewal anytime",
                ]}
                action={
                  <TrackedPricingButton
                    href={pricing.annualCheckoutUrl}
                    location="pricing_card_annual"
                    ariaLabel={`Start annual MacWall plan for ${pricing.annualPrice} per year`}
                    size="pill"
                    className={cn(
                      HERO_SECONDARY_BTN_CLASS,
                      "w-full justify-center"
                    )}
                  >
                    Start Annual Plan
                  </TrackedPricingButton>
                }
              />
            </div>
          </MarketingContainer>
        </section>

        {/* Multi-Mac Upsell — clean card, no heavy borders */}
        <section className="relative pb-16 md:pb-24 lg:pb-32">
          <MarketingContainer wide>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-[30px] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
                Got more than one Mac? We&apos;ve got you covered.
              </h2>
              <p className="mt-3 text-[16px] leading-[1.55] text-muted-foreground">
                Save more when you license multiple Macs with a single permanent
                key.
              </p>
            </div>

            {fiveMacOffer && (
              <div className="mx-auto mt-10 max-w-2xl">
                <article className="relative rounded-2xl bg-card p-6 shadow-sm ring-1 ring-primary/20 md:p-8">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                    <div className="flex-1">
                      <p className="text-[22px] leading-tight font-medium text-foreground">
                        5 Macs — Permanent License
                      </p>
                      <p className="mt-2 flex items-baseline justify-center gap-3 text-muted-foreground sm:justify-start">
                        <span className="text-[36px] leading-none font-light tracking-[-0.02em] text-foreground">
                          {fiveMacOffer.price}
                        </span>
                        <span className="text-[14px] font-medium text-primary">
                          one-time, permanent
                        </span>
                      </p>
                    </div>

                    <TrackedPricingButton
                      href={fiveMacOffer.checkoutUrl}
                      location="pricing_multi_mac_5"
                      ariaLabel={`Buy permanent MacWall license for 5 Macs for ${fiveMacOffer.price}`}
                      size="pill"
                      className={cn(HERO_SECONDARY_BTN_CLASS, "shrink-0")}
                    >
                      Buy 5-Mac License
                    </TrackedPricingButton>
                  </div>
                </article>
              </div>
            )}
          </MarketingContainer>
        </section>

        {/* Reel Refund Section — elevated card */}
        <section className="relative pb-16 md:pb-24 lg:pb-32">
          <MarketingContainer wide>
            <article className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-muted/30 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold tracking-[0.08em] text-primary uppercase">
                    {reel.badge}
                  </span>
                  <h2 className="mt-4 text-[30px] leading-[1.1] font-normal tracking-[-0.02em] text-foreground">
                    {reel.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-[15px] leading-[1.55] text-muted-foreground">
                    {reel.description}
                  </p>
                </div>

                <div className="shrink-0 pt-2 md:pt-0">
                  <TextLink href={reel.ctaHref} external>
                    {reel.cta}
                  </TextLink>
                </div>
              </div>

              {/* Steps — clean grid */}
              <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {reel.steps.map((step) => (
                  <li
                    key={step.title}
                    className="flex items-start gap-3 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                  >
                    <ReelStepIcon kind={step.icon} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-foreground">
                        {step.title}
                      </p>
                      {"body" in step && step.body && (
                        <MarketingRichText
                          as="p"
                          className="mt-1 text-[13px] leading-[1.45] text-muted-foreground"
                        >
                          {step.body}
                        </MarketingRichText>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-2">
                <p className="text-[13px] leading-[1.45] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {reel.influencerTitle}
                  </span>{" "}
                  <MarketingReelInfluencerCopy className="inline" />
                </p>
                <p className="rounded-xl bg-muted/30 px-4 py-3 text-[12px] leading-[1.45] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {reel.finePrintLabel}
                  </span>{" "}
                  {reel.finePrint}
                </p>
              </div>
            </article>
          </MarketingContainer>
        </section>

        {/* FAQ Section — minimal, clean */}
        <section className="relative pb-16 md:pb-24 lg:pb-32">
          <MarketingContainer wide>
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <span className="text-[14px] text-muted-foreground">
                  {p.faqTitle}
                </span>
                <SectionTitle as="h2" className="mt-3">
                  Common questions
                </SectionTitle>
              </div>

              <div className="mt-10 divide-y divide-border/50 border-t border-border/50">
                {p.faq.map((item) => (
                  <details key={item.q} className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 py-6 text-[16px] font-normal text-foreground [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <svg
                        className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="pb-6 text-[15px] leading-[1.6] text-foreground/70">
                      <MarketingRichText as="p">{item.a}</MarketingRichText>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </MarketingContainer>
        </section>
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
