import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingCreatorPage from "@/components/macwall-marketing/marketing-creator"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallCreatorCopy } from "@/lib/macwall-creator-copy"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import type { Metadata } from "next"

const PAGE_TITLE = "Get Your Money Back With a Video"
const PAGE_DESCRIPTION = `Post a short video about ${macwall.name} and get money back: 50% at ${macwall.reelRefundHalfViews.toLocaleString()} views, a full refund at ${macwall.reelRefundFullViews.toLocaleString()} views. Downloads start with a free 24-hour trial.`

export const metadata: Metadata = createSimplePageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/creator",
})

export default function CreatorPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/creator",
    pageTitle: PAGE_TITLE,
    headline: macwallCreatorCopy.heroTitle,
    description: PAGE_DESCRIPTION,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <MacWallMarketingCreatorPage />
    </>
  )
}
