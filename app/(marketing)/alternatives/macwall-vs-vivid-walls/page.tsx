import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallVsVividWallsPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const metadata = createSeoPageMetadata(macwallVsVividWallsPage)

export const dynamic = "force-static"

export default function MacwallVsVividWallsPage() {
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: macwallVsVividWallsPage.pathname,
          pageTitle: "MacWall vs Vivid Walls",
          headline: macwallVsVividWallsPage.headline,
          description: macwallVsVividWallsPage.description,
        })}
      />
      <SeoLandingPage page={macwallVsVividWallsPage} />
    </>
  )
}
