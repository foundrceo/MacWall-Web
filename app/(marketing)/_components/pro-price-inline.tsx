"use client"

import type { ReactNode } from "react"

import { SaleWasPrice } from "@/components/macwall-marketing/sale-was-price"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"

/**
 * Pro's price inside server-rendered prose. The server HTML carries the
 * sale-aware USD price for the default region (lib/pricing/sale-aware-price),
 * which is what crawlers and AI answer engines read. Once the visitor's
 * regional price is known (India, or a local currency) it replaces that text,
 * the same way the hero caption does.
 */
export function ProPriceInline({
  children,
}: Readonly<{
  /** The server's price text, e.g. "$12.99" or a struck-through sale price. */
  children: ReactNode
}>) {
  const pricing = useMarketingPricing()
  if (!pricing.isLocalized && !pricing.isIndia) return <>{children}</>
  return (
    <>
      <SaleWasPrice />
      {pricing.permanentPrice}
    </>
  )
}

/**
 * Server-rendered text that only holds for the default region's price, such
 * as the running sale's name and end date. Hidden once a regional price
 * replaces the default one, since another region may have no sale or a
 * different one.
 */
export function DefaultPricingOnly({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pricing = useMarketingPricing()
  if (pricing.isLocalized || pricing.isIndia) return null
  return <>{children}</>
}
