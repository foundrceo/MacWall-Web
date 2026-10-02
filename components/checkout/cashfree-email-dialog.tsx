"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

import { CashfreeEmailForm } from "@/components/checkout/cashfree-email-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CASHFREE_EMAIL_STEP_EVENT,
  type CashfreeEmailStep,
} from "@/lib/cashfree/client"
import { macwallAppIconPath, macwallAppIconRadiusClass } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * India buy buttons open this instead of leaving the page: it asks where to
 * send the license key, then opens Cashfree. Mounted once in the marketing
 * layout; buy clicks reach it through CASHFREE_EMAIL_STEP_EVENT.
 */
export function CashfreeEmailDialog() {
  const [step, setStep] = useState<CashfreeEmailStep | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onStep = (event: Event) => {
      const detail = (event as CustomEvent<CashfreeEmailStep>).detail
      if (!detail) return
      event.preventDefault() // tells the buy button the dialog took it
      setBusy(false)
      setStep(detail)
    }
    window.addEventListener(CASHFREE_EMAIL_STEP_EVENT, onStep)
    return () => window.removeEventListener(CASHFREE_EMAIL_STEP_EVENT, onStep)
  }, [])

  // Back from Cashfree restores this page from bfcache; start clean.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      setBusy(false)
      setStep(null)
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  const close = () => {
    if (!busy) setStep(null)
  }

  return (
    <Dialog open={step !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(100%-2rem,400px)] gap-0 rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0 sm:max-w-[400px]"
      >
        <button
          type="button"
          onClick={close}
          disabled={busy}
          className="absolute top-4 right-4 z-10 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-40"
          aria-label="Close"
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        <div className="px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
          <Image
            src={macwallAppIconPath}
            alt=""
            width={40}
            height={40}
            className={cn("size-10", macwallAppIconRadiusClass)}
          />
          <DialogTitle className="mt-4 pr-8 font-sans text-[19px] leading-snug font-semibold tracking-tight text-foreground">
            Where should we send your license?
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-[13px] leading-snug text-marketing-muted">
            Your license key is emailed here and shown right after payment.
          </DialogDescription>

          {step ? (
            <CashfreeEmailForm
              key={`${step.offer}:${step.promo ?? ""}`}
              step={step}
              onBusyChange={setBusy}
              className="mt-5"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
