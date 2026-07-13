export const SITE_ANALYTICS_EVENTS = [
  "download_click",
  "download_redirect",
  "pricing_click",
  "page_view",
  "cta_click",
  "purchase_complete",
] as const

export type SiteAnalyticsEventName = (typeof SITE_ANALYTICS_EVENTS)[number]

export function isSiteAnalyticsEventName(
  value: string
): value is SiteAnalyticsEventName {
  return (SITE_ANALYTICS_EVENTS as readonly string[]).includes(value)
}

export type SiteAnalyticsMetadata = Record<
  string,
  string | number | boolean | null
>
