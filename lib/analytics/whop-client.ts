"use client"

/**
 * Browser Whop Pixel helpers: funnel events for every visitor, plus
 * `purchase` for Stripe checkout (off-Whop sales). Whop records purchases
 * on its own checkout automatically.
 * @see https://docs.whop.com/developer/ads/pixel
 */

declare global {
  interface Window {
    whop?: {
      track: (event: string, props?: Record<string, unknown>) => void
      setScope?: (...scopes: string[]) => void
    }
    /** Defined inline by `WhopFunnelEvents` in the root layout. */
    macwallWhopEvents?: Partial<Record<WhopFunnelEvent, () => void>>
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

/** Funnel moments reported to Whop so ads can optimize toward them. */
export type WhopFunnelEvent =
  | "view_content" // landing, pricing and TikTok pages
  | "lead" // Download for Mac / send link to my Mac
  | "add_to_cart" // Buy click on its way to checkout
  | "activated" // paid key handed to the app on /activate

/**
 * Track a funnel event. The pixel snippet loads `afterInteractive`, so an
 * early call waits up to ~5 s for `window.whop` instead of being dropped.
 */
export function trackWhopEvent(event: WhopFunnelEvent): void {
  if (typeof window === "undefined") return
  let attempts = 0
  const fire = () => {
    const send = window.macwallWhopEvents?.[event]
    if (isWhopAvailable() && send) {
      send()
      return
    }
    attempts += 1
    if (attempts < 10) window.setTimeout(fire, 500)
  }
  fire()
}
