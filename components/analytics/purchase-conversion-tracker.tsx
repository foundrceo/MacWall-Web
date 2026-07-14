"use client"

import { useEffect, useRef } from "react"

import { trackSiteEventClient } from "@/lib/analytics/client"
import { macwall } from "@/lib/macwall-site"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    ttq?: {
      track: (...args: unknown[]) => void
    }
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

function fireTikTokCompletePayment() {
  if (typeof window.ttq?.track !== "function") return

  const value = Number.isFinite(purchaseValue) ? purchaseValue : 7.99

  window.ttq.track("CompletePayment", {
    value,
    currency: "USD",
    contents: [
      {
        content_id: "macwall-pro",
        content_type: "product",
        content_name: `${macwall.name} Pro`,
        price: value,
        quantity: 1,
      },
    ],
  })
}

/** Fires once per thank-you visit — internal analytics + optional Google Ads / GA4 / TikTok purchase. */
export function PurchaseConversionTracker() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    trackSiteEventClient("purchase_complete", { product: "macwall_pro" })

    const run = () => {
      fireGoogleAdsConversion()
      fireGa4Purchase()
      fireTikTokCompletePayment()
    }

    if (
      typeof window.gtag === "function" ||
      typeof window.ttq?.track === "function"
    ) {
      run()
      return
    }

    const timer = window.setTimeout(run, 1200)
    return () => window.clearTimeout(timer)
  }, [])

  return null
}
