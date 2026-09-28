import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { downloadPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(downloadPage)


export default function DownloadPage() {
  const origin = canonicalSiteOrigin()

  const webPageLd = webPageWithBreadcrumbsJsonLd({
    origin,
    pathname: downloadPage.pathname,
    pageTitle: "Download",
    headline: downloadPage.headline,
    description: downloadPage.description,
  })

  return (
    <>
      <JsonLd payload={webPageLd} />
      <SeoLandingPage
        page={downloadPage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Download", href: "/download" },
        ]}
      />
    </>
  )
}
