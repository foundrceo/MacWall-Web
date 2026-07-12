"use client"

import { Clapperboard, Flame, Hash, Mail } from "lucide-react"
import {
  useCallback,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import { macwallProCheckoutURL } from "@/lib/macwall-site"
import {
  macwallPricingCopy as p,
  type ReelRefundStepIcon,
} from "@/lib/macwall-pricing-copy"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import MacWallMarketingAnnouncementBar from "@/components/macwall-marketing/marketing-announcement-bar"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import {
  CheckIcon,
  MarketingCard,
  MarketingContainer,
  MarketingSection,
  SectionLead,
  SectionTitle,
  TextLink,
  MarketingRichText,
  MarketingReelFaqRefundCopy,
  MarketingReelInfluencerCopy,
  MarketingReelPostTagsCopy,
} from "@/components/macwall-marketing/marketing-primitives"
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
    <span className="MacWallPricingReelStepIconWrap" aria-hidden>
      <Icon className="MacWallPricingReelStepIconSvg" strokeWidth={1.75} />
    </span>
  )
}

function PricingFaqItem({
  question,
  answer,
  answerNode,
  defaultOpen,
}: Readonly<{
  question: string
  answer: string
  answerNode?: ReactNode
  defaultOpen?: boolean
}>) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  return (
    <div className="border-b border-black/[0.06] py-5">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent text-left"
        onClick={toggle}
      >
        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[19px]">
          {question}
        </h3>
        <span
          aria-hidden
          className={cn(
            "shrink-0 text-[#86868b] transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
            <path d="M5.22 8.22a.749.749 0 0 0 0 1.06l6.25 6.25a.749.749 0 0 0 1.06 0l6.25-6.25a.749.749 0 1 0-1.06-1.06L12 13.939 6.28 8.22a.749.749 0 0 0-1.06 0Z" />
          </svg>
        </span>
      </button>
      {open
        ? (answerNode ?? (
            <MarketingRichText
              as="p"
              className="mt-3 text-[17px] leading-[1.47] text-[#86868b]"
            >
              {answer}
            </MarketingRichText>
          ))
        : null}
    </div>
  )
}

export default function MacWallMarketingPricingPage() {
  const reel = p.reelRefund

  return (
    <div className="MacWallMarketingPage min-h-screen bg-white">
      <MacWallMarketingHeader variant="light" />
      <MacWallMarketingAnnouncementBar />

      <main className="pt-14 md:pt-20">
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

        <MarketingSection className="MacWallMarketingSectionPrePageEnd mt-4">
          <MarketingContainer>
            <SectionTitle
              as="h2"
              className="mb-10 text-center text-[28px] md:text-[40px]"
            >
              {p.faqTitle}
            </SectionTitle>
            <div className="mx-auto max-w-[680px]">
              {p.faq.map((item, i) => (
                <PricingFaqItem
                  key={item.q}
                  question={item.q}
                  answer={item.a}
                  answerNode={
                    item.q === "How does the Reel refund work?" ? (
                      <MarketingReelFaqRefundCopy className="mt-3 text-[17px] leading-[1.47] text-[#86868b]" />
                    ) : undefined
                  }
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </MarketingContainer>
        </MarketingSection>
      </main>

      <MacWallMarketingPageEnd />
    </div>
  )
}
