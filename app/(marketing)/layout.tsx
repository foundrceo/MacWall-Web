import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"
import { MarketingPricingProvider } from "@/components/marketing/marketing-pricing-context"
import { resolveMarketingPricing } from "@/lib/pricing/resolve-marketing-pricing"
import type { ReactNode } from "react"

/** Geo-aware pricing is resolved on the server so India INR prices render on first paint. */
export const dynamic = "force-dynamic"

export default async function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const catalogOrigin = getCatalogSupabaseOrigin()
  const mediaOrigin = getR2PublicBaseUrl()
  const pricing = await resolveMarketingPricing()

  return (
    <MarketingPricingProvider pricing={pricing}>
      <div className="dark min-h-screen bg-background text-foreground">
        <link rel="preconnect" href={mediaOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={mediaOrigin} />
        <link rel="preconnect" href={catalogOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={catalogOrigin} />
        {children}
      </div>
    </MarketingPricingProvider>
  )
}
