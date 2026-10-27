import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import type { Metadata } from "next"

import MacWallMarketingAffiliatePage from "@/components/macwall-marketing/marketing-affiliate"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallAffiliateCopy } from "@/lib/macwall-affiliate-copy"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

const PAGE_TITLE = macwallAffiliateCopy.pageTitle
const PAGE_DESCRIPTION = `${macwallAffiliateCopy.heroLead} Share one link in a video, post or newsletter and get paid for each purchase it brings.`

export const metadata: Metadata = createSimplePageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/affiliate",
})

export default function AffiliatePage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/affiliate",
    pageTitle: PAGE_TITLE,
    headline: `${macwall.name} Affiliate Program`,
    description: PAGE_DESCRIPTION,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <MacWallMarketingAffiliatePage />
    </>
  )
}
