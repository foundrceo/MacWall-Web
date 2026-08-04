import { macwall } from "@/lib/macwall-site"

export const META_TRACK_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
] as const

export type MetaTrackEvent = (typeof META_TRACK_EVENTS)[number]

export function isMetaTrackEvent(value: string): value is MetaTrackEvent {
  return (META_TRACK_EVENTS as readonly string[]).includes(value)
}

export function macwallProValue(): number {
  const value = Number.parseFloat(macwall.pro.price.replace(/[^0-9.]/g, ""))
  return Number.isFinite(value) ? value : 7.99
}

/** Standard Meta ecommerce params for MacWall Pro. */
export function macwallMetaPurchaseParams(overrides?: {
  value?: number
  currency?: string
  content_ids?: string[]
  content_name?: string
}) {
  const value =
    typeof overrides?.value === "number" && Number.isFinite(overrides.value)
      ? overrides.value
      : macwallProValue()
  const currency = (overrides?.currency || "USD").toUpperCase()

  return {
    value,
    currency,
    content_ids: overrides?.content_ids ?? ["macwall-pro"],
    content_type: "product",
    content_name: overrides?.content_name ?? `${macwall.name} Pro`,
    contents: [
      {
        id: "macwall-pro",
        quantity: 1,
        item_price: value,
      },
    ],
  }
}
