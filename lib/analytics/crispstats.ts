import type { SiteAnalyticsMetadata } from "@/lib/analytics/events"
import { redactAnalyticsProperties } from "@/lib/analytics/privacy"

/**
 * CrispStats: cookieless web analytics (https://docs.crispstats.com).
 *
 * The script and the event endpoint are served from this origin so ad
 * blockers don't hide visitors:
 *   /mw/s.js -> https://in.crispstats.com/js/script.js  (next.config.mjs rewrite)
 *   /mw/e    -> https://in.crispstats.com/api/event     (app/mw/e/route.ts)
 * `/mw`, not `/stats`: generic blocklists match paths like `/stats/`.
 */

/** Public site key. Safe to publish: it can only send events to this site. */
export const CRISPSTATS_SITE_KEY =
  process.env.NEXT_PUBLIC_CRISPSTATS_SITE_KEY?.trim() ||
  "cs_pk_771d49693125483aaa48527e"

export const CRISPSTATS_COLLECTOR_ORIGIN = "https://in.crispstats.com"
export const CRISPSTATS_PROXY_BASE = "/mw"
export const CRISPSTATS_SCRIPT_PATH = `${CRISPSTATS_PROXY_BASE}/s.js`

/** Only the production host is counted (no workers.dev, previews or scrapers). */
export const CRISPSTATS_DOMAINS = "macwall.app"

/**
 * Pages whose URL can carry a license key, checkout session, unsubscribe
 * token or auth code. The script sends the full URL (query string included),
 * so these send nothing at all. Same spirit as `isPrivateAnalyticsPath`.
 */
export const CRISPSTATS_EXCLUDE = [
  "/admin*",
  "/activate*",
  "/thank-you*",
  "/unsubscribe*",
  "/auth*",
  "/open*",
  "/support*",
  "/og-render*",
].join(", ")

type CrispStatsGlobal = {
  (name: string, props?: Record<string, unknown>): void
  id?: () => Promise<string | undefined>
  identify?: (userId: string, traits?: Record<string, unknown>) => void
  revenue?: (
    amount: number,
    currency: string,
    props?: Record<string, unknown>
  ) => void
  v?: string
}

declare global {
  interface Window {
    crispstats?: CrispStatsGlobal
  }
}

/** Mirror a site event into CrispStats. Never throws, sends nothing until the script ran. */
export function trackCrispstatsEvent(
  name: string,
  props?: SiteAnalyticsMetadata
): void {
  if (typeof window === "undefined") return
  try {
    window.crispstats?.(
      name,
      props ? redactAnalyticsProperties(props) : undefined
    )
  } catch {
    // Analytics must never break the page.
  }
}

const VISITOR_ID_PATTERN = /^[0-9a-f]{32}$/
const VISITOR_ID_TIMEOUT_MS = 700

let visitorIdPromise: Promise<string | null> | null = null

async function fetchVisitorId(): Promise<string | null> {
  // Through the first-party proxy `crispstats.id()` resolves to undefined
  // (the collector only trusts X-Forwarded-For on /api/event), so ask the
  // collector directly from the browser. Ad-blocked or offline: no id, and
  // the payment is still recorded, just as Direct.
  try {
    const fromScript = await window.crispstats?.id?.()
    if (fromScript && VISITOR_ID_PATTERN.test(fromScript)) return fromScript
  } catch {
    // Fall through to the direct lookup.
  }
  if (!window.crispstats?.v) return null // Script blocked or not tracking.
  try {
    const response = await fetch(
      `${CRISPSTATS_COLLECTOR_ORIGIN}/id?k=${encodeURIComponent(CRISPSTATS_SITE_KEY)}`,
      { credentials: "omit" }
    )
    if (!response.ok) return null
    const data = (await response.json()) as { id?: unknown }
    return typeof data.id === "string" && VISITOR_ID_PATTERN.test(data.id)
      ? data.id
      : null
  } catch {
    return null
  }
}

/**
 * The visitor's anonymous CrispStats id for Stripe revenue attribution, or
 * null. Memoised per page load (the id only rotates daily) and capped at
 * ~700 ms so it never holds up the redirect to Checkout.
 */
export function getCrispstatsVisitorId(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null)
  if (!visitorIdPromise) {
    visitorIdPromise = fetchVisitorId().then((id) => {
      if (!id) visitorIdPromise = null // Retry on the next checkout attempt.
      return id
    })
  }
  const timeout = new Promise<null>((resolve) => {
    window.setTimeout(() => resolve(null), VISITOR_ID_TIMEOUT_MS)
  })
  return Promise.race([visitorIdPromise, timeout])
}

/** Server side: accept only the 32-char lowercase hex id CrispStats issues. */
export function normalizeCrispstatsVisitorId(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim().toLowerCase() ?? ""
  return VISITOR_ID_PATTERN.test(trimmed) ? trimmed : null
}
