import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { lockScreenWallpaperPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(lockScreenWallpaperPage)


export default function LockScreenWallpaperPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: lockScreenWallpaperPage.pathname,
          pageTitle: "Lock Screen Wallpaper",
          headline: lockScreenWallpaperPage.headline,
          description: lockScreenWallpaperPage.description,
        })}
      />
      {lockScreenWallpaperPage.faq ? (
        <JsonLd payload={faqPageJsonLd(lockScreenWallpaperPage.faq)} />
      ) : null}
      <SeoLandingPage page={lockScreenWallpaperPage} />
    </>
  )
}
