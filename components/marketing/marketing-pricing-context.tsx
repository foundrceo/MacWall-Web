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

export function MarketingPricingProvider({
  pricing: initialPricing,
  children,
}: Readonly<{
  pricing?: MarketingPricing
  children: ReactNode
}>) {
  const [pricing, setPricing] = useState<MarketingPricing>(
    () => initialPricing ?? buildDefaultMarketingPricing()
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        // Country bucket in the URL → CDN can cache `/api/pricing?c=IN` etc.
        const country = getVisitorCountry()
        const qs = country ? `?c=${encodeURIComponent(country)}` : ""
        const res = await fetch(`/api/pricing${qs}`, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as MarketingPricing
        if (!cancelled && data?.permanentPrice) {
          setPricing(data)
        }
      } catch {
        // Keep SSR/default USD pricing.
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <MarketingPricingContext.Provider value={pricing}>
      {children}
    </MarketingPricingContext.Provider>
  )
}

export function useMarketingPricing(): MarketingPricing {
  return useContext(MarketingPricingContext)
}
