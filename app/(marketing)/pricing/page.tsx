import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin, canonicalSitePath } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `Pricing for ${macwall.name} Pro versus the free tier: one-time checkout, licensing on up to ${macwall.maxLicensedMacs} personal Macs, and what ships on Sonoma, Ventura, Sequoia, and newer.`

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
