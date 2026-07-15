import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallVsWallspacePage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(macwallVsWallspacePage)

export const dynamic = "force-static"

export default function MacwallVsWallspacePage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: macwallVsWallspacePage.pathname,
          pageTitle: "MacWall vs Wallspace",
          headline: macwallVsWallspacePage.headline,
          description: macwallVsWallspacePage.description,
        })}
      />
      <SeoLandingPage page={macwallVsWallspacePage} />
    </>
  )
}
