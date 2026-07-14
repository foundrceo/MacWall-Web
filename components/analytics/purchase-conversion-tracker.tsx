"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  readCheckoutEmailFromSearch,
  trackTikTokPurchaseWithIdentify,
} from "@/lib/analytics/tiktok-client"
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

/** Fires once per thank-you visit — internal analytics + optional Google Ads / GA4 / TikTok purchase. */
export function PurchaseConversionTracker() {
  const fired = useRef(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    trackSiteEventClient("purchase_complete", { product: "macwall_pro" })

    const checkoutEmail = readCheckoutEmailFromSearch(searchParams)

    const run = () => {
      fireGoogleAdsConversion()
      fireGa4Purchase()
      void trackTikTokPurchaseWithIdentify(
        checkoutEmail ? { email: checkoutEmail } : undefined
      )
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
  }, [searchParams])

  return null
}
