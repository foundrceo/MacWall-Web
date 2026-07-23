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

const PAGE_DESCRIPTION = `${macwall.name} Pro is ${macwall.pro.price} for up to ${macwall.maxLicensedMacs} Macs. Pro Plus is $14.99 for up to 5 Macs. Make a Reel for up to 100% back.`

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
