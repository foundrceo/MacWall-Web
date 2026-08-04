"use client"

import { useEffect, useRef } from "react"

import { trackSiteEventClient } from "@/lib/analytics/client"
import { trackMetaPurchase } from "@/lib/analytics/meta-client"
import { markPurchaseCompleteInSession } from "@/lib/analytics/retargeting"
import { macwall } from "@/lib/macwall-site"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const fallbackPurchaseValue = Number.parseFloat(
  macwall.pro.price.replace(/[^0-9.]/g, "")
)

function fireGoogleAdsConversion(value: number, currency: string) {
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim()
  const conversionLabel =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim()

  if (!conversionId || !conversionLabel || typeof window.gtag !== "function") {
    return
  }

  window.gtag("event", "conversion", {
    send_to: `${conversionId}/${conversionLabel}`,
    value: Number.isFinite(value) ? value : undefined,
    currency,
  })
}

function fireGa4Purchase(value: number, currency: string) {
  if (typeof window.gtag !== "function") return

  window.gtag("event", "purchase", {
    currency,
    value: Number.isFinite(value) ? value : 7.99,
    items: [
      {
        item_id: "macwall-pro",
        item_name: `${macwall.name} Pro`,
        price: Number.isFinite(value) ? value : 7.99,
        quantity: 1,
      },
    ],
  })
}

/** Fires once per verified purchase success visit — GA4 / Google Ads.
 * Mounted on `/activate` (after Stripe verify) and `/thank-you`.
 */
export function PurchaseConversionTracker({
  amount,
  currency,
  verified = false,
}: Readonly<{
  amount?: number
  currency?: string
  /** When true, session was server-verified paid. */
  verified?: boolean
}> = {}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")?.trim() || undefined
    const hasKey = Boolean(
      params.get("key")?.trim() || params.get("license")?.trim()
    )

    // Refuse to fire ads conversions for unverified session_id visits.
    if (sessionId && !verified) return

    const value =
      typeof amount === "number" && Number.isFinite(amount)
        ? amount
        : Number.isFinite(fallbackPurchaseValue)
          ? fallbackPurchaseValue
          : 7.99
    const curr = (currency || "USD").toUpperCase()

    trackSiteEventClient("purchase_complete", {
      product: "macwall_pro",
      path: window.location.pathname,
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(hasKey ? { has_license_key: true } : {}),
      ...(verified ? { verified: true } : {}),
      value,
      currency: curr,
    })
    markPurchaseCompleteInSession()

    // TikTok Purchase fires server-side from the Stripe webhook — don't double-count.
    // Meta Purchase fires here (browser Pixel) until CAPI is wired.
    const run = () => {
      trackMetaPurchase({ value, currency: curr })
      fireGoogleAdsConversion(value, curr)
      fireGa4Purchase(value, curr)
    }

    if (typeof window.gtag === "function") {
      run()
      return
    }

    const timer = window.setTimeout(run, 1200)
    return () => window.clearTimeout(timer)
  }, [amount, currency, verified])

  return null
}
