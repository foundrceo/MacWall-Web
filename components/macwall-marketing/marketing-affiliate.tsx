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
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { AFFILIATE_SHADER_PRESETS } from "@/lib/affiliate-shader-presets"
import { macwallAffiliateCopy as copy } from "@/lib/macwall-affiliate-copy"
import { macwallAffiliatePortalURL } from "@/lib/macwall-affiliate"

const partnerPrimaryBtnClass =
  "inline-flex h-11 min-h-11 items-center justify-center rounded-full bg-white px-6 text-[15px] font-normal text-black no-underline transition-opacity hover:opacity-90"

const partnerSecondaryBtnClass =
  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center rounded-full bg-white/10 px-5 text-[14px] font-normal text-white ring-1 ring-white/12 no-underline backdrop-blur-sm transition-colors hover:bg-white/14"

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
    <article className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[20px] p-6 ring-1 ring-white/[0.08] sm:min-h-[320px] sm:p-7">
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
    <div className="marketing-page bg-black text-white antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className="marketing-main">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-stretch lg:gap-10 xl:gap-14">
          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="text-[clamp(2.35rem,4.8vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.03em] text-white">
              {copy.heroTitleLines[0]}
              <br />
              {copy.heroTitleLines[1]}
            </h1>

            <p className="mt-5 max-w-[38ch] text-[16px] font-normal leading-[1.55] text-white/65 sm:text-[17px]">
              {copy.heroLead}
            </p>

            <AffiliateHeroVisual className="mt-8 lg:hidden" />

            <ul className="mt-8 space-y-3.5 lg:mt-9">
              {copy.perks.map((perk) => (
                <PerkRow key={perk.id} {...perk} />
              ))}
            </ul>

            <div className="mt-9 sm:mt-10">
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

          <AffiliateHeroVisual className="hidden lg:block" />
        </div>

        <section className="mt-16 pb-4 md:mt-20">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h2 className="max-w-[15ch] text-[clamp(1.85rem,4vw,3rem)] font-normal leading-[1.08] tracking-[-0.03em] text-white">
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

          <div className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {copy.steps.map((step) => (
              <StepCard key={step.id} {...step} />
            ))}
          </div>

          <p className="mt-11 text-[13px] font-normal text-white/40">
            Questions?{" "}
            <a
              href={copy.contactHref}
              className="text-white/60 underline-offset-2 hover:text-white/80 hover:underline"
            >
              {copy.contactLabel}
            </a>
          </p>
        </section>
      </main>

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
