"use client"

import { useEffect } from "react"

import { prefetchCheckoutSession } from "@/lib/checkout/prefetch-checkout"

/** Warm the primary Checkout Session after idle — one offer only to limit Stripe load. */
export function CheckoutPrefetchWarmup({
  offers = ["permanent"] as const,
}: Readonly<{
  offers?: readonly string[]
}>) {
  useEffect(() => {
    let cancelled = false

    const warm = () => {
      if (cancelled) return
      const primary = offers[0]
      if (primary) void prefetchCheckoutSession(primary)
    }

    const ric =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(warm, { timeout: 2500 })
        : null
    const timeout = ric == null ? window.setTimeout(warm, 1200) : undefined

    return () => {
      cancelled = true
      if (ric != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(ric)
      }
      if (timeout != null) window.clearTimeout(timeout)
    }
  }, [offers])

  return null
}
