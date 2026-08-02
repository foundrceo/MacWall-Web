import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ClapperboardIcon,
  FireIcon,
  HashtagIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import {
  MarketingReelInfluencerCopy,
  MarketingReelPostTagsCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import {
  macwallPricingCopy as p,
  type ReelRefundStepIcon,
} from "@/lib/macwall-pricing-copy"
import { macwall } from "@/lib/macwall-site"

const ctaButtonClass =
  "inline-flex h-8 min-h-8 items-center justify-center rounded-full bg-white px-3.5 text-[14px] font-normal text-black no-underline transition-opacity hover:opacity-90"

const stepIcons: Record<ReelRefundStepIcon, IconSvgElement> = {
  video: ClapperboardIcon,
  tag: HashtagIcon,
  views: FireIcon,
  email: Mail01Icon,
}

const bodyTextClass = "text-[13px] leading-[1.45] text-muted-foreground"

function MilestoneRow({
  views,
  reward,
}: Readonly<{
  views: string
  reward: string
}>) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="min-w-0">{views}</span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-3.5 shrink-0 text-muted-foreground/80"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="shrink-0 text-foreground">{reward}</span>
    </div>
  )
}

function ReelStepContent({
  icon,
  body,
}: Readonly<{
  icon: ReelRefundStepIcon
  body?: string
}>) {
  if (icon === "tag") {
    return <MarketingReelPostTagsCopy className={bodyTextClass} />
  }

  if (icon === "views") {
    return (
      <div className={`flex flex-col gap-1.5 ${bodyTextClass}`}>
        <MilestoneRow
          views={`${macwall.reelRefundHalfViews.toLocaleString()} views`}
          reward="50% refund"
        />
        <MilestoneRow
          views={`${macwall.reelRefundFullViews.toLocaleString()} views`}
          reward="full refund"
        />
      </div>
    )
  }

  if (icon === "email") {
    return (
      <>
        {body ? (
          <MarketingRichText as="p" className={bodyTextClass}>
            {body}
          </MarketingRichText>
        ) : null}
        <a
          href={p.reelRefund.ctaHref}
          className={`${ctaButtonClass} mt-auto w-fit`}
        >
          {p.reelRefund.cta}
        </a>
      </>
    )
  }

  return body ? <p className={bodyTextClass}>{body}</p> : null
}

function ReelStepCard({
  index,
  title,
  icon,
  body,
}: Readonly<{
  index: number
  title: string
  icon: ReelRefundStepIcon
  body?: string
}>) {
  return (
    <div className="relative h-full pt-2.5">
      <span className="absolute top-0 right-4 z-10 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium tracking-wide text-background">
        Step {String(index + 1).padStart(2, "0")}
      </span>

      <article className="flex h-full flex-col rounded-[24px] bg-secondary px-5 pb-5 pt-6 sm:px-5 sm:pb-6 sm:pt-7">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background">
          <HugeiconsIcon
            icon={stepIcons[icon]}
            className="size-[18px] text-foreground"
            strokeWidth={1.75}
          />
        </div>

        <h2 className="mt-4 font-sans text-[18px] font-normal tracking-tight text-foreground">
          {title}
        </h2>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
          <ReelStepContent icon={icon} body={body} />
        </div>
      </article>
    </div>
  )
}

export default function MacWallMarketingReelRefundPage() {
  return (
    <div className="marketing-page antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className="marketing-main">
        <h1 className="text-center text-4xl font-normal tracking-tight text-foreground md:text-5xl">
          {p.reelRefund.title}
        </h1>

        <div className="mt-12 md:mt-16">
              <ol className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5">
                {p.reelRefund.steps.map((step, index) => (
                  <li key={step.title} className="h-full min-w-0">
                    <ReelStepCard
                      index={index}
                      title={step.title}
                      icon={step.icon}
                      body={"body" in step ? step.body : undefined}
                    />
                  </li>
                ))}
              </ol>
            </div>

            <div className="mx-auto mt-12 max-w-2xl text-center text-[12px] leading-relaxed text-muted-foreground md:mt-16">
              <p>
                <span className="font-medium text-foreground">
                  {p.reelRefund.influencerTitle}
                </span>{" "}
                <MarketingReelInfluencerCopy />
              </p>
              <p className="mt-3">
                <span className="font-medium text-foreground">
                  {p.reelRefund.finePrintLabel}
                </span>{" "}
                {p.reelRefund.finePrint}
              </p>
              <p className="mt-5">
                <Link
                  href="/pricing"
                  className="text-[13px] text-muted-foreground no-underline transition-opacity hover:opacity-70"
                >
                  Back to pricing
                </Link>
              </p>
            </div>
      </main>
    </div>
  )
}
