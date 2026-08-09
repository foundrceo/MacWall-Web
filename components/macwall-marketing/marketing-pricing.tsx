"use client"

import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { PricingTryFreeRow } from "@/components/macwall-marketing/pricing-try-free-row"
import { PricingReviewsSection } from "@/components/macwall-marketing/pricing-reviews-section"
import { PricingCardFooter } from "@/components/macwall-marketing/pricing-card-footer"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import {
  PricingSocialProof,
  PricingTrustStrip,
} from "@/components/macwall-marketing/pricing-trust-strip"
import { ProPlusPackCard } from "@/components/macwall-marketing/pro-plus-pack-card"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

const pricingFeaturedButtonClass =
  "inline-flex h-9 min-h-9 w-full items-center justify-center rounded-full bg-blue-800 px-3.5 text-[14px] font-medium text-white no-underline transition-colors hover:bg-blue-700"

const pricingMutedButtonClass =
  "inline-flex h-9 min-h-9 w-full items-center justify-center rounded-full bg-white/[0.08] px-3.5 text-[14px] font-medium text-white no-underline ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12]"

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
      className={cn(pricingFeaturedButtonClass, className)}
    >
      {children}
    </TrackedPricingButton>
  )
}

export default function MacWallMarketingPricingPage() {
  const pricing = useMarketingPricing()
  const plans = p.plans
  const searchParams = useSearchParams()
  const checkoutError = searchParams.get("checkout_error")?.trim() || null

  return (
    <div className="marketing-page antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className="marketing-main-offset">
        <section className="marketing-hero-section">
          <div className="marketing-container">
            <PricingSocialProof className="mb-3" />
            <h1 className="text-center text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-foreground md:text-5xl">
              {p.heroTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-relaxed text-marketing-muted sm:text-[17px]">
              {p.heroLead}
            </p>
            {checkoutError ? (
              <p
                role="alert"
                className="mx-auto mt-4 max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[14px] leading-snug text-red-200"
              >
                {checkoutError}
              </p>
            ) : null}

            <div className="mt-6 md:mt-8">
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
                  featured
                  badge={plans.pro.badge}
                  badgeAlt={pricing.permanentOffLabel}
                  reserveTopCenterSlot
                  action={
                    <PricingPrimaryButton
                      href={pricing.checkoutUrl}
                      location="pricing_card_permanent"
                      ariaLabel={pricing.buyProAria}
                    >
                      {pricing.getProCta}
                    </PricingPrimaryButton>
                  }
                  footer={<PricingCardFooter />}
                />

                {pricing.multiMacOffers.length > 0 ? (
                  <ProPlusPackCard
                    offers={pricing.multiMacOffers}
                    title={plans.proPlus.title}
                    subtitle={plans.proPlus.subtitle}
                    featuresPrefix={plans.proPlus.featuresPrefix}
                    features={p.proPlus.features}
                    cta={pricing.getProPlusCta}
                    badge={plans.proPlus.badge}
                    buttonClassName={pricingMutedButtonClass}
                    footer={<PricingCardFooter />}
                  />
                ) : null}
              </div>

              <PricingTrustStrip className="mt-5" />
              <PricingTryFreeRow className="mt-4" />
            </div>
          </div>
        </section>

        <PricingReviewsSection />

        <MarketingFaqSection defaultOpenQuestion={p.faq[0]?.q} />
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
