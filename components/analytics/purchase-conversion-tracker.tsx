"use client"

import { useEffect, useRef } from "react"

import { trackSiteEventClient } from "@/lib/analytics/client"
import { markPurchaseCompleteInSession } from "@/lib/analytics/retargeting"
import { macwall } from "@/lib/macwall-site"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const purchaseValue = Number.parseFloat(
  macwall.pro.price.replace(/[^0-9.]/g, "")
)

function fireGoogleAdsConversion() {
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim()
  const conversionLabel =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim()

  if (!conversionId || !conversionLabel || typeof window.gtag !== "function") {
    return
  }

  window.gtag("event", "conversion", {
    send_to: `${conversionId}/${conversionLabel}`,
    value: Number.isFinite(purchaseValue) ? purchaseValue : undefined,
    currency: "USD",
  })
}

function fireGa4Purchase() {
  if (typeof window.gtag !== "function") return

  window.gtag("event", "purchase", {
    currency: "USD",
    value: Number.isFinite(purchaseValue) ? purchaseValue : 7.99,
    items: [
      {
        item_id: "macwall-pro",
        item_name: `${macwall.name} Pro`,
        price: Number.isFinite(purchaseValue) ? purchaseValue : 7.99,
        quantity: 1,
      },
    ],
  })
}

/** Fires once per purchase success visit — internal analytics + optional Google Ads / GA4.
 * Mounted on `/activate` (Stripe success) and `/thank-you`.
 */
export function PurchaseConversionTracker() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")?.trim() || undefined
    const hasKey = Boolean(params.get("key")?.trim() || params.get("license")?.trim())

    trackSiteEventClient("purchase_complete", {
      product: "macwall_pro",
      path: window.location.pathname,
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(hasKey ? { has_license_key: true } : {}),
    })
    markPurchaseCompleteInSession()

    // TikTok Purchase/CompletePayment fires server-side from the Stripe webhook
    // (stripe-license-email edge function) where the verified buyer email is
    // always available — see lib/analytics for the Events API client. Firing it
    // here too would double-count, so the browser only handles GA4 / Google Ads.
    const run = () => {
      fireGoogleAdsConversion()
      fireGa4Purchase()
    }

    if (typeof window.gtag === "function") {
      run()
      return
    }

    const timer = window.setTimeout(run, 1200)
    return () => window.clearTimeout(timer)
  }, [])

  return null
}
