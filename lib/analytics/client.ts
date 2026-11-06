"use client"

import type {
  SiteAnalyticsEventName,
  SiteAnalyticsMetadata,
} from "@/lib/analytics/events"
import { capturePostHogEvent } from "@/components/analytics/posthog-analytics"
import { getVisitorCountry, isVisitorFromIndia } from "@/lib/geo/country-client"
import { markInstallerDownloaded } from "@/lib/installer-seen"

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

/** Sample high-volume page_views: conversions always fire (cuts Function + Supabase writes). */
const PAGE_VIEW_SAMPLE_RATE = 0.1

export function trackSiteEventClient(
  eventName: SiteAnalyticsEventName,
  metadata?: SiteAnalyticsMetadata
) {
  if (typeof window === "undefined") return
  sendSiteEvent(eventName, metadata, window.location.pathname)
}

type PendingSiteEvent = {
  eventName: SiteAnalyticsEventName
  metadata?: SiteAnalyticsMetadata
  path: string
}

let pendingEvents: PendingSiteEvent[] = []
let flushScheduled = false
let flushOnHideBound = false

function flushPendingEvents() {
  flushScheduled = false
  const batch = pendingEvents
  pendingEvents = []
  for (const event of batch) {
    try {
      sendSiteEvent(event.eventName, event.metadata, event.path)
    } catch {
      // Analytics must never break the product path.
    }
  }
}

function flushWhenHidden() {
  if (document.visibilityState === "hidden") flushPendingEvents()
}

/**
 * `trackSiteEventClient` for tap handlers that open or toggle UI (a dialog, a
 * menu, a dismiss). The handler sets its state first and this runs the
 * PostHog capture, JSON encoding and beacon after the next frame is painted,
 * so analytics never sits between the tap and the screen updating (INP).
 *
 * The path is read now, so a route change in between can't misfile the
 * event, and anything still queued is sent on pagehide or when the tab is
 * hidden. Links that navigate away keep the synchronous version.
 */
export function trackSiteEventAfterPaint(
  eventName: SiteAnalyticsEventName,
  metadata?: SiteAnalyticsMetadata
) {
  if (typeof window === "undefined") return
  pendingEvents.push({ eventName, metadata, path: window.location.pathname })

  if (!flushOnHideBound) {
    flushOnHideBound = true
    window.addEventListener("pagehide", flushPendingEvents)
    document.addEventListener("visibilitychange", flushWhenHidden)
  }

  if (flushScheduled) return
  flushScheduled = true
  // rAF runs just before the next paint; the timeout lands just after it.
  requestAnimationFrame(() => window.setTimeout(flushPendingEvents, 0))
}

function sendSiteEvent(
  eventName: SiteAnalyticsEventName,
  metadata: SiteAnalyticsMetadata | undefined,
  path: string
) {
  // "Set on Mac" opens the app, every other download_click fetches the DMG.
  if (
    eventName === "download_click" &&
    metadata?.location !== "wallpaper_detail_set_on_mac"
  ) {
    markInstallerDownloaded()
  }

  const country = getVisitorCountry()
  const enriched: SiteAnalyticsMetadata = {
    ...(metadata ?? {}),
    ...(country ? { country } : {}),
    ...(isVisitorFromIndia() ? { audience: "india" } : {}),
  }

  // PostHog records page views itself; every other site event is mirrored
  // there unsampled (download, pricing, checkout, purchase, CTA clicks).
  if (eventName !== "page_view") {
    capturePostHogEvent(eventName, enriched)
  }

  if (eventName === "page_view" && Math.random() > PAGE_VIEW_SAMPLE_RATE) {
    return
  }

  const payload = {
    eventName,
    path,
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
