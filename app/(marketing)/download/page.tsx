import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { downloadPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(downloadPage)

export const dynamic = "force-static"

export default function DownloadPage() {
  const origin = canonicalSiteOrigin()

  const webPageLd = webPageWithBreadcrumbsJsonLd({
    origin,
    pathname: downloadPage.pathname,
    pageTitle: "Download",
    headline: downloadPage.headline,
    description: downloadPage.description,
  })

  const faqLd =
    downloadPage.faq && downloadPage.faq.length > 0
      ? faqPageJsonLd(downloadPage.faq)
      : null

  return (
    <>
      <JsonLd payload={webPageLd} />
      {faqLd ? <JsonLd payload={faqLd} /> : null}
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
