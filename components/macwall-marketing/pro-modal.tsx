"use client"

import Image from "next/image"
import { ArrowUpRight, BadgeCheck, Check, X } from "lucide-react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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

const PRO_MODAL_WIDTH =
  "w-[min(calc(100%-2rem),380px)] max-w-[min(calc(100%-2rem),380px)] sm:max-w-[min(calc(100%-2rem),380px)]"

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
          PRO_MODAL_WIDTH,
          "max-h-[min(90vh,560px)] gap-0 overflow-y-auto rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0"
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        <div className="px-5 pt-5 pb-6 sm:px-6">
          <div className="flex items-center gap-3.5 pr-8">
            <Image
              src={macwallAppIconPath}
              alt=""
              width={44}
              height={44}
              className={cn("size-11 shrink-0", macwallAppIconRadiusClass)}
            />
            <div className="min-w-0">
              <DialogTitle
                id="pro-modal-title"
                className="flex items-center gap-1.5 font-sans text-[17px] font-semibold tracking-tight text-foreground"
              >
                {macwall.name} Pro
                <BadgeCheck
                  className="size-4 shrink-0 text-[#0071e3]"
                  aria-hidden
                />
              </DialogTitle>
              <p className="mt-1 text-[13px] leading-snug text-marketing-muted">
                Elite live wallpapers for Mac.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span className="text-[26px] font-semibold tracking-tight text-foreground">
              {pricing.permanentPrice}
            </span>
            {pricing.permanentStrikePrice ? (
              <span className="text-[14px] text-marketing-muted line-through">
                {pricing.permanentStrikePrice}
              </span>
            ) : null}
            <span className="w-full text-[12px] text-marketing-muted">
              one-time investment · no subscription
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {PRO_MODAL_FEATURES.map((label) => (
              <li key={label} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-marketing-muted"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className="text-[13px] leading-snug text-foreground/90">
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <TrackedPricingButton
            href={pricing.checkoutUrl}
            location="hero_pro_modal"
            ariaLabel={pricing.buyProAria}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white text-[14px] font-medium text-black no-underline transition-opacity hover:opacity-90"
          >
            Unlock {macwall.name} Pro
          </TrackedPricingButton>

          <a
            href={macwall.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackSiteEventClient("cta_click", {
                location: "hero_pro_modal_discord",
              })
            }
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-background/30 px-3.5 py-3 text-foreground no-underline transition-colors hover:bg-background/45"
          >
            <DiscordMark className="size-5 shrink-0 text-[#5865F2]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] leading-snug font-medium">
                Discord exclusive
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-marketing-muted">
                Join & claim {DISCORD_MEMBER_PERCENT_OFF}% off
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-foreground tabular-nums">
              {discordPrice}
              <ArrowUpRight
                className="size-3.5 text-marketing-muted"
                aria-hidden
              />
            </span>
          </a>

          <p className="mt-4 text-center text-[11px] leading-snug text-marketing-muted">
            Secure payment · keep forever
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
