"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"

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
import { PricingSegmentControl } from "@/components/macwall-marketing/pricing-segment-control"
import { PricingTierCard } from "@/components/macwall-marketing/pricing-tier-card"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type BillingMode = "permanent" | "annual"

const billingOptions = [
  { value: "annual" as const, label: p.billingAnnual },
  { value: "permanent" as const, label: p.billingPermanent },
]

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
  ariaLabel,
  className,
  download = false,
}: Readonly<{
  href: string
  children: ReactNode
  location: string
  ariaLabel?: string
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
      ariaLabel={ariaLabel}
      size="pill"
      className={classes}
    >
      {children}
    </TrackedPricingButton>
  )
}

export default function MacWallMarketingPricingPage() {
  const pricing = useMarketingPricing()
  const [billing, setBilling] = useState<BillingMode>("permanent")
  const fiveMacOffer = pricing.multiMacOffers.find((offer) => offer.macs === 5)
  const isAnnual = billing === "annual"
  const plans = p.plans

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-background text-foreground antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className={MARKETING_MAIN_OFFSET_CLASS}>
        <section className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-[1360px] px-6 sm:px-8 lg:px-10">
            <h1 className="text-center text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              {p.pageTitle}
            </h1>

            <div className="mt-12 md:mt-16">
              <div className="grid grid-cols-1 items-stretch gap-4 pt-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5">
                <PricingTierCard
                  id="tier-free"
                  title={plans.free.title}
                  subtitle={plans.free.subtitle}
                  price={plans.free.price}
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
                  price={
                    isAnnual ? pricing.annualPrice : pricing.permanentPrice
                  }
                  priceSuffix={isAnnual ? "/ yr." : null}
                  features={isAnnual ? p.annual.features : p.pro.features}
                  featuresPrefix={plans.pro.featuresPrefix}
                  highlight
                  badge={plans.pro.badge}
                  actionSlot={
                    <PricingSegmentControl
                      ariaLabel="Pro billing"
                      options={billingOptions}
                      value={billing}
                      onChange={setBilling}
                      compact
                    />
                  }
                  showActionSlot
                  action={
                    <PricingPrimaryButton
                      href={
                        isAnnual
                          ? pricing.annualCheckoutUrl
                          : pricing.checkoutUrl
                      }
                      location={
                        isAnnual
                          ? "pricing_card_annual"
                          : "pricing_card_permanent"
                      }
                      ariaLabel={
                        isAnnual
                          ? `Start annual ${macwall.name} plan for ${pricing.annualPrice} per year`
                          : `Buy ${macwall.name} permanent license for ${pricing.permanentPrice}`
                      }
                    >
                      {isAnnual ? plans.pro.ctaAnnual : plans.pro.ctaPermanent}
                    </PricingPrimaryButton>
                  }
                />

                {fiveMacOffer ? (
                  <PricingTierCard
                    id="tier-pro-plus"
                    title={plans.proPlus.title}
                    subtitle={plans.proPlus.subtitle}
                    price={fiveMacOffer.price}
                    priceSuffix="one-time"
                    features={p.proPlus.features}
                    featuresPrefix={plans.proPlus.featuresPrefix}
                    action={
                      <PricingSecondaryButton
                        href={fiveMacOffer.checkoutUrl}
                        location="pricing_multi_mac_5"
                        ariaLabel={`Buy permanent ${macwall.name} license for 5 Macs for ${fiveMacOffer.price}`}
                      >
                        {plans.proPlus.cta}
                      </PricingSecondaryButton>
                    }
                  />
                ) : null}

                <PricingTierCard
                  id="tier-reel"
                  title={plans.reel.title}
                  subtitle={plans.reel.subtitle}
                  price={plans.reel.price}
                  features={[
                    "Post with #macwall on IG or TikTok",
                    `${macwall.reelRefundHalfViews.toLocaleString()} views → 50% refund`,
                    `${macwall.reelRefundFullViews.toLocaleString()} views → full refund`,
                    "Organic views only",
                  ]}
                  featuresPrefix={plans.reel.featuresPrefix}
                  action={
                    <Link
                      href="/pricing/reel-refund"
                      className={pricingSecondaryButtonClass}
                    >
                      {plans.reel.cta}
                    </Link>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <HomeFaqSection />
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
