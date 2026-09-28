import { JsonLd } from "@/components/seo/json-ld"
import { HeroVideoPreload } from "@/components/macwall-marketing/hero-video-preload"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { MarketingSeparator } from "@/components/macwall-marketing/marketing-separator"
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

import { Features } from "./_components/features"
import { Hero } from "./_components/hero"
import { Pillars } from "./_components/pillars"
import { ProductPreview } from "./_components/product-preview"
import { Proof } from "./_components/proof"
import { Reviews } from "./_components/reviews"

const PAGE_DESCRIPTION =
  "Live wallpapers for Mac: 4K animated video on your desktop and Lock Screen (macOS 26). Native app, pauses on battery, 800+ loops, one payment."

/** Brand first, then the head term people search ("live wallpaper mac"). */
const PAGE_TITLE = `${macwall.name}: Live Wallpapers for Mac – 4K Desktop & Lock Screen`

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
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
    "live wallpaper mac",
    "animated wallpaper mac",
    "moving wallpaper mac",
    "video wallpaper mac",
  ],
  openGraph: {
    title: PAGE_TITLE,
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
    title: PAGE_TITLE,
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
      <HeroVideoPreload />
      <Hero />
      <Proof />
      <MarketingSeparator />
      <ProductPreview />
      <MarketingSeparator />
      <Pillars />
      <MarketingSeparator />
      <Features />
      <MarketingSeparator />
      <Reviews />
      <MarketingSeparator />
      <MarketingFaqSection />
    </>
  )
}
