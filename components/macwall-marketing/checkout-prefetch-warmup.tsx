"use client"

import { useEffect } from "react"

import { prefetchCheckoutSession } from "@/lib/checkout/prefetch-checkout"

const DEFAULT_OFFERS = ["permanent", "permanent_5"] as const

/** Warm Pro / Pro+ Checkout Sessions while the visitor reads the page. */
export function CheckoutPrefetchWarmup({
  offers = DEFAULT_OFFERS,
}: Readonly<{
  offers?: readonly string[]
}>) {
  useEffect(() => {
    let cancelled = false

    const warm = () => {
      if (cancelled) return
      for (const offer of offers) {
        void prefetchCheckoutSession(offer)
      }
    }

    const ric =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(warm, { timeout: 1200 })
        : null
    const timeout =
      ric == null ? window.setTimeout(warm, 400) : undefined

    const onMove = () => {
      warm()
      window.removeEventListener("pointermove", onMove)
    }
    window.addEventListener("pointermove", onMove, { passive: true })

    return () => {
      cancelled = true
      if (ric != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(ric)
      }
      if (timeout != null) window.clearTimeout(timeout)
      window.removeEventListener("pointermove", onMove)
    }
  }, [offers])

  return null
}
