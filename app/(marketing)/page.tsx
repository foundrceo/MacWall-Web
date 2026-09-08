import MacWallMarketingHome from "@/components/macwall-marketing/marketing-home"
import { JsonLd } from "@/components/seo/json-ld"
import { macwall } from "@/lib/macwall-site"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

/** ≤155 chars; leads with the app entity to disambiguate from the unrelated "MACWALL" retaining-wall product. */
const PAGE_DESCRIPTION =
  "MacWall is the native macOS app for cinematic live 4K wallpapers on macOS 15+, with menu bar control and near-zero battery impact. Lock Screen video on macOS 26+. $7.99, paid once."

export const metadata: Metadata = {
  title: { absolute: macwall.fullTagline },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: canonicalSitePath("/"),
    types: {
      ...feedAlternateTypes(),
      "text/markdown": canonicalSitePath("/index.md"),
    },
  },
  keywords: [
    `${macwall.name} download`,
    "best live wallpaper macOS",
    "best wallpaper app for mac",
    "animated wallpapers Mac Desktop",
    "HD motion backgrounds Mac",
    "Mac live wallpapers",
    "motion desktop background",
    "wallpaper engine alternative mac",
    "lock screen live wallpaper mac",
    "live wallpaper for mac",
  ],
  openGraph: {
    title: macwall.fullTagline,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/"),
    siteName: macwall.name,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: macwall.fullTagline,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: macwall.fullTagline,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

const HOME_FAQ = pricingCopy.faq.map((item) => ({
  question: item.q,
  answer: item.a,
}))

export default async function Page() {
  return (
    <>
      <JsonLd payload={faqPageJsonLd([...HOME_FAQ])} />
      <MacWallMarketingHome />
    </>
  )
}
