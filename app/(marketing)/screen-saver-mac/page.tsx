import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { screenSaverMacPage } from "@/lib/seo/landing-pages"
import { canonicalSiteOrigin } from "@/lib/site-url"

const page = screenSaverMacPage

export const metadata = createSeoPageMetadata(page)

export default function ScreenSaverMacPage() {
  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: page.pathname,
          pageTitle: page.headline,
          headline: page.headline,
          description: page.description,
          breadcrumbName: "Screen savers",
          datePublishedIso: page.publishedAt,
          dateModifiedIso: page.updatedAt,
          aboutId: "#softwareapplication",
        })}
      />
      <SeoLandingPage
        page={page}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Screen savers", href: page.pathname },
        ]}
      />
    </>
  )
}
