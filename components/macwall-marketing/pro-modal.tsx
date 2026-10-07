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
} from "@/lib/macwall-site"
import { macwallPricingCopy } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

/** What Pro adds, one fact per line; price terms live next to the price. */
const PRO_MODAL_FEATURES = [
  "1,000+ live wallpapers, most in 4K",
  "Live Lock Screen & Screen Saver",
  "Music Sync with Apple Music & Spotify",
  `Up to ${macwall.maxLicensedMacs} Macs, free updates forever`,
] as const

/** Real customers who left a review with a photo. */
const REVIEWER_AVATARS = macwallPricingCopy.reviews.items
  .filter((item) => item.avatarSrc)
  .slice(0, 4)

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
        className={cn(
          PRO_MODAL_WIDTH,
          "max-h-[min(92vh,640px)] gap-0 overflow-y-auto rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0"
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

        <div className="px-5 pt-7 pb-5 sm:px-6">
          {/* Who, and who else bought it. */}
          <div className="flex flex-col items-center text-center">
            <Image
              src={macwallAppIconPath}
              alt=""
              width={56}
              height={56}
              loading="eager"
              className={cn("size-14", macwallAppIconRadiusClass)}
            />
            <DialogTitle
              id="pro-modal-title"
              className="font-display mt-3 text-2xl leading-tight font-normal tracking-tight text-foreground"
            >
              {macwall.name} Pro
            </DialogTitle>
            <p className="mt-1 text-[13px] text-marketing-muted">
              Everything, unlocked.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex" aria-hidden>
                {REVIEWER_AVATARS.map((item, index) => (
                  <Image
                    key={item.name}
                    src={item.avatarSrc as string}
                    alt=""
                    width={40}
                    height={40}
                    sizes="20px"
                    loading="eager"
                    className="-ml-1.5 size-5 rounded-full object-cover ring-2 ring-secondary first:ml-0"
                    style={{ zIndex: REVIEWER_AVATARS.length - index }}
                  />
                ))}
              </span>
              <p className="text-[12px] text-marketing-muted">
                Bought by{" "}
                <span className="font-medium text-foreground">
                  {macwall.pro.socialProofMembers}
                </span>{" "}
                Mac users
              </p>
            </div>
          </div>

          {/* The offer: price and what it buys, as one block. */}
          <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <div className="flex items-end justify-between gap-3">
              <span className="font-display text-[40px] leading-none font-normal tracking-tight text-foreground tabular-nums">
                {pricing.permanentPrice}
              </span>
              <span className="pb-1 text-right text-[12px] leading-4 text-marketing-muted">
                One-time payment
                <br />
                No subscription
              </span>
            </div>
            {pricing.permanentLocalHint ? (
              <p className="mt-1.5 text-[12px] text-marketing-muted tabular-nums">
                {pricing.permanentLocalHint}
              </p>
            ) : null}

            <ul className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4">
              {PRO_MODAL_FEATURES.map((label) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-white text-black">
                    <Check className="size-2.5" strokeWidth={3.5} aria-hidden />
                  </span>
                  <span className="text-[13px] leading-snug text-foreground/90">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <TrackedPricingButton
            href={pricing.checkoutUrl}
            location="hero_pro_modal"
            ariaLabel={pricing.buyProAria}
            onClick={() => setRedirecting(true)}
            className={cn(
              "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[14px] font-medium text-black no-underline transition-colors hover:bg-white/90",
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

          {/* Point-of-sale disclosure: terms and refund policy before payment.
              One idea per line: what you're charged, then what you agree to. */}
          <div className="mt-4 space-y-0.5 text-center text-[11px] leading-4 text-balance text-marketing-muted">
            <p>
              {pricing.permanentLocalHint
                ? "Tax calculated at checkout"
                : "Charged in USD · Tax calculated at checkout"}
            </p>
            <p>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
