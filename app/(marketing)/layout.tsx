import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { FLAGS } from "@/lib/flags"
import { CommandPaletteMount } from "@/components/command-palette/command-palette-mount"
import { MarketingPricingProvider } from "@/components/marketing/marketing-pricing-context"
import { MarketingShellEnd } from "@/components/marketing/shell-end"
import { InstallGuide } from "@/components/macwall-marketing/install-guide"
import { MarketingPageFrame } from "@/components/macwall-marketing/marketing-page-frame"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import { SocialProofMount } from "@/components/macwall-marketing/social-proof-mount"
import { WallpaperPurchaseBannerMount } from "@/components/wallpaper-gallery/wallpaper-purchase-banner-mount"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Shared marketing chrome lives here, not in each page.
 * Geo + Stripe FX prices hydrate via `/api/pricing` so these routes stay cacheable.
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const mediaOrigin = getR2PublicBaseUrl()

  return (
    <MarketingPricingProvider>
      <CommandPaletteMount>
        <div
          className={cn(
            "dark min-h-screen bg-background text-foreground",
            !FLAGS.announcementBanner && "no-announcement-banner"
          )}
        >
          {/* Wallpaper videos load without CORS, so the warm connection must
              not be `crossorigin` or the browser opens a second one. Catalog
              reads happen server-side, so there's no Supabase hint here. */}
          <link rel="preconnect" href={mediaOrigin} />
          <MarketingPageFrame>
            <a href="#main-content" className="marketing-skip-link">
              Skip to main content
            </a>
            <MarketingSiteChrome />
            <main
              id="main-content"
              className="marketing-main-offset flex flex-1 flex-col divide-y divide-dashed divide-border"
            >
              {children}
              <MarketingShellEnd />
            </main>
          </MarketingPageFrame>
          <InstallGuide />
          {FLAGS.socialProof ? <SocialProofMount /> : null}
          <WallpaperPurchaseBannerMount />
        </div>
      </CommandPaletteMount>
    </MarketingPricingProvider>
  )
}
