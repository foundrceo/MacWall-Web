"use client"

import { useSearchParams } from "next/navigation"
import {
  createContext,
  Suspense,
  useCallback,
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
let inflightQuery: string | null = null

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

/**
 * Coupon from a ?promo= link. The URL is the source of truth: a new code in
 * the URL replaces it, and a fresh page load without one clears it. It only
 * carries over while the buyer clicks around inside the site (the module
 * lives for one page load), so the discount and the buy links stay together.
 */
type VisitPromo = { promo: string; until: string | null }

let visitPromo: VisitPromo | null | undefined

function promoFromSearch(search: string): VisitPromo | null {
  const params = new URLSearchParams(search)
  const promo = params.get("promo")?.trim()
  if (!promo) return null
  return {
    promo: promo.slice(0, 40),
    until: params.get("until")?.trim().slice(0, 40) || null,
  }
}

/**
 * Current coupon. `search` is the URL query when the caller has it;
 * otherwise the live location is used on first read.
 */
function readVisitPromo(search?: string): VisitPromo | null {
  if (typeof window === "undefined") return null
  const fromUrl = promoFromSearch(search ?? window.location.search)
  if (fromUrl) visitPromo = fromUrl
  else if (visitPromo === undefined) visitPromo = null
  return visitPromo
}

function promoKey(promo: VisitPromo | null): string {
  return promo ? `${promo.promo}|${promo.until ?? ""}` : ""
}

function writeCachedPricing(pricing: MarketingPricing) {
  // Coupon prices belong to one visit; never show them on a later one.
  if (pricing.promoCode) return
  const entry: CachedPricing = { at: Date.now(), pricing }
  memoryCache = entry
  try {
    window.localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Private mode etc. — pricing still works, just not cached.
  }
}

async function fetchPricing(
  promo: VisitPromo | null
): Promise<MarketingPricing | null> {
  // Pass cookie country when present; otherwise the API resolves geo itself
  // (cookie / Vercel / IP / localhost egress) so INR hints still hydrate.
  const country = getVisitorCountry()
  const params = new URLSearchParams()
  if (country) params.set("c", country)
  // ?promo= links: the API validates the code, discounts the shown price
  // where the gateway charges it (India) and adds it to every checkout link.
  if (promo) {
    params.set("promo", promo.promo)
    if (promo.until) params.set("until", promo.until)
  }
  const qs = params.size ? `?${params.toString()}` : ""

  // Dedupe concurrent mounts (StrictMode, fast remounts) into one request
  // per query, so a changed code never reuses the old code's request. The
  // request owns its timeout: a mount that unmounts must not abort the
  // fetch another mount is waiting on.
  if (!inflightFetch || inflightQuery !== qs) {
    inflightQuery = qs
    inflightFetch = (async () => {
      try {
        const res = await fetch(`/api/pricing${qs}`, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(PRICING_FETCH_TIMEOUT_MS),
        })
        if (!res.ok) return null
        const data = (await res.json()) as MarketingPricing
        return data?.permanentPrice ? data : null
      } catch {
        // Timeout / offline — caller keeps SSR/default pricing.
        return null
      } finally {
        if (inflightQuery === qs) {
          inflightFetch = null
          inflightQuery = null
        }
      }
    })()
  }
  return inflightFetch
}

/**
 * Re-reads ?promo= whenever the URL changes (client navigations, back /
 * forward) so the cards follow the code in the address bar. Isolated in its
 * own Suspense boundary so pages still prerender (useSearchParams).
 */
function PromoUrlWatcher({
  onChange,
}: Readonly<{ onChange: (promo: VisitPromo | null) => void }>) {
  const search = useSearchParams().toString()
  useEffect(() => {
    onChange(readVisitPromo(search ? `?${search}` : ""))
  }, [search, onChange])
  return null
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

  // Coupon in the URL; changing it refetches the prices.
  const [promo, setPromo] = useState<VisitPromo | null>(() => readVisitPromo())
  const onPromoChange = useCallback((next: VisitPromo | null) => {
    setPromo((prev) => (promoKey(prev) === promoKey(next) ? prev : next))
  }, [])
  const currentPromoKey = promoKey(promo)

  // Background revalidate — keeps cache honest without blocking paint.
  useEffect(() => {
    if (initialPricing) return
    let cancelled = false
    const load = async () => {
      const data = await fetchPricing(promo)
      if (cancelled) return
      if (data) {
        setPricing(data)
        writeCachedPricing(data)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // `promo` is captured through its key so equal codes don't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPricing, currentPromoKey])

  return (
    <MarketingPricingContext.Provider value={pricing}>
      <Suspense fallback={null}>
        <PromoUrlWatcher onChange={onPromoChange} />
      </Suspense>
      {children}
    </MarketingPricingContext.Provider>
  )
}

export function useMarketingPricing(): MarketingPricing {
  return useContext(MarketingPricingContext)
}
