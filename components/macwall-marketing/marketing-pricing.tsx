"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import { CheckoutPrefetchWarmup } from "@/components/macwall-marketing/checkout-prefetch-warmup"
import { DiscordPricingPerk } from "@/components/macwall-marketing/discord-pricing-perk"
import HomeFaqSection from "@/components/macwall-marketing/HomeFaqSection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import { ProPlusPackCard } from "@/components/macwall-marketing/pro-plus-pack-card"
import { GradientTracing } from "@/components/ui/gradient-tracing"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const pricingPrimaryButtonClass =
  "inline-flex h-8 min-h-8 items-center justify-center rounded-full bg-white px-3.5 text-[14px] font-normal text-black no-underline transition-opacity hover:opacity-90"

function PricingPrimaryButton({
  href,
  children,
  location,
  ariaLabel,
  className,
}: Readonly<{
  href: string
  children: ReactNode
  location: string
  ariaLabel?: string
  className?: string
}>) {
  return (
    <TrackedPricingButton
      href={href}
      location={location}
      ariaLabel={ariaLabel}
      size="pill"
      className={cn(pricingPrimaryButtonClass, className)}
    >
      {children}
    </TrackedPricingButton>
  )
}

export default function MacWallMarketingPricingPage() {
  const pricing = useMarketingPricing()
  const plans = p.plans

  return (
    <div className="marketing-page antialiased">
      <CheckoutPrefetchWarmup />
      <MarketingSiteChrome />

      <main id="main-content" className="marketing-main-offset">
        <section className="marketing-hero-section">
          <div className="marketing-container">
            <h1 className="text-center text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-foreground md:text-5xl">
              {p.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[16px] leading-relaxed text-marketing-muted sm:text-[17px]">
              {p.heroLead}
            </p>

            <DiscordPricingPerk />

            <div className="mt-8 md:mt-10">
              <div className="mx-auto grid max-w-3xl grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-2">
                <PricingTierCard
                  id="tier-pro"
                  title={plans.pro.title}
                  subtitle={plans.pro.subtitle}
                  price={pricing.permanentPrice}
                  priceMajor={pricing.permanentPriceMajor}
                  currency="usd"
                  strikePrice={pricing.permanentStrikePrice}
                  localPriceHint={pricing.permanentLocalHint}
                  priceSuffix="one-time"
                  features={p.pro.features}
                  featuresPrefix={plans.pro.featuresPrefix}
                  highlight
                  badge={plans.pro.badge}
                  badgeAlt={pricing.permanentOffLabel}
                  showActionSlot
                  actionSlot={
                    <GradientTracing
                      width={160}
                      height={12}
                      baseColor="white"
                      gradientColors={["#F1C40F", "#F1C40F", "#E67E22"]}
                      strokeWidth={1.5}
                      animationDuration={2}
                    />
                  }
                  action={
                    <PricingPrimaryButton
                      href={pricing.checkoutUrl}
                      location="pricing_card_permanent"
                      ariaLabel={`Buy ${macwall.name} Pro for ${pricing.permanentPrice}`}
                    >
                      {plans.pro.ctaPermanent}
                    </PricingPrimaryButton>
                  }
                />

                {pricing.multiMacOffers.length > 0 ? (
                  <ProPlusPackCard
                    offers={pricing.multiMacOffers}
                    title={plans.proPlus.title}
                    subtitle={plans.proPlus.subtitle}
                    featuresPrefix={plans.proPlus.featuresPrefix}
                    features={p.proPlus.features}
                    cta={plans.proPlus.cta}
                  />
                ) : null}
              </div>

              <p className="mt-8 text-center text-[14px] text-marketing-muted">
                Creators:{" "}
                <Link
                  href="/pricing/reel-refund"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  earn up to 100% back with a Reel
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <HomeFaqSection />
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
