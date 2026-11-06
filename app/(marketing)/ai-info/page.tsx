import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { getMacwallAiInfoPage } from "@/lib/ai/macwall-ai-info"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return createSeoPageMetadata(getMacwallAiInfoPage())
}

/**
 * Prices on this page come from the sale-aware helper at render time; the
 * sale-boundary cron revalidates /ai-info when a sale starts or ends.
 */
export default function AiInfoPage() {
  const origin = canonicalSiteOrigin()
  const page = getMacwallAiInfoPage()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: page.pathname,
          pageTitle: page.title,
          headline: page.headline,
          description: page.description,
          dateModifiedIso: macwall.productInfoLastReviewedIso,
          aboutId: "#softwareapplication",
          breadcrumbName: "AI product information",
        })}
      />
      {page.faq ? <JsonLd payload={faqPageJsonLd(page.faq)} /> : null}
      <SeoPageShell
        headline={page.headline}
        description={page.description}
        sections={page.sections}
        faq={page.faq}
        breadcrumbs={[{ label: "Home", href: "/" }]}
        meta={`Last reviewed ${macwall.productInfoLastReviewedLabel} · App version ${macwall.currentVersion}`}
      />
    </>
  )
}
