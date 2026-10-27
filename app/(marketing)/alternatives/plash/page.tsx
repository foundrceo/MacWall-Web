import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { plashAlternativePage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(plashAlternativePage)

export default function PlashAlternativePage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: plashAlternativePage.pathname,
          pageTitle: "Plash vs MacWall",
          headline: plashAlternativePage.headline,
          description: plashAlternativePage.description,
          dateModifiedIso: plashAlternativePage.updatedAt,
        })}
      />
      <SeoLandingPage page={plashAlternativePage} />
    </>
  )
}
