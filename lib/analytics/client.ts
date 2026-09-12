"use client"

import { track as trackVercelEvent } from "@vercel/analytics"

import type {
  SiteAnalyticsEventName,
  SiteAnalyticsMetadata,
} from "@/lib/analytics/events"
import { getVisitorCountry, isVisitorFromIndia } from "@/lib/geo/country-client"

const SESSION_KEY = "macwall_analytics_session"

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return ""

  try {
    const existing = window.localStorage.getItem(SESSION_KEY)
    if (existing) return existing

    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`

    window.localStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return ""
  }
}

/** Appends analytics session id to installer URLs so clicks match redirects. */
export function withAnalyticsSessionHref(href: string): string {
  if (typeof window === "undefined") return href

  const isInstaller =
    href === "/download/latest" || href.endsWith("/download/latest")
  if (!isInstaller) return href

  const sid = getAnalyticsSessionId()
  if (!sid) return href

  const url = new URL(href, window.location.origin)
  url.searchParams.set("sid", sid)
  return `${url.pathname}${url.search}`
}

/** Sample high-volume page_views — conversions always fire (cuts Function + Supabase writes). */
const PAGE_VIEW_SAMPLE_RATE = 0.1

/**
 * Events mirrored to Vercel Web Analytics custom events (same names as the
 * internal Supabase pipeline so the two stay 1:1 comparable).
 * - `page_view` is skipped: Vercel tracks page views automatically.
 * - `download_redirect` is server-only: fired from `/download/latest` via
 *   `@vercel/analytics/server` (firing it here too would double-count).
 */
const VERCEL_CUSTOM_EVENTS: ReadonlySet<SiteAnalyticsEventName> = new Set([
  "download_click",
  "pricing_click",
  "checkout_started",
  "checkout_abandoned",
  "cta_click",
  "purchase_complete",
])

/** Fire-and-forget mirror to Vercel custom events. Never throws. */
function fireVercelCustomEvent(
  eventName: SiteAnalyticsEventName,
  metadata: SiteAnalyticsMetadata
) {
  if (!VERCEL_CUSTOM_EVENTS.has(eventName)) return

  try {
    // Vercel limits: flat primitives only, keys/values ≤ 255 chars.
    const data: Record<string, string | number | boolean> = {}
    for (const [rawKey, value] of Object.entries(metadata).slice(0, 10)) {
      const key = rawKey.slice(0, 255)
      if (!key || value === null || value === undefined) continue
      if (typeof value === "string") {
        if (value.length > 0) data[key] = value.slice(0, 255)
      } else if (typeof value === "number" || typeof value === "boolean") {
        data[key] = value
      }
    }
    // Flag values emitted via <SiteFlagValues /> are attached automatically.
    trackVercelEvent(eventName, data)
  } catch {
    // Analytics must never break the product path.
  }
}

export function trackSiteEventClient(
  eventName: SiteAnalyticsEventName,
  metadata?: SiteAnalyticsMetadata
) {
  if (typeof window === "undefined") return

  if (eventName === "page_view" && Math.random() > PAGE_VIEW_SAMPLE_RATE) {
    return
  }

  const country = getVisitorCountry()
  const enriched: SiteAnalyticsMetadata = {
    ...(metadata ?? {}),
    ...(country ? { country } : {}),
    ...(isVisitorFromIndia() ? { audience: "india" } : {}),
  }

  const payload = {
    eventName,
    path: window.location.pathname,
    referrer: document.referrer || null,
    sessionId: getAnalyticsSessionId(),
    metadata: enriched,
  }

  fireVercelCustomEvent(eventName, enriched)

  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" })
    const sent = navigator.sendBeacon("/api/analytics/track", blob)
    if (sent) return
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body,
    keepalive: true,
  })
}
