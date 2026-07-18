"use client"

import { createContext, useContext, type ReactNode } from "react"

import {
  buildDefaultMarketingPricing,
  type MarketingPricing,
} from "@/lib/pricing/marketing-pricing"

const MarketingPricingContext = createContext<MarketingPricing>(
  buildDefaultMarketingPricing()
)

export function MarketingPricingProvider({
  pricing,
  children,
}: Readonly<{
  pricing: MarketingPricing
  children: ReactNode
}>) {
  return (
    <MarketingPricingContext.Provider value={pricing}>
      {children}
    </MarketingPricingContext.Provider>
  )
}

export function useMarketingPricing(): MarketingPricing {
  return useContext(MarketingPricingContext)
}
