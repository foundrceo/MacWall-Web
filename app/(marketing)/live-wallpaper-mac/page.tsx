import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { liveWallpaperMacPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(liveWallpaperMacPage)

export const dynamic = "force-static"

export default function LiveWallpaperMacPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: liveWallpaperMacPage.pathname,
          pageTitle: "Live Wallpaper for Mac",
          headline: liveWallpaperMacPage.headline,
          description: liveWallpaperMacPage.description,
        })}
      />
      {liveWallpaperMacPage.faq ? (
        <JsonLd payload={faqPageJsonLd(liveWallpaperMacPage.faq)} />
      ) : null}
      <SeoLandingPage page={liveWallpaperMacPage} />
    </>
  )
}
