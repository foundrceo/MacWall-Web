import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { dynamicWallpaperClubPage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(dynamicWallpaperClubPage)

export default function DynamicWallpaperClubPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: dynamicWallpaperClubPage.pathname,
          pageTitle: "Dynamic Wallpaper Club vs MacWall",
          headline: dynamicWallpaperClubPage.headline,
          description: dynamicWallpaperClubPage.description,
          dateModifiedIso: dynamicWallpaperClubPage.updatedAt,
        })}
      />
      <SeoLandingPage page={dynamicWallpaperClubPage} />
    </>
  )
}
