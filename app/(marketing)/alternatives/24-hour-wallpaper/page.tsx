import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { twentyFourHourWallpaperPage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(twentyFourHourWallpaperPage)

export default function TwentyFourHourWallpaperPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: twentyFourHourWallpaperPage.pathname,
          pageTitle: "24 Hour Wallpaper vs MacWall",
          headline: twentyFourHourWallpaperPage.headline,
          description: twentyFourHourWallpaperPage.description,
          dateModifiedIso: twentyFourHourWallpaperPage.updatedAt,
        })}
      />
      <SeoLandingPage page={twentyFourHourWallpaperPage} />
    </>
  )
}
