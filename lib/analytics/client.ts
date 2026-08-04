"use client"

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
