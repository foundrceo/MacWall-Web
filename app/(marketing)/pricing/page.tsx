import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin, canonicalSitePath } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `${macwall.name} Pro includes a 24-hour free trial, then ${macwall.pro.price} one-time with lifetime updates. Make a Reel, hit 2,000 views for 50% back or 20,000 for a full refund. Licensed on up to ${macwall.maxLicensedMacs} personal Macs.`

export const metadata: Metadata = {
  title: "Pricing",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/pricing") },
  openGraph: {
    title: `${macwall.name} – Pricing`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/pricing"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} – Pricing`,
    description: PAGE_DESCRIPTION,
  },
}

export const dynamic = "force-static"

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
