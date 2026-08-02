import { macwall } from "@/lib/macwall-site"

export const TIKTOK_TRACK_EVENTS = [
  "ViewContent",
  "AddToWishlist",
  "Search",
  "AddPaymentInfo",
  "AddToCart",
  "InitiateCheckout",
  "PlaceAnOrder",
  "CompleteRegistration",
  "CompletePayment",
  "Purchase",
] as const

export type TikTokTrackEvent = (typeof TIKTOK_TRACK_EVENTS)[number]

export function isTikTokTrackEvent(value: string): value is TikTokTrackEvent {
  return (TIKTOK_TRACK_EVENTS as readonly string[]).includes(value)
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
  return Number.isFinite(value) ? value : 7.99
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
