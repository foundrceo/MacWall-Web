"use client"

import { useId, useState, type FormEvent } from "react"

import {
  startCashfreeCheckout,
  type CashfreeEmailStep,
} from "@/lib/cashfree/client"
import { licenseOfferFromSlug } from "@/lib/license/offers.shared"
import { cn } from "@/lib/utils"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * India checkout's one extra step: the email the license key is sent to.
 * Starts empty on purpose (browser autofill only) so a key never goes to an
 * address the buyer didn't type. Submitting opens Cashfree's payment page.
 */
export function CashfreeEmailForm({
  step,
  onBusyChange,
  className,
}: {
  step: CashfreeEmailStep
  onBusyChange?: (busy: boolean) => void
  className?: string
}) {
  const inputId = useId()
  const errorId = useId()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const offer = licenseOfferFromSlug(step.offer)

  const setBusyState = (next: boolean) => {
    setBusy(next)
    onBusyChange?.(next)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const trimmed = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    setBusyState(true)
    const result = await startCashfreeCheckout(step, trimmed)
    // On success the browser is already leaving for Cashfree; keep spinning.
    if (!result.ok) {
      setError(result.error)
      setBusyState(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <label
        htmlFor={inputId}
        className="block text-[13px] font-medium text-foreground/90"
      >
        Email
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        autoFocus
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (error) setError(null)
        }}
        disabled={busy}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "mt-2 h-11 w-full rounded-xl border bg-background/40 px-3.5 text-[15px] text-foreground transition-colors outline-none placeholder:text-marketing-muted/70 focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/10 disabled:opacity-60",
          error ? "border-red-400/60" : "border-white/10"
        )}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-[13px] text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy || undefined}
        className="relative mt-4 flex h-11 w-full items-center justify-center rounded-full bg-white text-[14px] font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-progress"
      >
        <span className={cn(busy && "invisible")}>Continue to payment</span>
        {busy ? (
          <span
            aria-hidden
            className="absolute size-[1.125em] animate-spin rounded-full border-2 border-black/20 border-t-black"
          />
        ) : null}
        {busy ? <span className="sr-only">Opening secure checkout</span> : null}
      </button>

      <p className="mt-3 text-center text-[11px] leading-snug text-marketing-muted">
        {`MacWall ${offer.name} · `}
        Secure payment by Cashfree · UPI, cards, netbanking
      </p>
    </form>
  )
}
