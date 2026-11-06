"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"
import { useEffect } from "react"

import { isPrivateAnalyticsPath } from "@/lib/analytics/privacy"

declare global {
  interface Window {
    AhrefsAnalytics?: { sendEvent: (name: string) => void }
  }
}

/** analytics.js dispatches this on `document` once `window.AhrefsAnalytics` exists. */
const AHREFS_READY_EVENT = "AhrefsAnalytics-ready"

function sendAhrefsPageview() {
  try {
    window.AhrefsAnalytics?.sendEvent("pageview")
  } catch {
    // Analytics must never break the page.
  }
}

/**
 * Ahrefs Web Analytics with one pageview per route.
 *
 * analytics.js counts in-site navigation by wrapping `history.pushState`, but
 * the vinext router calls the `pushState` it saved at startup, so the wrapper
 * never runs: from the Cloudflare cutover (2026-10-18) every visit looked like
 * a single page. Its automatic pageviews are off (`data-no-pageview-auto`) and
 * this sends one per pathname instead, the same rule as PostHog's `$pageview`,
 * once the script is ready. Private paths (admin, activate, support) send
 * nothing, since the event carries the full URL.
 */
export function AhrefsWebAnalytics({ dataKey }: Readonly<{ dataKey: string }>) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || isPrivateAnalyticsPath(pathname)) return
    if (window.AhrefsAnalytics) {
      sendAhrefsPageview()
      return
    }
    // Still loading (lazyOnload): count this route when it's ready. A route
    // change before then replaces the listener, so only the latest counts.
    document.addEventListener(AHREFS_READY_EVENT, sendAhrefsPageview, {
      once: true,
    })
    return () =>
      document.removeEventListener(AHREFS_READY_EVENT, sendAhrefsPageview)
  }, [pathname])

  return (
    <Script
      src="https://analytics.ahrefs.com/analytics.js"
      strategy="lazyOnload"
      data-key={dataKey}
      data-no-pageview-auto=""
    />
  )
}
