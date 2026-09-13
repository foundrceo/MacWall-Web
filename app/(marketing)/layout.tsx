import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"
import { FLAGS } from "@/lib/flags"
import { CommandPaletteMount } from "@/components/command-palette/command-palette-mount"
import { MarketingPricingProvider } from "@/components/marketing/marketing-pricing-context"
import { MarketingShellEnd } from "@/components/marketing/shell-end"
import { MarketingPageFrame } from "@/components/macwall-marketing/marketing-page-frame"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import { SocialProofMount } from "@/components/macwall-marketing/social-proof-mount"
import { WallpaperPurchaseBannerMount } from "@/components/wallpaper-gallery/wallpaper-purchase-banner-mount"
import type { ReactNode } from "react"

/**
 * Shared marketing chrome lives here, not in each page.
 * Geo + Stripe FX prices hydrate via `/api/pricing` so these routes stay cacheable.
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
          <MarketingPageFrame>
            <a href="#main-content" className="marketing-skip-link">
              Skip to main content
            </a>
            <MarketingSiteChrome />
            <main
              id="main-content"
              className="marketing-main-offset flex flex-1 flex-col divide-y divide-dashed divide-border border-dashed sm:border-b"
            >
              {children}
              <MarketingShellEnd />
            </main>
          </MarketingPageFrame>
          {FLAGS.socialProof ? <SocialProofMount /> : null}
          <WallpaperPurchaseBannerMount />
        </div>
      </CommandPaletteMount>
    </MarketingPricingProvider>
  )
}
