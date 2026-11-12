"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwallCatalog,
} from "@/lib/macwall-site"
import { macwallPricingCopy } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

/** What Pro adds, one fact per line; price terms live next to the price. */
const PRO_MODAL_FEATURES = [
  `${macwallCatalog.liveCountLabel} live wallpapers, most in 4K`,
  "Live Lock Screen & Screen Saver",
  "Music Sync with Apple Music & Spotify",
  `Up to ${macwall.maxLicensedMacs} Macs, free updates forever`,
  `${macwall.refundWindowDays}-day money-back guarantee`,
  "Key by email. Install on your Mac anytime.",
] as const

/** Real customers who left a review with a photo. */
const REVIEWER_AVATARS = macwallPricingCopy.reviews.items
  .filter((item) => item.avatarSrc)
  .slice(0, 4)

const PRO_MODAL_WIDTH =
  "w-[min(calc(100%-1.5rem),400px)] max-w-[min(calc(100%-1.5rem),400px)] sm:max-w-[min(calc(100%-1.5rem),400px)]"

export function ProModal({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const pricing = useMarketingPricing()
  /** Checkout is a server redirect to Stripe; show that the click landed. */
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Coming back from Stripe via the back button restores this page from
    // the back/forward cache, spinner and all; reset it.
    const reset = () => setRedirecting(false)
    window.addEventListener("pageshow", reset)
    return () => window.removeEventListener("pageshow", reset)
  }, [])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setRedirecting(false)
        onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={false}
        // Above the sale banner (z-51), social proof toasts (z-70) and the
        // gallery's purchase bars (up to z-80), which would otherwise cover
        // the top of the card or sit on it.
        overlayClassName="z-[90]"
        className={cn(
          PRO_MODAL_WIDTH,
          "z-[90]",
          // A column: the offer scrolls, the button and terms stay pinned, so
          // on a short screen nothing is cut off and Get Pro is always in view.
          "flex max-h-[calc(100dvh-1.5rem)] flex-col gap-0 overflow-hidden rounded-[28px] border border-white/10 bg-secondary p-0 shadow-2xl ring-0"
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground transition-colors hover:bg-white/[0.12] hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
          aria-label="Close"
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-4 sm:px-6">
          {/* Who, and who else bought it: one row, so the offer starts high. */}
          <div className="flex items-center gap-3.5 pe-10">
            <Image
              src={macwallAppIconPath}
              alt=""
              width={48}
              height={48}
              loading="eager"
              className={cn("size-12 shrink-0", macwallAppIconRadiusClass)}
            />
            <div className="min-w-0">
              <DialogTitle
                id="pro-modal-title"
                className="font-display text-[22px] leading-[26px] font-normal tracking-tight text-foreground"
              >
                {macwall.name} Pro
              </DialogTitle>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] leading-[18px] text-marketing-muted">
                {REVIEWER_AVATARS.length > 0 ? (
                  <span className="flex shrink-0" aria-hidden>
                    {REVIEWER_AVATARS.map((item, index) => (
                      <Image
                        key={item.name}
                        src={item.avatarSrc as string}
                        alt=""
                        width={40}
                        height={40}
                        sizes="16px"
                        loading="eager"
                        className="-ml-1.5 size-4 rounded-full object-cover ring-2 ring-secondary first:ml-0"
                        style={{ zIndex: REVIEWER_AVATARS.length - index }}
                      />
                    ))}
                  </span>
                ) : null}
                <span className="truncate">
                  <span className="font-medium text-foreground">
                    {macwall.pro.socialProofDownloads}
                  </span>{" "}
                  downloads
                </span>
              </p>
            </div>
          </div>

          {/* The offer: price and what it buys, as one block. */}
          <div className="mt-5 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07]">
            {pricing.sale ? (
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                <span className="inline-flex items-center rounded-full bg-[#67EDEC]/[0.12] px-2.5 py-1 text-[11px] leading-none font-semibold tracking-wide text-[#67EDEC]">
                  {pricing.sale.name} · {pricing.sale.percentOff}% off
                </span>
                <span className="text-[12px] leading-4 text-marketing-muted">
                  Auto-applied · ends {pricing.sale.endsLabel}
                </span>
              </div>
            ) : null}

            <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-display text-[38px] leading-[42px] font-normal tracking-tight text-foreground tabular-nums">
                {pricing.permanentPrice}
              </span>
              {pricing.sale ? (
                <s className="text-[17px] leading-6 text-marketing-muted tabular-nums decoration-white/40">
                  <span className="sr-only">Was </span>
                  {pricing.sale.regular.permanentPrice}
                </s>
              ) : null}
            </p>
            <p className="mt-1 text-[12px] leading-[18px] text-marketing-muted">
              One-time payment · No subscription
            </p>

            <ul className="mt-4 space-y-2.5">
              {PRO_MODAL_FEATURES.map((label) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span className="mt-px inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-white text-black">
                    <Check className="size-3" strokeWidth={3.25} aria-hidden />
                  </span>
                  <span className="text-[13.5px] leading-5 text-foreground/90">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pinned: the action and the point-of-sale terms are always visible. */}
        <div className="shrink-0 px-5 pt-0.5 pb-4 sm:px-6">
          <TrackedPricingButton
            href={pricing.checkoutUrl}
            location="hero_pro_modal"
            ariaLabel={pricing.buyProAria}
            onClick={() => setRedirecting(true)}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-black no-underline transition-colors hover:bg-white/90",
              redirecting && "pointer-events-none bg-white/80"
            )}
          >
            {redirecting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Opening checkout…
              </>
            ) : (
              pricing.getProCta
            )}
          </TrackedPricingButton>

          {/* Point-of-sale disclosure: what you're charged and the terms you
              agree to, before payment, in two lines. */}
          <p className="mt-2.5 text-center text-[11px] leading-4 text-balance text-marketing-muted">
            {pricing.permanentLocalHint
              ? `${pricing.permanentLocalHint}, may be charged in your currency. Total shown before you pay.`
              : "Price in USD. Total shown before you pay."}{" "}
            By purchasing, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/refund"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Refund Policy
            </Link>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
