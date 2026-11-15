"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Clock01Icon,
  DashboardSquare01Icon,
  Link01Icon,
  Moon02Icon,
  PercentCircleIcon,
  UserMultiple02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import AffiliateEarningsEstimate from "@/components/macwall-marketing/affiliate-earnings-estimate"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { AffiliateHeroVisual } from "@/components/macwall-marketing/affiliate-hero-visual"
import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import { ShaderBackground } from "@/components/macwall-marketing/shader-background"
import { AFFILIATE_SHADER_PRESETS } from "@/lib/affiliate-shader-presets"
import {
  LANDING_CARD,
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { macwallAffiliateCopy as copy } from "@/lib/macwall-affiliate-copy"
import { macwallAffiliatePortalURL } from "@/lib/macwall-affiliate"
import { cn } from "@/lib/utils"

const partnerPrimaryBtnClass =
  "inline-flex h-11 min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[15px] font-normal text-black no-underline transition-opacity hover:opacity-90"

const partnerSecondaryBtnClass =
  "inline-flex h-10 min-h-10 shrink-0 self-start items-center justify-center rounded-full border border-border bg-transparent px-5 text-[14px] font-normal text-white no-underline transition-colors hover:bg-white/5"

/** The page's card: the site's surface with rounder corners and no edge line. */
const CARD = cn(LANDING_CARD, "rounded-[36px]")

/** Gap between the cards of one row, as on the home page. */
const CARD_GRID = "grid grid-cols-1 gap-3 md:grid-cols-3"

const perkIcons: Record<(typeof copy.perks)[number]["id"], IconSvgElement> = {
  commission: PercentCircleIcon,
  channels: Link01Icon,
  cookie: Clock01Icon,
  payouts: DashboardSquare01Icon,
}

const wayIcons: Record<(typeof copy.ways)[number]["id"], IconSvgElement> = {
  reel: Video01Icon,
  friend: UserMultiple02Icon,
  sleep: Moon02Icon,
}

function PerkRow({
  id,
  before,
  highlight,
  after,
}: Readonly<(typeof copy.perks)[number]>) {
  return (
    <li className="flex items-start gap-3">
      <HugeiconsIcon
        icon={perkIcons[id]}
        className="mt-1 size-[18px] shrink-0 text-white/50"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="text-[15px] leading-[1.55] font-normal text-white/60">
        {before}
        <span className="text-white/90">{highlight}</span>
        {after}
      </p>
    </li>
  )
}

function WayCard({
  id,
  title,
  body,
  earn,
}: Readonly<(typeof copy.ways)[number]>) {
  return (
    <li className={cn(CARD, "flex flex-col p-7 sm:p-8")}>
      <HugeiconsIcon
        icon={wayIcons[id]}
        className="size-8 text-ink"
        strokeWidth={1.5}
        aria-hidden
      />
      <h3 className="mt-8 text-[22px] leading-7 font-medium tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-[38ch] text-[15px] leading-[23px] text-ink-2">
        {body}
      </p>
      <p className="mt-auto pt-8 text-[14px] leading-5 text-emerald-300">
        {earn}
      </p>
    </li>
  )
}

function StepCard({
  id,
  title,
  body,
  shaderId,
}: Readonly<(typeof copy.steps)[number]>) {
  const shaderConfig = AFFILIATE_SHADER_PRESETS[shaderId]

  return (
    <li
      className={cn(
        CARD,
        "relative flex min-h-[300px] flex-col overflow-hidden p-7 sm:min-h-[340px] sm:p-8"
      )}
    >
      <ShaderBackground
        className="absolute inset-0 opacity-75"
        config={shaderConfig}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/12 to-transparent" />

      <span className="relative text-[3.5rem] leading-none font-light tracking-tight text-white/40 sm:text-[4rem]">
        {id}
      </span>
      <h3 className="relative mt-auto text-[22px] leading-7 font-medium tracking-tight text-white">
        {title}
      </h3>
      <p className="relative mt-2 max-w-[34ch] text-[15px] leading-[23px] text-white/75 md:min-h-[69px]">
        {body}
      </p>
    </li>
  )
}

export default function MacWallMarketingAffiliatePage() {
  return (
    <>
      <MarketingSection className="grid items-center gap-12 pt-10 sm:pt-14 lg:grid-cols-2 lg:gap-20 lg:pt-20">
        <div className="min-w-0">
          <h1 className="font-display text-[36px] leading-[42px] font-normal tracking-tight text-balance text-ink sm:text-[48px] sm:leading-[56px] xl:text-[52px] xl:leading-[60px]">
            {copy.heroTitleLines[0]} {copy.heroTitleLines[1]}
          </h1>
          <p className="mt-5 max-w-[30rem] text-[17px] leading-7 text-ink-2">
            {copy.heroLead}
          </p>
          <AffiliateHeroVisual className="mt-10 lg:hidden" />
          <ul className="mt-10 space-y-4">
            {copy.perks.map((perk) => (
              <PerkRow key={perk.id} {...perk} />
            ))}
          </ul>
          <div className="mt-10">
            <TrackedPricingButton
              href={macwallAffiliatePortalURL}
              location="affiliate_hero_partner"
              external
              size="pill"
              className={partnerPrimaryBtnClass}
              ariaLabel="Get your free MacWall affiliate link"
            >
              {copy.primaryCta}
            </TrackedPricingButton>
          </div>
        </div>
        <AffiliateHeroVisual className="hidden lg:block" />
      </MarketingSection>

      <MarketingSection aria-labelledby="affiliate-ways">
        <LandingSectionHeader
          id="affiliate-ways"
          title={copy.waysTitle}
          lead={copy.waysLead}
        />
        <ul className={CARD_GRID}>
          {copy.ways.map((way) => (
            <WayCard key={way.id} {...way} />
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection aria-labelledby="affiliate-steps">
        <div className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-end sm:justify-between lg:pb-14">
          <LandingSectionHeader
            id="affiliate-steps"
            title={copy.socialProofTitle}
            className="pb-0 lg:pb-0"
          />
          <TrackedPricingButton
            href={macwallAffiliatePortalURL}
            location="affiliate_steps_apply"
            external
            size="pill"
            className={partnerSecondaryBtnClass}
            ariaLabel="Join the MacWall affiliate program"
          >
            {copy.secondaryCta}
          </TrackedPricingButton>
        </div>
        <ol className={CARD_GRID}>
          {copy.steps.map((step) => (
            <StepCard key={step.id} {...step} />
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection aria-labelledby="affiliate-estimate">
        <AffiliateEarningsEstimate headingId="affiliate-estimate" />
      </MarketingSection>

      <MarketingFaqSection items={copy.faq} heading={copy.faqTitle} />

      <MarketingSection sectionClassName={LANDING_SECTION_END}>
        <div className="relative flex flex-col items-start gap-8 overflow-hidden rounded-[36px] bg-[#0d0d0e] bg-[radial-gradient(90%_140%_at_0%_0%,rgba(16,185,129,0.16),transparent_60%)] p-7 ring-1 ring-white/[0.08] ring-inset squircle sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
          <div className="min-w-0">
            <h2 className="font-display text-[32px] leading-10 font-normal tracking-tight text-balance text-ink sm:text-[40px] sm:leading-[48px]">
              {copy.bottomTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-[22px] text-ink-2">
              {copy.bottomLead}
            </p>
          </div>
          <TrackedPricingButton
            href={macwallAffiliatePortalURL}
            location="affiliate_bottom_cta"
            external
            size="pill"
            className={partnerPrimaryBtnClass}
            ariaLabel="Get your free MacWall affiliate link"
          >
            {copy.primaryCta}
          </TrackedPricingButton>
        </div>
      </MarketingSection>
    </>
  )
}
