import type { Metadata } from "next"

import MacWallMarketingAffiliatePage from "@/components/macwall-marketing/marketing-affiliate"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallAffiliateCopy, AFFILIATE_COMMISSION_PERCENT } from "@/lib/macwall-affiliate-copy"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"

const PAGE_TITLE = macwallAffiliateCopy.pageTitle
const PAGE_DESCRIPTION = `Earn ${AFFILIATE_COMMISSION_PERCENT}% when you refer ${macwall.name} Pro. Free to join — partner dashboard included.`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/affiliate") },
  openGraph: {
    title: `${macwall.name} – ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/affiliate"),
    siteName: `${macwall.name} App`,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} – ${PAGE_TITLE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} – ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

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
