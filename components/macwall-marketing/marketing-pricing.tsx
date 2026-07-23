"use client"

import "./marketing-pricing-cards.css"

import { Clapperboard, Flame, Hash, Mail } from "lucide-react"
import type { ComponentType } from "react"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import {
  macwallPricingCopy as p,
  type ReelRefundStepIcon,
} from "@/lib/macwall-pricing-copy"
import { licensePlanCheckoutPath } from "@/lib/license/plans-public"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import IndiaPricingOffer from "@/components/macwall-marketing/IndiaPricingOffer"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import {
  CheckIcon,
  MarketingCard,
  MarketingContainer,
  SectionLead,
  SectionTitle,
  TextLink,
  MarketingRichText,
  MarketingReelInfluencerCopy,
  MarketingReelPostTagsCopy,
} from "@/components/macwall-marketing/marketing-primitives"

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
    <span className="MacWallPricingReelStepIconWrap" aria-hidden>
      <Icon className="MacWallPricingReelStepIconSvg" strokeWidth={1.75} />
    </span>
  )
}

function LicensePlanCard({
  badge,
  title,
  description,
  features,
  ctaHref,
  ctaLabel,
  ctaAria,
  location,
  highlighted = false,
}: Readonly<{
  badge: string
  title: string
  description: string
  features: readonly string[]
  ctaHref: string
  ctaLabel: string
  ctaAria: string
  location: string
  highlighted?: boolean
}>) {
  return (
    <MarketingCard
      className={`MacWallPricingPlanCard${highlighted ? " MacWallPricingPlanCard--highlighted" : ""}`}
    >
      <div className="MacWallPricingPlanHead">
        <p className="MacWallPricingPlanBadge">{badge}</p>
        <h2 className="MacWallPricingPlanTitle">{title}</h2>
        <h3 className="MacWallPricingPlanDescription">{description}</h3>
      </div>

      <div className="MacWallPricingPlanDivider" aria-hidden />

      <ul className="MacWallPricingPlanCardFeatures MacWallPricingProFeatures">
        {features.map((line) => (
          <li key={line} className="MacWallPricingProFeature">
            <CheckIcon />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="MacWallPricingPlanCardCta">
        <TrackedPricingButton
          href={ctaHref}
          location={location}
          ariaLabel={ctaAria}
        >
          {ctaLabel}
        </TrackedPricingButton>
      </div>
    </MarketingCard>
  )
}

export default function MacWallMarketingPricingPage() {
  const reel = p.reelRefund
  const pricing = useMarketingPricing()
  const isIndia = pricing.showIndiaOfferCard

  return (
    <div className={MARKETING_PAGE_CLASS}>
      <MarketingSiteChrome />

      <main id="main-content" className={MARKETING_MAIN_OFFSET_CLASS}>
        <section className="pt-12 pb-14 md:pt-16 md:pb-20 lg:py-24">
          <MarketingContainer>
            <div className="mb-14 text-center md:mb-20">
              <SectionTitle as="h1">{p.heroTitle}</SectionTitle>
              <SectionLead className="mx-auto mt-5 max-w-[540px]">
                {pricing.pricingHeroLead}
              </SectionLead>
            </div>

            <IndiaPricingOffer />

            <div
              className={
                isIndia
                  ? "MacWallPricingPlansGrid grid gap-5 md:grid-cols-2"
                  : "MacWallPricingPlansGrid MacWallPricingPlansGrid--three grid gap-5 lg:grid-cols-3"
              }
            >
              {!isIndia ? (
                <LicensePlanCard
                  badge={p.pro.badge}
                  title={p.pro.title}
                  description={pricing.pricingProDescription}
                  features={p.pro.features}
                  ctaHref={pricing.checkoutUrl}
                  ctaLabel={pricing.buyProCta}
                  ctaAria={pricing.buyProAria}
                  location="pricing_card_pro"
                  highlighted
                />
              ) : null}

              <LicensePlanCard
                badge={p.proPlus.badge}
                title={p.proPlus.title}
                description={p.proPlus.description}
                features={p.proPlus.features}
                ctaHref={licensePlanCheckoutPath("pro_plus")}
                ctaLabel={p.proPlus.cta}
                ctaAria={p.proPlus.ctaAria}
                location="pricing_card_pro_plus"
              />

              <MarketingCard
                id="reel-refund"
                className="MacWallPricingPlanCard MacWallPricingReelCard"
              >
                <div className="MacWallPricingPlanHead">
                  <p className="MacWallPricingPlanBadge">{reel.badge}</p>
                  <h2 className="MacWallPricingPlanTitle">{reel.title}</h2>
                  <h3 className="MacWallPricingPlanDescription">
                    {reel.description}
                  </h3>
                </div>

                <div className="MacWallPricingPlanDivider" aria-hidden />

                <ul className="MacWallPricingPlanCardFeatures MacWallPricingReelSteps">
                  {reel.steps.map((step) => (
                    <li key={step.title} className="MacWallPricingReelStep">
                      <ReelStepIcon kind={step.icon} />
                      <div className="MacWallPricingReelStepCopy">
                        <p className="MacWallPricingReelStepTitle">
                          {step.title}
                        </p>
                        {step.icon === "tag" ? (
                          <MarketingReelPostTagsCopy className="MacWallPricingReelStepBody" />
                        ) : (
                          <MarketingRichText
                            as="p"
                            className="MacWallPricingReelStepBody"
                          >
                            {step.body}
                          </MarketingRichText>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="MacWallPricingPlanCardFoot">
                  <p className="MacWallPricingReelInfluencer">
                    <span className="MacWallPricingReelInfluencerTitle">
                      {reel.influencerTitle}
                    </span>{" "}
                    <MarketingReelInfluencerCopy className="MacWallPricingReelInfluencerBody" />
                  </p>
                  <p className="MacWallPricingReelFinePrint">
                    <span className="MacWallPricingReelFinePrintLabel">
                      {reel.finePrintLabel}
                    </span>{" "}
                    {reel.finePrint}
                  </p>
                </div>

                <div className="MacWallPricingPlanCardCta">
                  <TextLink href={reel.ctaHref} external>
                    {reel.cta}
                  </TextLink>
                </div>
              </MarketingCard>
            </div>
          </MarketingContainer>
        </section>

        <MarketingFaqSection />
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}