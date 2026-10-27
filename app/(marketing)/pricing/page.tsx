import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall, macwallCatalog } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `${macwall.name} Pro is a one-time payment, not a subscription. Get ${macwallCatalog.liveCountLabel} live wallpapers (most in 4K), a live Lock Screen on macOS 26, and free updates forever.`

export const metadata: Metadata = createSimplePageMetadata({
  title: "Pricing",
  description: PAGE_DESCRIPTION,
  path: "/pricing",
})

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
      <link rel="preconnect" href="https://checkout.stripe.com" />
      <link rel="dns-prefetch" href="https://checkout.stripe.com" />
      <link rel="preconnect" href="https://js.stripe.com" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      <JsonLd payload={jsonLd} />
      <MacWallMarketingPricingPage />
    </>
  )
}
