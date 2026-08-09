import { Suspense } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `${macwall.name} Pro is a one-time payment, not a subscription. Get 1,000+ live 4K wallpapers, a live Lock Screen on macOS 26, and free updates forever.`

export const metadata: Metadata = {
  title: "Pricing",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: canonicalSitePath("/pricing"),
    types: {
      ...feedAlternateTypes(),
      "text/markdown": canonicalSitePath("/pricing.md"),
    },
  },
  openGraph: {
    title: `Pricing | ${macwall.name}`,
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
    title: `Pricing | ${macwall.name}`,
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
      <link rel="preconnect" href="https://checkout.stripe.com" />
      <link rel="dns-prefetch" href="https://checkout.stripe.com" />
      <link rel="preconnect" href="https://js.stripe.com" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      <JsonLd payload={jsonLd} />
      <Suspense fallback={null}>
        <MacWallMarketingPricingPage />
      </Suspense>
    </>
  )
}
