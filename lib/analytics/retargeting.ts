"use client"

import { trackSiteEventClient } from "@/lib/analytics/client"
import { trackTikTokAddToCart } from "@/lib/analytics/tiktok-client"

const CHECKOUT_STARTED_KEY = "macwall_checkout_started_at"
const PURCHASE_COMPLETE_KEY = "macwall_purchase_complete"
const ABANDONMENT_FIRED_KEY = "macwall_checkout_abandonment_fired"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Mark that this session started checkout (pricing CTA or Stripe checkout). */
export function markCheckoutStartedInSession(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(CHECKOUT_STARTED_KEY, String(Date.now()))
    window.sessionStorage.removeItem(ABANDONMENT_FIRED_KEY)
  } catch {
    // ignore storage failures
  }
}

/** Call on thank-you / purchase complete to suppress abandonment retargeting. */
export function markPurchaseCompleteInSession(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(PURCHASE_COMPLETE_KEY, "1")
    window.sessionStorage.removeItem(CHECKOUT_STARTED_KEY)
  } catch {
    // ignore
  }
}

function checkoutStartedWithoutPurchase(): boolean {
  if (typeof window === "undefined") return false
  try {
    if (window.sessionStorage.getItem(PURCHASE_COMPLETE_KEY)) return false
    if (window.sessionStorage.getItem(ABANDONMENT_FIRED_KEY)) return false
    return Boolean(window.sessionStorage.getItem(CHECKOUT_STARTED_KEY))
  } catch {
    return false
  }
}

function fireGoogleCheckoutAbandonment(): void {
  if (typeof window.gtag !== "function") return
  window.gtag("event", "checkout_abandoned", {
    send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    currency: "USD",
    value: 7.99,
    items: [{ item_id: "macwall-pro", item_name: "MacWall Pro" }],
  })
}

/** Fire retargeting pixels for checkout_started without license_activated / purchase. */
export function fireCheckoutAbandonmentRetargeting(): void {
  if (!checkoutStartedWithoutPurchase()) return

  try {
    window.sessionStorage.setItem(ABANDONMENT_FIRED_KEY, String(Date.now()))
  } catch {
    // ignore
  }

  trackSiteEventClient("checkout_abandoned", { product: "macwall_pro" })
  trackTikTokAddToCart()
  fireGoogleCheckoutAbandonment()
}
