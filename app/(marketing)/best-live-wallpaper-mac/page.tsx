import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { bestLiveWallpaperMacPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(bestLiveWallpaperMacPage)

export const dynamic = "force-static"

export default function BestLiveWallpaperMacPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: bestLiveWallpaperMacPage.pathname,
          pageTitle: "Best Live Wallpaper for Mac",
          headline: bestLiveWallpaperMacPage.headline,
          description: bestLiveWallpaperMacPage.description,
        })}
      />
      <SeoLandingPage page={bestLiveWallpaperMacPage} />
    </>
  )
}
