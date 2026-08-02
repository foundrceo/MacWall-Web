"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Share2,
  X,
} from "lucide-react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  applyDiscordMemberDiscountMajor,
  DISCORD_MEMBER_PERCENT_OFF,
} from "@/lib/discord/discount-public"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
} from "@/lib/macwall-site"
import { formatMoney } from "@/lib/pricing/money"
import { cn } from "@/lib/utils"

const PRO_MODAL_FEATURES = [
  "1,000+ curated 4K wallpapers",
  "Lifetime license & updates",
  `Up to ${macwall.maxLicensedMacs} personal Macs`,
  "Lock Screen, Screen Saver & Music Sync",
] as const

function DiscordMark({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 12.3 12.3 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.099.246.198.373.292a.077.077 0 01-.007.128 12.3 12.3 0 01-1.873.891.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export function ProModal({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const pricing = useMarketingPricing()
  const discordPrice = formatMoney(
    applyDiscordMemberDiscountMajor(pricing.permanentPriceMajor),
    pricing.currency,
    pricing.locale
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[min(90vh,520px)] max-w-[min(100%-1.5rem,380px)] gap-0 overflow-y-auto rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0"
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 pr-7">
            <Image
              src={macwallAppIconPath}
              alt=""
              width={48}
              height={48}
              className={cn("size-12 shrink-0", macwallAppIconRadiusClass)}
            />
            <div className="min-w-0">
              <DialogTitle
                id="pro-modal-title"
                className="flex items-center gap-1 font-sans text-[18px] font-semibold tracking-tight text-foreground"
              >
                {macwall.name} Pro
                <BadgeCheck className="size-3.5 shrink-0 text-[#0071e3]" aria-hidden />
              </DialogTitle>
              <p className="mt-0.5 text-[12px] leading-snug text-marketing-muted">
                {macwall.tagline}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[24px] font-semibold tracking-tight text-foreground">
              {pricing.permanentPrice}
            </span>
            {pricing.permanentStrikePrice ? (
              <span className="text-[13px] text-marketing-muted line-through">
                {pricing.permanentStrikePrice}
              </span>
            ) : null}
            <span className="w-full text-[11px] text-marketing-muted">
              one-time · no subscription
            </span>
          </div>

          <ul className="mt-3.5 space-y-2">
            {PRO_MODAL_FEATURES.map((label) => (
              <li key={label} className="flex items-center gap-2">
                <Check
                  className="size-3 shrink-0 text-marketing-muted"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className="text-[12px] leading-snug text-foreground/85">
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <TrackedPricingButton
            href={pricing.checkoutUrl}
            location="hero_pro_modal"
            ariaLabel={pricing.buyProAria}
            className="mt-4 flex h-9 w-full items-center justify-center rounded-full bg-white text-[14px] font-medium text-black no-underline transition-opacity hover:opacity-90"
          >
            Buy {macwall.name}
          </TrackedPricingButton>

          <div className="mt-3 rounded-xl border border-white/10 bg-background/35 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground">
                <Share2 className="size-3" aria-hidden />
                Share &amp; save
              </span>
              <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-medium text-foreground">
                100% back
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-marketing-muted">
              Post with {macwall.reelRefundHashtag} — refund at{" "}
              {macwall.reelRefundFullViews.toLocaleString()} views.
            </p>
            <Link
              href="/creator"
              onClick={() =>
                trackSiteEventClient("cta_click", {
                  location: "hero_pro_modal_creator",
                })
              }
              className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1 rounded-full bg-white text-[12px] font-medium text-black no-underline transition-opacity hover:opacity-90"
            >
              Creator offer
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </div>

          <a
            href={macwall.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackSiteEventClient("cta_click", {
                location: "hero_pro_modal_discord",
              })
            }
            className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-background/25 px-3 py-2.5 text-[11px] text-foreground no-underline transition-colors hover:bg-background/40"
          >
            <span className="inline-flex items-center gap-1.5 font-medium">
              <DiscordMark className="size-3.5 text-[#5865F2]" />
              Discord {DISCORD_MEMBER_PERCENT_OFF}% off
            </span>
            <span className="inline-flex items-center gap-0.5 text-marketing-muted">
              {discordPrice}
              <ArrowUpRight className="size-2.5" aria-hidden />
            </span>
          </a>

          <p className="mt-3 text-center text-[10px] text-marketing-muted">
            Free download · pay once
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
