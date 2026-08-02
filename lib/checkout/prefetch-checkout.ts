"use client"

type CachedCheckout = {
  url: string
  expiresAt: number
}

const cache = new Map<string, CachedCheckout>()
const inflight = new Map<string, Promise<string | null>>()

/** Stripe Checkout Sessions stay open for hours; keep client cache shorter. */
const CACHE_TTL_MS = 20 * 60 * 1000

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

/** Create (or reuse) a Checkout Session URL so click can redirect with no wait. */
export function prefetchCheckoutSession(offer: string): Promise<string | null> {
  const key = cacheKey(offer)
  const existing = getPrefetchedCheckoutUrl(key)
  if (existing) return Promise.resolve(existing)

  const pending = inflight.get(key)
  if (pending) return pending

  const request = (async () => {
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ offer: key }),
      })
      if (!response.ok) return null
      const data = (await response.json()) as { url?: string }
      const url = data.url?.trim()
      if (!url) return null
      cache.set(key, { url, expiresAt: Date.now() + CACHE_TTL_MS })
      return url
    } catch {
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
