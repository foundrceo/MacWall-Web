import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import {
  macwallPricingCopy,
  pricingHeroPriceLine,
} from "@/lib/macwall-pricing-copy"
import { macwall, macwallCatalog } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `${macwall.name} Pro is a one-time payment, not a subscription: ${macwallCatalog.liveCountLabel} live wallpapers (most in 4K), a live Lock Screen on macOS 26+ and free updates. Free for 24 hours.`

export const metadata: Metadata = createSimplePageMetadata({
  title: macwallPricingCopy.pageTitle,
  description: PAGE_DESCRIPTION,
  path: "/pricing",
})

export default function PricingPage() {
  const origin = canonicalSiteOrigin()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin,
    pathname: "/pricing",
    pageTitle: macwallPricingCopy.pageTitle,
    headline: macwallPricingCopy.heroH1,
    description: PAGE_DESCRIPTION,
    breadcrumbName: "Pricing",
    aboutId: "#softwareapplication",
  })
  // The questions shown on this page, marked up here (answers lose their Markdown).
  const faqJsonLd = faqPageJsonLd(
    macwallPricingCopy.faq.map((item) => ({ question: item.q, answer: item.a }))
  )

  return (
    <>
      <link rel="preconnect" href="https://checkout.stripe.com" />
      <link rel="dns-prefetch" href="https://checkout.stripe.com" />
      <link rel="preconnect" href="https://js.stripe.com" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      <JsonLd payload={jsonLd} />
      <JsonLd payload={faqJsonLd} />
      <MacWallMarketingPricingPage priceLine={pricingHeroPriceLine()} />
    </>
  )
}
