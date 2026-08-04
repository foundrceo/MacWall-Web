import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingCreatorPage from "@/components/macwall-marketing/marketing-creator"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallCreatorCopy } from "@/lib/macwall-creator-copy"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_TITLE = "Creator Solution"
const PAGE_DESCRIPTION = `${macwallCreatorCopy.heroTitle} Post a short video of ${macwall.name} in action — ${macwall.reelRefundHalfViews.toLocaleString()} reach for 50% back, ${macwall.reelRefundFullViews.toLocaleString()} for a complete resolution.`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/creator") },
  openGraph: {
    title: `${macwall.name} – ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/creator"),
    siteName: macwall.name,
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
