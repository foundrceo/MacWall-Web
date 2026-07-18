"use client"

import "./marketing-pricing-cards.css"

import { Clapperboard, Flame, Hash, Mail } from "lucide-react"
import type { ComponentType } from "react"
import { macwallProCheckoutURL } from "@/lib/macwall-site"
import {
  macwallPricingCopy as p,
  type ReelRefundStepIcon,
} from "@/lib/macwall-pricing-copy"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
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

export default function MacWallMarketingPricingPage() {
  const reel = p.reelRefund

  return (
    <div className={MARKETING_PAGE_CLASS}>
      <MarketingSiteChrome />

      <main className={MARKETING_MAIN_OFFSET_CLASS}>
        <section className="pt-12 pb-14 md:pt-16 md:pb-20 lg:py-24">
          <MarketingContainer>
            <div className="mb-14 text-center md:mb-20">
              <SectionTitle as="h1">{p.heroTitle}</SectionTitle>
              <SectionLead className="mx-auto mt-5 max-w-[540px]">
                {p.heroLead}
              </SectionLead>
            </div>

            <div className="MacWallPricingPlansGrid grid gap-5 md:grid-cols-2">
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

              <MarketingCard className="MacWallPricingPlanCard">
                <div className="MacWallPricingPlanHead">
                  <p className="MacWallPricingPlanBadge">{p.pro.badge}</p>
                  <h2 className="MacWallPricingPlanTitle">{p.pro.title}</h2>
                  <h3 className="MacWallPricingPlanDescription">
                    {p.pro.description}
                  </h3>
                </div>

                <div className="MacWallPricingPlanDivider" aria-hidden />

                <ul className="MacWallPricingPlanCardFeatures MacWallPricingProFeatures">
                  {p.pro.features.map((line) => (
                    <li key={line} className="MacWallPricingProFeature">
                      <CheckIcon />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="MacWallPricingPlanCardCta">
                  <TrackedPricingButton
                    href={macwallProCheckoutURL}
                    location="pricing_card"
                    ariaLabel={p.pro.ctaAria}
                  >
                    {p.pro.cta}
                  </TrackedPricingButton>
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
