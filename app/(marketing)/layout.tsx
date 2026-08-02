import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"
import { MacWallChatMount } from "@/components/macwall-chat/macwall-chat-mount"
import { HeroVideoPreload } from "@/components/macwall-marketing/hero-video-preload"
import { MarketingPricingProvider } from "@/components/marketing/marketing-pricing-context"
import { resolveMarketingPricing } from "@/lib/pricing/resolve-marketing-pricing"
import type { ReactNode } from "react"

/** Geo + Stripe FX localize marketing prices on first paint (Adaptive Pricing at Checkout). */
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

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
        {catalogOrigin ? (
          <>
            <link
              rel="preconnect"
              href={catalogOrigin}
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href={catalogOrigin} />
          </>
        ) : null}
        <HeroVideoPreload />
        {children}
        <MacWallChatMount />
      </div>
    </MarketingPricingProvider>
  )
}
