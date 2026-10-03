"use client"

import { usePathname } from "next/navigation"
import posthog from "posthog-js"
import { useEffect } from "react"

import { adPixelState, subscribeConsent } from "@/lib/consent/consent-client"

/**
 * PostHog product analytics for macwall.app (same project as the Mac app).
 *
 * - Loads through `/ingest` (rewritten to PostHog in next.config.mjs) so ad
 *   blockers don't drop it.
 * - Page views on every client navigation, page leaves, autocapture, heatmaps,
 *   dead clicks, web vitals and JavaScript errors.
 * - Consent: where the cookie banner applies and no choice was made (or the
 *   visitor declined / sends Global Privacy Control), nothing is stored on the
 *   device (memory persistence) and session replay stays off. Accepting
 *   switches both on without a reload.
 * - Links the visitor to the Mac app's person when a link carries the app's
 *   `visitor_id` (email links do), and stores the email from email links.
 * - Admin pages are never tracked.
 */

const POSTHOG_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_TOKEN?.trim() ||
  // Public project token (write-only ingestion key, also shipped in the app).
  "phc_rFwFsuj8gyhuhf9kKMGyqmxZ2YxUNifBe65j99o7JrtH"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

let initialized = false

function consentAllowed(): boolean {
  return adPixelState() === "allowed"
}

function applyConsent() {
  const allowed = consentAllowed()
  posthog.set_config({ persistence: allowed ? "localStorage+cookie" : "memory" })
  if (allowed) posthog.startSessionRecording()
  else posthog.stopSessionRecording()
}

/** The Mac app identifies with its install UUID in upper case; match it. */
function linkVisitorFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const visitorId = params.get("visitor_id")?.trim() ?? ""
  if (UUID_PATTERN.test(visitorId)) {
    posthog.identify(visitorId.toUpperCase())
  }
  const email = params.get("email")?.trim().toLowerCase() ?? ""
  if (email.includes("@") && consentAllowed()) {
    posthog.setPersonProperties({ email })
  }
}

export function PostHogAnalytics() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin") ?? false

  useEffect(() => {
    if (isAdmin || initialized || !POSTHOG_TOKEN) return
    initialized = true
    const allowed = consentAllowed()
    posthog.init(POSTHOG_TOKEN, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",
      capture_pageview: "history_change",
      capture_pageleave: true,
      capture_exceptions: true,
      capture_dead_clicks: true,
      person_profiles: "identified_only",
      persistence: allowed ? "localStorage+cookie" : "memory",
      disable_session_recording: !allowed,
      session_recording: { maskAllInputs: true },
      loaded: (client) => {
        client.register({ site: "macwall.app" })
        linkVisitorFromUrl()
      },
    })
    return subscribeConsent(applyConsent)
  }, [isAdmin])

  return null
}

/** Mirror of the site's own analytics events (no-op until PostHog loads). */
export function capturePostHogEvent(
  name: string,
  properties: Record<string, string | number | boolean | null>
) {
  if (!initialized) return
  try {
    posthog.capture(name, properties)
  } catch {
    // Analytics must never break the product path.
  }
}
