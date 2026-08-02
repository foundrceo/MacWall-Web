"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import {
  TrackedDownloadButton,
  TrackedPricingButton,
} from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import HomeFaqSection from "@/components/macwall-marketing/HomeFaqSection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const pricingPrimaryButtonClass =
  "inline-flex h-8 min-h-8 items-center justify-center rounded-full bg-white px-3.5 text-[14px] font-normal text-black no-underline transition-opacity hover:opacity-90"

const pricingSecondaryButtonClass =
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

function PricingSecondaryButton({
  href,
  children,
  location,
  className,
  download = false,
}: Readonly<{
  href: string
  children: ReactNode
  location: string
  className?: string
  download?: boolean
}>) {
  const classes = cn(pricingSecondaryButtonClass, className)

  if (download) {
    return (
      <TrackedDownloadButton
        href={href}
        location={location}
        size="pill"
        className={classes}
      >
        {children}
      </TrackedDownloadButton>
    )
  }

  return (
    <TrackedPricingButton
      href={href}
      location={location}
      size="pill"
      className={classes}
    >
      {children}
    </TrackedPricingButton>
  )
}

export default function MacWallMarketingPricingPage() {
  const pricing = useMarketingPricing()
  const fiveMacOffer = pricing.multiMacOffers.find((offer) => offer.macs === 5)
  const plans = p.plans

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-background text-foreground antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className={MARKETING_MAIN_OFFSET_CLASS}>
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
            <h1 className="text-center text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-foreground md:text-5xl">
              {p.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[16px] leading-relaxed text-marketing-muted sm:text-[17px]">
              {p.heroLead}
            </p>

            <div className="mt-10 md:mt-16">
              <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-3">
                <PricingTierCard
                  id="tier-free"
                  title={plans.free.title}
                  subtitle={plans.free.subtitle}
                  price={plans.free.price}
                  priceMajor={0}
                  currency="usd"
                  features={p.freeTrial.features}
                  featuresPrefix={plans.free.featuresPrefix}
                  action={
                    <PricingSecondaryButton
                      href={macwallInstallerLatestPath}
                      location="pricing_card_free"
                      download
                    >
                      {plans.free.cta}
                    </PricingSecondaryButton>
                  }
                />

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

                {fiveMacOffer ? (
                  <PricingTierCard
                    id="tier-pro-plus"
                    title={plans.proPlus.title}
                    subtitle={plans.proPlus.subtitle}
                    price={fiveMacOffer.price}
                    priceMajor={fiveMacOffer.priceMajor}
                    currency="usd"
                    strikePrice={fiveMacOffer.strikePrice}
                    localPriceHint={fiveMacOffer.localPriceHint}
                    priceSuffix="one-time"
                    features={p.proPlus.features}
                    featuresPrefix={plans.proPlus.featuresPrefix}
                    badge={fiveMacOffer.offLabel}
                    action={
                      <PricingPrimaryButton
                        href={fiveMacOffer.checkoutUrl}
                        location="pricing_multi_mac_5"
                        ariaLabel={`Buy ${macwall.name} Pro Plus for ${fiveMacOffer.price}`}
                      >
                        {plans.proPlus.cta}
                      </PricingPrimaryButton>
                    }
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
