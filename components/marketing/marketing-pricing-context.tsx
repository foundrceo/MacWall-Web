"use client"

import {
  createContext,
  useContext,
  useEffect,
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

/** True once regional pricing has settled (or fallback was accepted). */
const MarketingPricingReadyContext = createContext(false)

/** How long to wait for `/api/pricing` before falling back to default USD. */
const PRICING_FETCH_TIMEOUT_MS = 3000

/** Last-known regional pricing — instant first paint for return visitors. */
const PRICING_CACHE_KEY = "macwall-marketing-pricing-v1"

function readCachedPricing(cookieCountry: string | null): MarketingPricing | null {
  try {
    const raw = window.localStorage.getItem(PRICING_CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as MarketingPricing
    if (!data || typeof data.permanentPrice !== "string") return null
    // Travelling visitor with a fresh cookie country: don't trust stale region.
    if (cookieCountry && data.country && data.country !== cookieCountry) {
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCachedPricing(pricing: MarketingPricing) {
  try {
    window.localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(pricing))
  } catch {
    // Private mode etc. — pricing still works, just not cached.
  }
}

export function MarketingPricingProvider({
  pricing: initialPricing,
  children,
}: Readonly<{
  pricing?: MarketingPricing
  children: ReactNode
}>) {
  const [pricing, setPricing] = useState<MarketingPricing>(() => {
    if (initialPricing) return initialPricing
    // Instant regional price for return visitors (revalidated below).
    // First-timers start on default USD and stay blank until it resolves.
    return readCachedPricing(getVisitorCountry()) ?? buildDefaultMarketingPricing()
  })
  // Cached/server pricing renders instantly — only uncached clients wait.
  const [ready, setReady] = useState(
    () =>
      initialPricing !== undefined ||
      readCachedPricing(getVisitorCountry()) !== null
  )

  useEffect(() => {
    if (initialPricing) {
      setReady(true)
      return
    }
    let cancelled = false
    const controller = new AbortController()
    const timeout = window.setTimeout(
      () => controller.abort(),
      PRICING_FETCH_TIMEOUT_MS
    )
    const load = async () => {
      try {
        // Pass cookie country when present; otherwise the API resolves geo itself
        // (cookie / Vercel / IP / localhost egress) so INR hints still hydrate.
        const country = getVisitorCountry()
        const qs = country ? `?c=${encodeURIComponent(country)}` : ""
        const res = await fetch(`/api/pricing${qs}`, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as MarketingPricing
        if (!cancelled && data?.permanentPrice) {
          setPricing(data)
          writeCachedPricing(data)
        }
      } catch {
        // Keep SSR/default USD pricing.
      } finally {
        window.clearTimeout(timeout)
        if (!cancelled) setReady(true)
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
      <MarketingPricingReadyContext.Provider value={ready}>
        {children}
      </MarketingPricingReadyContext.Provider>
    </MarketingPricingContext.Provider>
  )
}

export function useMarketingPricing(): MarketingPricing {
  return useContext(MarketingPricingContext)
}

export function usePricingReady(): boolean {
  return useContext(MarketingPricingReadyContext)
}
