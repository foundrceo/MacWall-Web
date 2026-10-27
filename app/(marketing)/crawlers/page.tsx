import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { crawlersPage } from "@/lib/seo/crawlers-page"

const PAGE = crawlersPage

export const metadata = createSeoPageMetadata(PAGE)

export default function CrawlersPage() {
  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: PAGE.pathname,
          pageTitle: PAGE.title,
          headline: PAGE.headline,
          description: PAGE.description,
          dateModifiedIso: PAGE.updatedAt,
        })}
      />
      <SeoPageShell
        headline={PAGE.headline}
        description={PAGE.description}
        sections={PAGE.sections}
        faq={PAGE.faq}
        breadcrumbs={[{ label: "Home", href: "/" }]}
        showBottomCta={false}
      />
    </>
  )
}
