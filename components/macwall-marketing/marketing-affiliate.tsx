"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  DollarCircleIcon,
  FavouriteIcon,
  Link01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { AffiliateHeroVisual } from "@/components/macwall-marketing/affiliate-hero-visual"
import { ShaderBackground } from "@/components/macwall-marketing/shader-background"
import { AFFILIATE_SHADER_PRESETS } from "@/lib/affiliate-shader-presets"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"
import { macwallAffiliateCopy as copy } from "@/lib/macwall-affiliate-copy"
import { macwallAffiliatePortalURL } from "@/lib/macwall-affiliate"

const partnerPrimaryBtnClass =
  "inline-flex h-11 min-h-11 items-center justify-center rounded-md bg-white px-6 text-[15px] font-normal text-black no-underline transition-opacity hover:opacity-90"

const partnerSecondaryBtnClass =
  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-5 text-[14px] font-normal text-white no-underline transition-colors hover:bg-white/5"

const perkIcons: Record<(typeof copy.perks)[number]["id"], IconSvgElement> = {
  channels: ShoppingBag01Icon,
  commission: FavouriteIcon,
  cookie: Link01Icon,
  payouts: DollarCircleIcon,
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
      <p className="text-[15px] font-normal leading-[1.55] text-white/60">
        {before}
        <span className="text-white/90">{highlight}</span>
        {after}
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
    <article className="relative flex min-h-[280px] flex-col overflow-hidden bg-card p-6 sm:min-h-[300px] sm:p-8">
      <ShaderBackground
        className="absolute inset-0 opacity-75"
        config={shaderConfig}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/12 to-transparent" />

      <span className="relative text-[3.5rem] font-light leading-none tracking-tight text-white/35 sm:text-[4rem]">
        {id}
      </span>
      <h3 className="relative mt-auto text-[1.55rem] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.65rem]">
        {title}
      </h3>
      <p className="relative mt-3 max-w-[34ch] text-[14px] font-normal leading-[1.5] text-white/70">
        {body}
      </p>
    </article>
  )
}

export default function MacWallMarketingAffiliatePage() {
  return (
    <>
      <MarketingTitleSection className="grid lg:grid-cols-2 lg:divide-x lg:divide-dashed lg:divide-border lg:p-0">
        <div className="flex min-w-0 flex-col justify-center p-6 lg:p-10">
          <h1 className={landingPageH1}>
            {copy.heroTitleLines[0]}
            <br />
            {copy.heroTitleLines[1]}
          </h1>
          <p className={landingPageLead}>{copy.heroLead}</p>
          <AffiliateHeroVisual className="mt-8 lg:hidden" />
          <ul className="mt-8 space-y-3.5">
            {copy.perks.map((perk) => (
              <PerkRow key={perk.id} {...perk} />
            ))}
          </ul>
          <div className="mt-9">
            <TrackedPricingButton
              href={macwallAffiliatePortalURL}
              location="affiliate_hero_partner"
              external
              size="pill"
              className={partnerPrimaryBtnClass}
              ariaLabel="Get your MacWall partner link"
            >
              {copy.primaryCta}
            </TrackedPricingButton>
          </div>
        </div>
        <AffiliateHeroVisual className="hidden min-h-[22rem] lg:block" />
      </MarketingTitleSection>
      <MarketingBodySection>
        <div className="flex flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between md:px-8">
          <h2 className="max-w-[16ch] text-3xl font-normal tracking-tighter md:text-5xl">
            {copy.socialProofTitle}
          </h2>
          <TrackedPricingButton
            href={macwallAffiliatePortalURL}
            location="affiliate_steps_apply"
            external
            size="pill"
            className={partnerSecondaryBtnClass}
            ariaLabel="Apply to the MacWall affiliate program"
          >
            {copy.secondaryCta}
          </TrackedPricingButton>
        </div>
        <div className="grid grid-cols-1 divide-y divide-dashed divide-border border-t border-dashed border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {copy.steps.map((step) => (
            <StepCard key={step.id} {...step} />
          ))}
        </div>
        <p className="border-t border-dashed border-border px-6 py-8 text-sm text-muted-foreground">
          Questions?{" "}
          <a
            href={copy.contactHref}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {copy.contactLabel}
          </a>
        </p>
      </MarketingBodySection>
    </>
  )
}
