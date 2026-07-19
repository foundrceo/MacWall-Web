"use client"

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const

const ATTRIBUTION_STORAGE_KEY = "macwall_marketing_attribution"

export type MarketingAttribution = Partial<
  Record<(typeof UTM_KEYS)[number] | "ttclid" | "gclid", string>
>

/** Persist UTM + ad click ids from landing URLs for checkout URL forwarding. */
export function captureMarketingAttributionFromUrl(): void {
  if (typeof window === "undefined") return

  const params = new URLSearchParams(window.location.search)
  const next: MarketingAttribution = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim()
    if (value) next[key] = value.slice(0, 128)
  }

  const ttclid = params.get("ttclid")?.trim()
  if (ttclid) next.ttclid = ttclid.slice(0, 256)

  const gclid = params.get("gclid")?.trim()
  if (gclid) next.gclid = gclid.slice(0, 256)

  if (Object.keys(next).length === 0) return

  try {
    const existing = readMarketingAttribution()
    window.sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ ...existing, ...next })
    )
  } catch {
    // ignore
  }
}

export function readMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MarketingAttribution
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

/** Append stored attribution params to external checkout URLs. */
export function withMarketingAttribution(href: string): string {
  if (typeof window === "undefined") return href
  if (!href.startsWith("http")) return href

  const attribution = readMarketingAttribution()
  if (Object.keys(attribution).length === 0) return href

  try {
    const url = new URL(href)
    for (const [key, value] of Object.entries(attribution)) {
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value)
      }
    }
    return url.toString()
  } catch {
    return href
  }
}

export function isTikTokAttribution(): boolean {
  const attribution = readMarketingAttribution()
  if (attribution.utm_source?.toLowerCase() === "tiktok") return true
  if (attribution.ttclid) return true
  if (typeof document !== "undefined") {
    const ref = document.referrer.toLowerCase()
    if (ref.includes("tiktok.com")) return true
  }
  return false
}
