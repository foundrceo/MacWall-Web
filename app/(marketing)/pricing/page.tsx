import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `Choose ${macwall.name} permanent license or annual subscription, plus a 5-Mac permanent bundle.`

export const metadata: Metadata = {
  title: "Pricing",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/pricing") },
  openGraph: {
    title: `${macwall.name} App – Pricing`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/pricing"),
    siteName: `${macwall.name} App`,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} App – Pricing`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} App – Pricing`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}


export default function PricingPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/pricing",
    pageTitle: "Pricing",
    headline: `${macwall.name} Pro pricing`,
    description: PAGE_DESCRIPTION,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <MacWallMarketingPricingPage />
    </>
  )
}
