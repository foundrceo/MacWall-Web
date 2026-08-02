"use client"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import {
  TrackedDownloadButton,
  TrackedPricingButton,
} from "@/components/analytics/tracked-marketing-buttons"
import { HeroWalkthroughVideo } from "@/components/macwall-marketing/hero-walkthrough-video"
import {
  HERO_PRIMARY_BTN_CLASS,
  HERO_SECONDARY_BTN_CLASS,
} from "@/lib/marketing-chrome"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"

function AppleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

/** TikTok-optimized landing: price above fold, direct Stripe checkout, minimal friction. */
export default function TikTokLandingHero() {
  const pricing = useMarketingPricing()

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-3xl pt-10 pb-6 md:pt-14 md:pb-8">
          <p className="text-[13px] font-semibold tracking-[0.08em] text-marketing-muted uppercase">
            Live wallpapers for Mac
          </p>

          <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.08] font-normal tracking-[-0.03em] text-foreground">
            Make your Mac look cinematic in one tap
          </h1>

          <p className="mt-5 text-[18px] leading-[1.5] text-marketing-muted">
            1,000+ live wallpapers. Lock Screen support. Pay once, own it
            forever.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-border bg-surface px-5 py-3">
            <span className="text-[32px] font-semibold tracking-[-0.03em] text-foreground">
              {pricing.permanentPrice}
            </span>
            <span className="text-[15px] text-marketing-muted">
              one-time
            </span>
            <span className="w-full text-[13px] text-marketing-muted">
              Up to 3 Macs · Post a Reel → get up to 100% back
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <TrackedPricingButton
              href={pricing.checkoutUrl}
              location="tiktok_landing"
              size="pill"
              className={HERO_PRIMARY_BTN_CLASS}
            >
              {pricing.getProCta}
            </TrackedPricingButton>
            <TrackedDownloadButton
              href={macwallInstallerLatestPath}
              size="pill"
              location="tiktok_landing"
              className={HERO_SECONDARY_BTN_CLASS}
            >
              <AppleIcon className="size-3.5" />
              Download for macOS
            </TrackedDownloadButton>
          </div>
        </div>

        <HeroWalkthroughVideo
          endCaption={`Live wallpapers on your Mac with ${macwall.name}.`}
          ariaLabel={`${macwall.name} preview`}
        />
      </div>
    </section>
  )
}
