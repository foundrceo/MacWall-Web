"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import { CheckoutPrefetchWarmup } from "@/components/macwall-marketing/checkout-prefetch-warmup"
import HomeFaqSection from "@/components/macwall-marketing/HomeFaqSection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { PricingReviewsSection } from "@/components/macwall-marketing/pricing-reviews-section"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import {
  PricingSocialProof,
  PricingTrustStrip,
  PricingTrustStripCompact,
} from "@/components/macwall-marketing/pricing-trust-strip"
import { ProPlusPackCard } from "@/components/macwall-marketing/pro-plus-pack-card"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const pricingFeaturedButtonClass =
  "inline-flex h-8 min-h-8 w-full items-center justify-center rounded-full bg-blue-800 px-3.5 text-[14px] font-medium text-white no-underline transition-colors hover:bg-blue-700"

const pricingMutedButtonClass =
  "inline-flex h-8 min-h-8 w-full items-center justify-center rounded-full bg-white/[0.08] px-3.5 text-[14px] font-medium text-white no-underline ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12]"

function PricingCardFooter() {
  return (
    <p>
      <Link
        href="/legal/refund"
        className="underline-offset-2 hover:text-foreground/80 hover:underline"
      >
        7-day refund
      </Link>
      {" · "}
      Lifetime updates
      {" · "}
      <Link
        href="/legal/refund"
        className="underline-offset-2 hover:text-foreground/80 hover:underline"
      >
        refund policy
      </Link>
    </p>
  )
}

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
            {checkoutError ? (
              <p
                role="alert"
                className="mx-auto mt-4 max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[14px] leading-snug text-red-200"
              >
                {checkoutError}
              </p>
            ) : null}
            <PricingSocialProof className="mt-4" />

            <PricingTrustStripCompact className="mt-6" />

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
                  featured
                  badge={plans.pro.badge}
                  badgeAlt={pricing.permanentOffLabel}
                  action={
                    <PricingPrimaryButton
                      href={pricing.checkoutUrl}
                      location="pricing_card_permanent"
                      ariaLabel={`Invest in ${macwall.name} Pro for ${pricing.permanentPrice}`}
                    >
                      {plans.pro.ctaPermanent}
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
                    cta={plans.proPlus.cta}
                    badge={plans.proPlus.badge}
                    buttonClassName={pricingMutedButtonClass}
                    footer={<PricingCardFooter />}
                  />
                ) : null}
              </div>

              <PricingTrustStrip className="mt-8" />

              <p className="mt-8 text-center text-[14px] text-marketing-muted">
                Creators:{" "}
                <Link
                  href="/creator"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  earn up to 100% back with a video
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <PricingReviewsSection />

        <HomeFaqSection />
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
