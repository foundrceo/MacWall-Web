"use client"

type CachedCheckout = {
  url: string
  expiresAt: number
}

const cache = new Map<string, CachedCheckout>()
const inflight = new Map<string, Promise<string | null>>()
/** After a failed create (e.g. 429), pause background retries. */
const failureCooldownUntil = new Map<string, number>()

/** Stripe Checkout Sessions stay open for hours; keep client cache shorter. */
const CACHE_TTL_MS = 20 * 60 * 1000
const FAILURE_COOLDOWN_MS = 65_000

function cacheKey(offer: string): string {
  return offer.trim() || "permanent"
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
  const key = cacheKey(offer)
  const hit = cache.get(key)
  if (!hit) return null
  if (hit.expiresAt <= Date.now()) {
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
  const key = cacheKey(offer)
  const existing = getPrefetchedCheckoutUrl(key)
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
        body: JSON.stringify({ offer: key }),
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
      failureCooldownUntil.delete(key)
      cache.set(key, { url, expiresAt: Date.now() + CACHE_TTL_MS })
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
  const key = cacheKey(offer)
  const url = getPrefetchedCheckoutUrl(key)
  if (!url) return null
  // One-shot — avoid two tabs/clicks sharing the same session accidentally.
  cache.delete(key)
  return url
}

/**
 * Resolve a Stripe Checkout URL for a CTA click.
 * Prefer cached/in-flight session; otherwise create one (forced).
 * Never use GET /api/checkout/create-session as a fallback (429 → /pricing error).
 */
export async function waitForPrefetchedCheckoutUrl(
  offer: string
): Promise<string | null> {
  const ready = takePrefetchedCheckoutUrl(offer)
  if (ready) return ready

  const key = cacheKey(offer)
  const pending = inflight.get(key)
  if (pending) {
    const fromPending = await pending
    if (fromPending) {
      // Pending already wrote cache — take so a second click doesn't reuse it.
      return takePrefetchedCheckoutUrl(offer) ?? fromPending
    }
  }

  // User click path: bypass cooldown and create a fresh session.
  const created = await prefetchCheckoutSession(offer, { force: true })
  if (created) {
    return takePrefetchedCheckoutUrl(offer) ?? created
  }
  return null
}
