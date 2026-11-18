"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"
import { useEffect } from "react"

import {
  CRISPSTATS_DOMAINS,
  CRISPSTATS_EXCLUDE,
  CRISPSTATS_PROXY_BASE,
  CRISPSTATS_SCRIPT_PATH,
  CRISPSTATS_SITE_KEY,
} from "@/lib/analytics/crispstats"

/**
 * d.js counts in-site navigation by wrapping `history.pushState`, but the
 * vinext router calls the `pushState` it saved at startup (the same problem
 * as Ahrefs, see ahrefs-web-analytics.tsx), so the wrapper may never run.
 * The script also re-checks the URL on `hashchange`, and only sends a
 * pageview when the URL really changed, so a nudge on every route change
 * counts it exactly once whichever path wins.
 */
function nudgeCrispstats() {
  try {
    if (!window.crispstats?.v) return // Not loaded yet: it reads the URL on load.
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  } catch {
    // Analytics must never break the page.
  }
}

function RouteChangeNudge() {
  const pathname = usePathname()

  useEffect(() => {
    nudgeCrispstats()
    // Some routers update the URL after the effect runs; check once more.
    const timer = window.setTimeout(nudgeCrispstats, 150)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return null
}

/**
 * CrispStats on every page: pageviews, SPA navigation, time on page,
 * outbound links, file downloads, web vitals, JS errors and 404s.
 * Cookieless and stores nothing on the device, so it needs no consent gate.
 * It ignores localhost and any host but macwall.app.
 *
 * `data-hash` is deliberately off: this site doesn't route by fragment, and
 * fragments carry Supabase auth tokens and in-page anchors.
 */
export function CrispStatsAnalytics() {
  return (
    <>
      <Script
        id="crispstats"
        src={CRISPSTATS_SCRIPT_PATH}
        strategy="afterInteractive"
        data-site={CRISPSTATS_SITE_KEY}
        data-api={CRISPSTATS_PROXY_BASE}
        data-domains={CRISPSTATS_DOMAINS}
        data-exclude={CRISPSTATS_EXCLUDE}
        data-outbound=""
        data-downloads=""
        data-vitals=""
        data-errors=""
        data-404=""
      />
      <RouteChangeNudge />
    </>
  )
}
