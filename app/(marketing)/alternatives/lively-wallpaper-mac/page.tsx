import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { livelyWallpaperMacPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(livelyWallpaperMacPage)


export default function LivelyWallpaperMacPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: livelyWallpaperMacPage.pathname,
          pageTitle: "Lively Wallpaper for Mac",
          headline: livelyWallpaperMacPage.headline,
          description: livelyWallpaperMacPage.description,
        })}
      />
      <SeoLandingPage page={livelyWallpaperMacPage} />
    </>
  )
}
