"use client"

import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { PricingCardFooter } from "@/components/macwall-marketing/pricing-card-footer"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import { PricingTryFreeRow } from "@/components/macwall-marketing/pricing-try-free-row"
import {
  PricingSocialProof,
  PricingTrustStrip,
} from "@/components/macwall-marketing/pricing-trust-strip"
import { ProPlusPackCard } from "@/components/macwall-marketing/pro-plus-pack-card"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

const pricingFeaturedButtonClass =
  "inline-flex h-9 min-h-9 w-full items-center justify-center rounded-full bg-blue-800 px-3.5 text-[14px] font-medium text-white no-underline transition-colors hover:bg-blue-700"

function withCheckoutPromo(
  url: string,
  promo: string | null,
  until: string | null
): string {
  if (!promo && !until) return url
  try {
    const parsed = new URL(url, "https://macwall.app")
    if (promo) parsed.searchParams.set("promo", promo)
    if (until) parsed.searchParams.set("until", until)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

const pricingMutedButtonClass =
  "inline-flex h-9 min-h-9 w-full items-center justify-center rounded-full border border-landing-rule bg-transparent px-3.5 text-[14px] font-medium text-white no-underline transition-colors hover:bg-white/5"

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
  const promo = searchParams.get("promo")?.trim().toUpperCase() || null
  const until = searchParams.get("until")?.trim() || null
  const checkoutUrl = withCheckoutPromo(pricing.checkoutUrl, promo, until)

  return (
    <div className="marketing-page antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className="marketing-main-offset">
        <section className="marketing-hero-section">
          <div className="marketing-container">
            <PricingSocialProof className="mb-3" />
            <h1 className="mx-auto max-w-3xl text-center text-[32px] leading-[1.12] font-normal tracking-tight text-white sm:text-[40px] lg:text-[48px]">
              {p.heroTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-6 text-landing-muted">
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
                      href={checkoutUrl}
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

        <MarketingFaqSection defaultOpenQuestion={p.faq[0]?.q} />
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
