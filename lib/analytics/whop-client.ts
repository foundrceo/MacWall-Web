"use client"

/**
 * Browser Whop Pixel helpers for Stripe checkout (off-Whop sales).
 * @see https://docs.whop.com/developer/ads/pixel
 */

declare global {
  interface Window {
    whop?: {
      track: (event: string, props?: Record<string, unknown>) => void
      setScope?: (...scopes: string[]) => void
    }
  }
}

function isWhopAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.whop?.track === "function"
}

/**
 * Fire Whop `purchase` for a Stripe sale so purchase-optimized Whop ads
 * can attribute and optimize. Never use for Whop-native checkout.
 */
export function trackWhopPurchase(options: {
  value: number
  currency?: string
  /** Stable id (e.g. Stripe session id) so refreshes do not double-count. */
  eventId?: string
  email?: string
}): void {
  const value = options.value
  if (!Number.isFinite(value) || value <= 0) return

  const payload: Record<string, unknown> = {
    value,
    currency: (options.currency || "USD").toUpperCase(),
  }
  if (options.eventId) payload.event_id = options.eventId
  if (options.email) payload.email = options.email

  const fire = () => {
    if (!isWhopAvailable()) return
    window.whop!.track("purchase", payload)
  }

  if (isWhopAvailable()) {
    fire()
    return
  }

  window.setTimeout(fire, 1200)
}
