"use client"

import { AFFONSO_REFERRAL_COOKIE } from "@/lib/macwall-affiliate"

type CachedCheckout = {
  url: string
  expiresAt: number
  /** Affonso referral present when this Stripe session was created. */
  affonsoReferral: string
}

const cache = new Map<string, CachedCheckout>()
const inflight = new Map<string, Promise<string | null>>()
/** After a failed create (e.g. 429), pause background retries. */
const failureCooldownUntil = new Map<string, number>()

/** Stripe Checkout Sessions stay open for hours; keep client cache shorter. */
const CACHE_TTL_MS = 20 * 60 * 1000
const FAILURE_COOLDOWN_MS = 65_000

function offerKey(offer: string): string {
  return offer.trim() || "permanent"
}

/** Current Affonso click id from the first-party cookie (empty when absent). */
export function readAffonsoReferralCookie(): string {
  if (typeof document === "undefined") return ""
  const prefix = `${AFFONSO_REFERRAL_COOKIE}=`
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
  if (!match) return ""
  try {
    return decodeURIComponent(match.slice(prefix.length)).trim()
  } catch {
    return match.slice(prefix.length).trim()
  }
}

/**
 * Cache key includes the Affonso referral so a session created before the
 * pixel sets `affonso_referral` is never reused after attribution lands.
 */
function cacheKey(offer: string, affonsoReferral: string): string {
  return `${offerKey(offer)}::${affonsoReferral}`
}

export function offerSlugFromCheckoutHref(href: string): string | null {
  try {
    const url = new URL(href, "https://macwall.app")
    if (!url.pathname.includes("/api/checkout/")) return null
    return (
      url.searchParams.get("offer") ||
      url.searchParams.get("plan") ||
      "permanent"
    )
  } catch {
    return null
  }
}

export function getPrefetchedCheckoutUrl(offer: string): string | null {
  const referral = readAffonsoReferralCookie()
  const key = cacheKey(offer, referral)
  const hit = cache.get(key)
  if (!hit) return null
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key)
    return null
  }
  // Defense in depth — never hand out a session for a different referral.
  if (hit.affonsoReferral !== referral) {
    cache.delete(key)
    return null
  }
  return hit.url
}

function isCoolingDown(key: string): boolean {
  const until = failureCooldownUntil.get(key)
  if (!until) return false
  if (until <= Date.now()) {
    failureCooldownUntil.delete(key)
    return false
  }
  return true
}

type PrefetchOptions = {
  /** User-initiated click — bypass background failure cooldown. */
  force?: boolean
}

/** Create (or reuse) a Checkout Session URL so click can redirect with no wait. */
export function prefetchCheckoutSession(
  offer: string,
  options: PrefetchOptions = {}
): Promise<string | null> {
  const slug = offerKey(offer)
  const referralAtStart = readAffonsoReferralCookie()
  const key = cacheKey(slug, referralAtStart)
  const existing = getPrefetchedCheckoutUrl(slug)
  if (existing) return Promise.resolve(existing)

  if (!options.force && isCoolingDown(key)) return Promise.resolve(null)

  const pending = inflight.get(key)
  if (pending) return pending

  if (options.force) {
    failureCooldownUntil.delete(key)
  }

  const request = (async () => {
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ offer: slug }),
      })
      if (!response.ok) {
        // 429 / 5xx — back off background prefetch; forced clicks can retry later.
        failureCooldownUntil.set(key, Date.now() + FAILURE_COOLDOWN_MS)
        return null
      }
      const data = (await response.json()) as { url?: string }
      const url = data.url?.trim()
      if (!url) {
        failureCooldownUntil.set(key, Date.now() + FAILURE_COOLDOWN_MS)
        return null
      }

      const referralNow = readAffonsoReferralCookie()
      // Pixel set the cookie after this request left the browser — Stripe metadata
      // is empty. Do not cache under the new referral; callers must recreate.
      if (referralNow !== referralAtStart) {
        failureCooldownUntil.delete(key)
        return null
      }

      failureCooldownUntil.delete(key)
      cache.set(key, {
        url,
        expiresAt: Date.now() + CACHE_TTL_MS,
        affonsoReferral: referralAtStart,
      })
      return url
    } catch {
      failureCooldownUntil.set(key, Date.now() + FAILURE_COOLDOWN_MS)
      return null
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, request)
  return request
}

export function takePrefetchedCheckoutUrl(offer: string): string | null {
  const referral = readAffonsoReferralCookie()
  const key = cacheKey(offer, referral)
  const url = getPrefetchedCheckoutUrl(offer)
  if (!url) return null
  // One-shot — avoid two tabs/clicks sharing the same session accidentally.
  cache.delete(key)
  return url
}

/**
 * On affiliate landings (`?atp=` / `affonso_id=`), wait briefly for the pixel
 * to set `affonso_referral` before warming Stripe — otherwise metadata is empty.
 */
export async function waitForAffonsoReferralIfLanding(
  timeoutMs = 2500
): Promise<string> {
  if (typeof window === "undefined") return ""
  const params = new URLSearchParams(window.location.search)
  const expectingReferral =
    params.has("atp") ||
    params.has("affonso_id") ||
    params.has("via") ||
    Boolean(readAffonsoReferralCookie())
  if (!expectingReferral) return ""

  const existing = readAffonsoReferralCookie()
  if (existing) return existing

  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 50)
    })
    const value = readAffonsoReferralCookie()
    if (value) return value
  }
  return readAffonsoReferralCookie()
}

/**
 * Resolve a Stripe Checkout URL for a CTA click.
 * Prefer cached/in-flight session; otherwise create one (forced).
 * Never use GET /api/checkout/create-session as a fallback (429 → /pricing error).
 */
export async function waitForPrefetchedCheckoutUrl(
  offer: string
): Promise<string | null> {
  // Affiliate click path: don't reuse a no-referral warm session.
  await waitForAffonsoReferralIfLanding(1500)

  const ready = takePrefetchedCheckoutUrl(offer)
  if (ready) return ready

  const referral = readAffonsoReferralCookie()
  const key = cacheKey(offer, referral)
  const pending = inflight.get(key)
  if (pending) {
    const fromPending = await pending
    if (fromPending) {
      if (readAffonsoReferralCookie() !== referral) {
        // Cookie arrived while the empty-referral create was in flight.
        return createCheckoutUrlForClick(offer)
      }
      return takePrefetchedCheckoutUrl(offer) ?? fromPending
    }
  }

  return createCheckoutUrlForClick(offer)
}

async function createCheckoutUrlForClick(offer: string): Promise<string | null> {
  const created = await prefetchCheckoutSession(offer, { force: true })
  if (created) {
    return takePrefetchedCheckoutUrl(offer) ?? created
  }
  // Mid-flight attribution race returned null — retry once with the cookie set.
  if (readAffonsoReferralCookie()) {
    const retry = await prefetchCheckoutSession(offer, { force: true })
    if (retry) return takePrefetchedCheckoutUrl(offer) ?? retry
  }
  return null
}
