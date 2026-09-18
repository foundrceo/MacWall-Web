"use client"

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react"

import { getVisitorCountry } from "@/lib/geo/country-client"
import {
  buildDefaultMarketingPricing,
  type MarketingPricing,
} from "@/lib/pricing/marketing-pricing"

const MarketingPricingContext = createContext<MarketingPricing>(
  buildDefaultMarketingPricing()
)

/** Layout effect on the client, passive effect on the server (SSR-safe). */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

/** How long to wait for `/api/pricing` before keeping default USD. */
const PRICING_FETCH_TIMEOUT_MS = 3000

/** Last-known regional pricing — instant first paint for return visitors. */
const PRICING_CACHE_KEY = "macwall-marketing-pricing-v1"
/** Local cache freshness — background revalidate still runs on every mount. */
const PRICING_CACHE_TTL_MS = 24 * 60 * 60 * 1000
/** Same-session refetch guard — provider remounts reuse memory first. */
const PRICING_MEMORY_TTL_MS = 5 * 60 * 1000

type CachedPricing = {
  at: number
  pricing: MarketingPricing
}

let memoryCache: CachedPricing | null = null
let inflightFetch: Promise<MarketingPricing | null> | null = null

function isFresh(entry: CachedPricing | null, ttlMs: number): boolean {
  return (
    entry !== null &&
    typeof entry.at === "number" &&
    Date.now() - entry.at < ttlMs &&
    !!entry.pricing &&
    typeof entry.pricing.permanentPrice === "string"
  )
}

function readCachedPricing(): MarketingPricing | null {
  // Prerender-safe: storage only exists in the browser.
  if (typeof window === "undefined") return null
  // Same session first — no storage I/O, no serialization cost.
  if (isFresh(memoryCache, PRICING_MEMORY_TTL_MS)) {
    return (memoryCache as CachedPricing).pricing
  }
  try {
    const raw = window.localStorage.getItem(PRICING_CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CachedPricing
    if (!isFresh(entry, PRICING_CACHE_TTL_MS)) return null
    memoryCache = entry
    return entry.pricing
  } catch {
    return null
  }
}

function writeCachedPricing(pricing: MarketingPricing) {
  const entry: CachedPricing = { at: Date.now(), pricing }
  memoryCache = entry
  try {
    window.localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Private mode etc. — pricing still works, just not cached.
  }
}

async function fetchPricing(signal: AbortSignal): Promise<MarketingPricing | null> {
  // Dedupe concurrent mounts (StrictMode, fast remounts) into one request.
  if (!inflightFetch) {
    inflightFetch = (async () => {
      try {
        // Pass cookie country when present; otherwise the API resolves geo itself
        // (cookie / Vercel / IP / localhost egress) so INR hints still hydrate.
        const country = getVisitorCountry()
        const qs = country ? `?c=${encodeURIComponent(country)}` : ""
        const res = await fetch(`/api/pricing${qs}`, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        })
        if (!res.ok) return null
        const data = (await res.json()) as MarketingPricing
        return data?.permanentPrice ? data : null
      } catch {
        // Timeout / offline — caller keeps SSR/default pricing.
        return null
      } finally {
        inflightFetch = null
      }
    })()
  }
  return inflightFetch
}

export function MarketingPricingProvider({
  pricing: initialPricing,
  children,
}: Readonly<{
  pricing?: MarketingPricing
  children: ReactNode
}>) {
  // First paint always shows a price instantly (default USD, matching SSR).
  // Cached regional pricing swaps in pre-paint when available; the network
  // revalidate then silently corrects any stale value. Never blank, never a
  // loader — exactly one text swap at most, usually zero.
  const [pricing, setPricing] = useState<MarketingPricing>(
    () => initialPricing ?? buildDefaultMarketingPricing()
  )

  // Cached price applies synchronously BEFORE first paint, so return
  // visitors see their regional price immediately with no flash.
  useIsomorphicLayoutEffect(() => {
    if (initialPricing) return
    const cached = readCachedPricing()
    if (cached) setPricing(cached)
  }, [initialPricing])

  // Background revalidate — keeps cache honest without blocking paint.
  useEffect(() => {
    if (initialPricing) return
    let cancelled = false
    const controller = new AbortController()
    const timeout = window.setTimeout(
      () => controller.abort(),
      PRICING_FETCH_TIMEOUT_MS
    )
    const load = async () => {
      const data = await fetchPricing(controller.signal)
      window.clearTimeout(timeout)
      if (cancelled) return
      if (data) {
        setPricing(data)
        writeCachedPricing(data)
      }
    }
    void load()
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [initialPricing])

  return (
    <MarketingPricingContext.Provider value={pricing}>
      {children}
    </MarketingPricingContext.Provider>
  )
}

export function useMarketingPricing(): MarketingPricing {
  return useContext(MarketingPricingContext)
}
