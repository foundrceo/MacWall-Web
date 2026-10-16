"use client"

import { useState } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { cn } from "@/lib/utils"
import { windowsPreorderApiPath } from "@/lib/windows/preorder.shared"

type Status = "idle" | "sending" | "error"

/**
 * Email → Stripe Checkout for Windows early access. The price shown is the
 * same localized Pro price the rest of the site shows.
 */
export function WindowsWaitlistForm({ className }: { className?: string }) {
  const pricing = useMarketingPricing()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    trackSiteEventClient("checkout_started", {
      location: "windows_waitlist",
      plan: "windows_preorder",
    })
    try {
      const res = await fetch(windowsPreorderApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const body = (await res.json().catch(() => null)) as {
        url?: string
        error?: string
      } | null
      if (res.ok && body?.url) {
        window.location.assign(body.url)
        return
      }
      setError(body?.error ?? "Couldn’t start checkout. Try again.")
      setStatus("error")
    } catch {
      setError("Couldn’t start checkout. Check your connection and try again.")
      setStatus("error")
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="flex w-full flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="windows-waitlist-email" className="sr-only">
          Your email
        </label>
        <input
          id="windows-waitlist-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status === "error") setStatus("idle")
          }}
          className="h-12 w-full min-w-0 rounded-full bg-white/10 px-5 text-[16px] text-foreground placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[15px] font-medium whitespace-nowrap text-black transition-colors hover:bg-white/90 disabled:opacity-70"
        >
          {status === "sending"
            ? "Opening checkout…"
            : `Reserve for ${pricing.permanentPrice}`}
        </button>
      </form>
      {status === "error" ? (
        <p role="alert" className="mt-2 text-[13px] text-red-300">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          One-time payment, no subscription.
          {pricing.permanentLocalHint ? ` ${pricing.permanentLocalHint}.` : ""}{" "}
          Full refund any time before launch.
        </p>
      )}
    </div>
  )
}
