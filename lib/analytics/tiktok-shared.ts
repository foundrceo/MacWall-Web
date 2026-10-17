import { macwall } from "@/lib/macwall-site"

/**
 * Events the browser may relay through `/api/analytics/tiktok`. Purchase is
 * not here: only the Stripe webhook reports it server-side, so a forged
 * POST can't inflate conversions.
 */
export const TIKTOK_TRACK_EVENTS = [
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
] as const

export type TikTokTrackEvent = (typeof TIKTOK_TRACK_EVENTS)[number]

export function isTikTokTrackEvent(value: string): value is TikTokTrackEvent {
  return (TIKTOK_TRACK_EVENTS as readonly string[]).includes(value)
}

/** First-party copy of `ttclid`, read by checkout into Stripe metadata. */
export const TIKTOK_CLICK_ID_COOKIE = "mw_ttclid"
/** TikTok's longest click-through attribution window. */
export const TIKTOK_CLICK_ID_MAX_AGE_SEC = 60 * 60 * 24 * 28

/**
 * Shared by the browser pixel (/activate) and the Stripe webhook
 * (`supabase/functions/stripe-license-email`) so TikTok dedupes the pair.
 * Keep both in sync.
 */
export function tiktokPurchaseEventId(checkoutSessionId: string): string {
  return `${checkoutSessionId}_Purchase`
}

export type TikTokContent = {
  content_id: string
  content_type: "product" | "product_group"
  content_name: string
  price?: number
  quantity?: number
}

export function macwallProValue(): number {
  const value = Number.parseFloat(macwall.pro.price.replace(/[^0-9.]/g, ""))
  return Number.isFinite(value) ? value : 9.99
}

export function macwallProProperties(overrides?: Partial<TikTokContent>) {
  const value = macwallProValue()
  const content: TikTokContent = {
    content_id: "macwall-pro",
    content_type: "product",
    content_name: `${macwall.name} Pro`,
    price: value,
    quantity: 1,
    ...overrides,
  }

  return {
    currency: "USD" as const,
    value,
    contents: [content],
  }
}
