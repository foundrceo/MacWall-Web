"use client"

import { usePathname } from "next/navigation"
import posthog from "posthog-js"
import { useEffect } from "react"

import { isPrivateAnalyticsPath, redactAnalyticsProperties } from "@/lib/analytics/privacy"

import { adPixelState, subscribeConsent } from "@/lib/consent/consent-client"

/** Consented product analytics goes directly to PostHog, without Vercel proxy traffic. */

const POSTHOG_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_TOKEN?.trim() ||
  // Public project token (write-only ingestion key, also shipped in the app).
  "phc_rFwFsuj8gyhuhf9kKMGyqmxZ2YxUNifBe65j99o7JrtH"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

let initialized = false

function consentAllowed(): boolean {
  return adPixelState() === "allowed"
}

/** The Mac app identifies with its install UUID in upper case; match it. */
function linkVisitorFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const visitorId = params.get("visitor_id")?.trim() ?? ""
  if (UUID_PATTERN.test(visitorId)) {
    posthog.identify(visitorId.toUpperCase())
  }

}

export function PostHogAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    const sync = () => {
      const allowed = consentAllowed() && !isPrivateAnalyticsPath(window.location.pathname)
      if (!allowed) {
        if (initialized) {
          posthog.stopSessionRecording()
          posthog.opt_out_capturing()
        }
        return
      }
      if (!initialized) {
        initialized = true
        posthog.init(POSTHOG_TOKEN, {
          api_host: "https://us.i.posthog.com",
          ui_host: "https://us.posthog.com",
          defaults: "2025-05-24",
          capture_pageview: false,
          capture_pageleave: true,
          capture_exceptions: false,
          autocapture: false,
          capture_dead_clicks: false,
          person_profiles: "identified_only",
          persistence: "localStorage+cookie",
          disable_session_recording: false,
          session_recording: { maskAllInputs: true, maskTextSelector: "*", sampleRate: 0.1 },
          before_send: (event) => {
            if (!event || !consentAllowed() || isPrivateAnalyticsPath(window.location.pathname)) return null
            return { ...event, properties: redactAnalyticsProperties(event.properties) }
          },
          loaded: (client) => client.register({ site: "macwall.app" }),
        })
      }
      posthog.opt_in_capturing({ captureEventName: false })
      linkVisitorFromUrl()
      posthog.capture("$pageview")
    }
    sync()
    return subscribeConsent(sync)
  }, [pathname])

  return null
}

/** Mirror of the site's own analytics events (no-op until PostHog loads). */
export function capturePostHogEvent(
  name: string,
  properties: Record<string, string | number | boolean | null>
) {
  if (!initialized || !consentAllowed() || isPrivateAnalyticsPath(window.location.pathname)) return
  try {
    posthog.capture(name, redactAnalyticsProperties(properties))
  } catch {
    // Analytics must never break the product path.
  }
}
