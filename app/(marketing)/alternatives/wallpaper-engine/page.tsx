import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { wallpaperEngineAlternativePage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(wallpaperEngineAlternativePage)

export const dynamic = "force-static"

export default function WallpaperEngineAlternativePage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: wallpaperEngineAlternativePage.pathname,
          pageTitle: "Wallpaper Engine Alternative",
          headline: wallpaperEngineAlternativePage.headline,
          description: wallpaperEngineAlternativePage.description,
        })}
      />
      <SeoLandingPage
        page={wallpaperEngineAlternativePage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          {
            label: "Wallpaper Engine Alternative",
            href: wallpaperEngineAlternativePage.pathname,
          },
        ]}
      />
    </>
  )
}
