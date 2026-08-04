import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"
import { CommandPaletteMount } from "@/components/command-palette/command-palette-mount"
import { MacWallChatMount } from "@/components/macwall-chat/macwall-chat-mount"
import { MarketingPricingProvider } from "@/components/marketing/marketing-pricing-context"
import { SocialProofMount } from "@/components/macwall-marketing/social-proof-mount"
import { WallpaperPurchaseBannerMount } from "@/components/wallpaper-gallery/wallpaper-purchase-banner-mount"
import type { ReactNode } from "react"

/**
 * Static/ISR-friendly marketing shell.
 * Geo + Stripe FX prices hydrate client-side via `/api/pricing` so blog,
 * wallpapers, and SEO landings stay cacheable (no force-dynamic here).
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const catalogOrigin = getCatalogSupabaseOrigin()
  const mediaOrigin = getR2PublicBaseUrl()

  return (
    <MarketingPricingProvider>
      <CommandPaletteMount>
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
          {children}
          <SocialProofMount />
          <WallpaperPurchaseBannerMount />
          <MacWallChatMount />
        </div>
      </CommandPaletteMount>
    </MarketingPricingProvider>
  )
}
