"use client"

import {
  BatteryCharging01Icon,
  Download04Icon,
  FileImportIcon,
  GiftIcon,
  InfinityCircleIcon,
  InformationCircleIcon,
  LaptopIcon,
  Mail01Icon,
  MusicNote01Icon,
  SecurityLockIcon,
  SquareLock02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Image from "next/image"
import { useEffect, useState, type ReactNode } from "react"

import { TrackedLink } from "@/components/analytics/tracked-link"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { PricingPlans } from "@/components/macwall-marketing/pricing-plans"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const PLANS_ANCHOR_ID = "plans"

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function SectionHeading({
  title,
  lead,
  id,
}: Readonly<{ title: string; lead?: string; id?: string }>) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2
        id={id}
        className="font-display text-[32px] leading-[1.1] font-normal text-white sm:text-[40px]"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-6 text-landing-muted sm:text-[16px]">
          {lead}
        </p>
      ) : null}
    </div>
  )
}

/** Solid rating star — crisper than a filled stroke icon at small sizes. */
function StarGlyph({ size }: Readonly<{ size: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.6l2.47 5.2 5.7.72-4.2 3.93 1.07 5.65L10 14.3l-5.04 2.8 1.07-5.65-4.2-3.93 5.7-.72L10 1.6z" />
    </svg>
  )
}

function Stars({ size = 14 }: Readonly<{ size?: number }>) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-400"
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarGlyph key={index} size={size} />
      ))}
    </span>
  )
}

const reviewers = p.reviews.items.filter((item) => item.avatarSrc)

function AvatarStack({ size = 24 }: Readonly<{ size?: number }>) {
  return (
    <span className="flex" aria-hidden>
      {reviewers.map((item, index) => (
        <Image
          key={item.name}
          src={item.avatarSrc as string}
          alt=""
          width={size * 2}
          height={size * 2}
          sizes={`${size}px`}
          priority
          // Faces overlap at rest and spread a little when the pill is hovered.
          className="-ml-2 rounded-full object-cover ring-2 ring-[#0c0c0d] group-hover:-ml-1 first:ml-0 group-hover:first:ml-0 motion-safe:transition-[margin] motion-safe:duration-300 motion-safe:ease-out"
          style={{
            width: size,
            height: size,
            zIndex: reviewers.length - index,
          }}
        />
      ))}
    </span>
  )
}

/** Glass pill: faces, one line of proof, stars (stars hide on small phones). */
function SocialProof() {
  return (
    <div className="group inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] py-1 pr-3 pl-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <AvatarStack />
      <p className="text-[13px] text-zinc-400">
        Loved by{" "}
        <span className="font-medium text-white">
          {macwall.pro.socialProofMembers}
        </span>{" "}
        Mac users
        <span className="sr-only">, rated 5 stars</span>
      </p>
      <span
        aria-hidden
        className="hidden h-3.5 w-px bg-white/[0.12] min-[400px]:block"
      />
      <span className="hidden min-[400px]:inline-flex">
        <Stars size={12} />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function PricingHero({
  checkoutError,
}: Readonly<{ checkoutError: string | null }>) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <SocialProof />

      <h1 className="mt-6 text-4xl font-normal tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
        Bring your Mac to life.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-balance text-zinc-400 sm:text-lg">
        1,000+ cinematic 4K wallpapers for your desktop and Lock Screen, running
        native and near idle so your Mac stays fast. Pay once, keep every future
        update, and try it all free for 24 hours first.
      </p>

      {checkoutError ? (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {checkoutError}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Trust                                                               */
/* ------------------------------------------------------------------ */

type Tile = { icon: IconSvgElement; title: string; body: ReactNode }

const FEATURE_TILES: readonly Tile[] = [
  {
    icon: Video01Icon,
    title: "1,000+ wallpapers",
    body: "Every cinematic loop, set in one tap.",
  },
  {
    icon: SquareLock02Icon,
    title: "Live Lock Screen",
    body: "Your wallpaper on Lock Screen and Screen Saver.",
  },
  {
    icon: LaptopIcon,
    title: "Bend",
    body: "Close the lid, watch the desktop fold.",
  },
  {
    icon: BatteryCharging01Icon,
    title: "Near idle",
    body: "Under 1% CPU, and pauses on battery.",
  },
  {
    icon: MusicNote01Icon,
    title: "Music Sync",
    body: "Album-art colors from Apple Music and Spotify.",
  },
]

const TRUST_TILES: readonly Tile[] = [
  {
    icon: FileImportIcon,
    title: "Your own videos",
    body: "Turn any clip into a live wallpaper.",
  },
  {
    icon: SecurityLockIcon,
    title: "Secure checkout",
    body: "Powered by Whop. SSL encrypted.",
  },
  {
    icon: Mail01Icon,
    title: "Instant license",
    body: "In your inbox within seconds.",
  },
  {
    icon: InfinityCircleIcon,
    title: "Pay once",
    body: "Every future update included.",
  },
  {
    icon: Download04Icon,
    title: "Try it first",
    body: "Every feature free for 24 hours.",
  },
]

/**
 * Ten identical tiles on one hairline grid (two rows of five on desktop):
 * what Pro unlocks, then why it's safe to buy.
 */
function BenefitsGrid() {
  return (
    <div className="mx-auto mt-10 max-w-6xl rounded-2xl border border-white/[0.08] bg-white/[0.012] p-1.5">
      <ul
        role="list"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-5"
      >
        {[...FEATURE_TILES, ...TRUST_TILES].map((tile) => (
          <li
            key={tile.title}
            className="relative overflow-hidden bg-[#0b0b0c] p-6"
          >
            {/* Glass shade, same as the plan cards */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 100%)",
              }}
            />
            <HugeiconsIcon
              icon={tile.icon}
              size={22}
              strokeWidth={1.5}
              className="relative text-blue-300"
              aria-hidden
            />
            <h3 className="relative mt-4 text-[15px] leading-6 font-medium text-white">
              {tile.title}
            </h3>
            <p className="relative mt-1 text-[14px] leading-6 text-zinc-500">
              {tile.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Reel refund                                                         */
/* ------------------------------------------------------------------ */

function ReelRefundCallout() {
  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[#0d0d0e] bg-[radial-gradient(90%_120%_at_0%_0%,rgba(16,185,129,0.14),transparent_60%)] p-6 ring-1 ring-white/[0.08] ring-inset sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <HugeiconsIcon
            icon={GiftIcon}
            size={26}
            strokeWidth={1.5}
            className="mt-1 shrink-0 text-emerald-300"
            aria-hidden
          />
          <div>
            <h2 className="font-display text-[24px] leading-tight font-normal text-white sm:text-[28px]">
              {p.reelRefund.title}
            </h2>
            <p className="mt-2 max-w-md text-[14px] leading-6 text-landing-muted">
              {macwall.reelRefundHalfViews.toLocaleString()} views gets you 50%
              back. {macwall.reelRefundFullViews.toLocaleString()} views gets
              you 100% back. Instagram or TikTok, organic views only.
            </p>
          </div>
        </div>
        <TrackedLink
          href={p.reelRefundHook.href}
          eventName="pricing_click"
          metadata={{ location: "pricing_reel_refund_callout" }}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] px-5 text-[14px] font-medium text-white ring-1 ring-white/10 transition-colors ring-inset hover:bg-white/[0.13]"
        >
          See how it works
        </TrackedLink>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sticky mobile bar                                                   */
/* ------------------------------------------------------------------ */

/** Appears on phones once the plan cards have scrolled out of view. */
function StickyMobileCta({ checkoutUrl }: Readonly<{ checkoutUrl: string }>) {
  const pricing = useMarketingPricing()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const plans = document.getElementById(PLANS_ANCHOR_ID)
    if (!plans) return
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(plans)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 md:hidden",
        "motion-safe:transition-all motion-safe:duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#111318]/95 p-2 pl-4 ring-1 ring-white/10 backdrop-blur-md ring-inset">
        <span className="min-w-0">
          <span className="block text-[14px] leading-5 text-white">
            Pro · {pricing.permanentPrice}
          </span>
          <span className="block text-[12px] leading-4 text-landing-muted">
            One-time · free updates
          </span>
        </span>
        <TrackedPricingButton
          href={checkoutUrl}
          location="pricing_sticky_mobile"
          warmOnView
          ariaLabel={pricing.buyProAria}
          size="pill"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 text-[14px] font-medium text-white no-underline hover:bg-blue-500"
        >
          {pricing.getProCta}
        </TrackedPricingButton>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * Full conversion-focused pricing page (preview). Every claim comes from
 * existing copy; checkout URLs and card analytics match the live page.
 */
export function PricingPagePlans({
  checkoutUrl,
  checkoutError,
}: Readonly<{ checkoutUrl: string; checkoutError: string | null }>) {
  return (
    <>
      <MarketingSection className="px-4 py-16 sm:py-20 lg:px-6">
        <PricingHero checkoutError={checkoutError} />
        <div id={PLANS_ANCHOR_ID} className="mt-12 scroll-mt-24">
          <PricingPlans checkoutUrl={checkoutUrl} />
        </div>
        <p className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 text-center text-[13px] text-landing-muted">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={15}
            strokeWidth={1.75}
            className="shrink-0"
            aria-hidden
          />
          Pro and Pro+ have the same features. Pro+ just covers more Macs.
        </p>
      </MarketingSection>

      <MarketingSection className="px-4 py-16 sm:py-20 lg:px-6">
        <SectionHeading
          title="Everything Pro unlocks"
          lead="Everything below comes with one payment. No renewals, ever."
        />
        <BenefitsGrid />
      </MarketingSection>

      <MarketingSection className="px-4 py-12 lg:px-6">
        <ReelRefundCallout />
      </MarketingSection>

      <MarketingFaqSection defaultOpenQuestion={p.faq[0]?.q} />

      <StickyMobileCta checkoutUrl={checkoutUrl} />
    </>
  )
}
