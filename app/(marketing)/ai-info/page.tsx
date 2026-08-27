import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { macwallAiInfoPage } from "@/lib/ai/macwall-ai-info"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(macwallAiInfoPage)

export default function AiInfoPage() {
  const origin = canonicalSiteOrigin()
  const softwareApplicationId = `${origin}/#softwareapplication`

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: macwallAiInfoPage.pathname,
          pageTitle: macwallAiInfoPage.title,
          headline: macwallAiInfoPage.headline,
          description: macwallAiInfoPage.description,
          dateModifiedIso: macwall.productInfoLastReviewedIso,
          aboutId: softwareApplicationId,
        })}
      />
      {macwallAiInfoPage.faq ? (
        <JsonLd payload={faqPageJsonLd(macwallAiInfoPage.faq)} />
      ) : null}
      <SeoPageShell
        headline={macwallAiInfoPage.headline}
        description={macwallAiInfoPage.description}
        sections={macwallAiInfoPage.sections}
        faq={macwallAiInfoPage.faq}
        breadcrumbs={[{ label: "Home", href: "/" }]}
        meta={`Last reviewed ${macwall.productInfoLastReviewedLabel} · App version ${macwall.currentVersion}`}
      />
    </>
  )
}
