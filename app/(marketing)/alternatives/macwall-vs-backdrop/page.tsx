import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallVsBackdropPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(macwallVsBackdropPage)


export default function MacwallVsBackdropPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: macwallVsBackdropPage.pathname,
          pageTitle: "MacWall vs Backdrop",
          headline: macwallVsBackdropPage.headline,
          description: macwallVsBackdropPage.description,
        })}
      />
      <SeoLandingPage page={macwallVsBackdropPage} />
    </>
  )
}
