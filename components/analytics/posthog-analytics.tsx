"use client"

import { usePathname } from "next/navigation"
import type { PostHog } from "posthog-js"
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
let posthog: PostHog | null = null

function consentAllowed(): boolean {
  return adPixelState() === "allowed"
}

/** The Mac app identifies with its install UUID in upper case; match it. */
function linkVisitorFromUrl(client: PostHog) {
  const params = new URLSearchParams(window.location.search)
  const visitorId = params.get("visitor_id")?.trim() ?? ""
  if (UUID_PATTERN.test(visitorId)) {
    client.identify(visitorId.toUpperCase())
  }

}

export function PostHogAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    let disposed = false
    let revision = 0
    const sync = async () => {
      const currentRevision = ++revision
      const allowed = consentAllowed() && !isPrivateAnalyticsPath(window.location.pathname)
      if (!allowed) {
        if (initialized && posthog) {
          posthog.stopSessionRecording()
          posthog.opt_out_capturing()
        }
        return
      }
      const client = posthog ?? (await import("posthog-js")).default
      // Consent or the route can change while the SDK is downloading.
      if (disposed || revision !== currentRevision || !consentAllowed() || isPrivateAnalyticsPath(window.location.pathname)) return
      posthog = client
      if (!initialized) {
        initialized = true
        client.init(POSTHOG_TOKEN, {
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
      client.opt_in_capturing({ captureEventName: false })
      linkVisitorFromUrl(client)
      client.capture("$pageview")
    }
    // Optional analytics follows the page's images and fonts.
    let idleId: number | undefined
    let timerId: number | undefined
    const schedule = () => {
      if (window.requestIdleCallback) {
        idleId = window.requestIdleCallback(() => { void sync().catch(() => undefined) }, { timeout: 2000 })
      } else {
        timerId = window.setTimeout(() => { void sync().catch(() => undefined) }, 200)
      }
    }
    if (document.readyState === "complete") schedule()
    else window.addEventListener("load", schedule, { once: true })
    const unsubscribe = subscribeConsent(() => { void sync().catch(() => undefined) })
    return () => {
      disposed = true
      unsubscribe()
      window.removeEventListener("load", schedule)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timerId !== undefined) window.clearTimeout(timerId)
    }
  }, [pathname])

  return null
}

/** Mirror of the site's own analytics events (no-op until PostHog loads). */
export function capturePostHogEvent(
  name: string,
  properties: Record<string, string | number | boolean | null>
) {
  if (!posthog || !initialized || !consentAllowed() || isPrivateAnalyticsPath(window.location.pathname)) return
  try {
    posthog.capture(name, redactAnalyticsProperties(properties))
  } catch {
    // Analytics must never break the product path.
  }
}
