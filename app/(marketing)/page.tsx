import { JsonLd } from "@/components/seo/json-ld"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { macwall } from "@/lib/macwall-site"
import { macwallHomeFaq } from "@/lib/macwall-pricing-copy"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

import { Categories } from "./_components/categories"
import { Everything } from "./_components/everything"
import { Features } from "./_components/features"
import { Hero } from "./_components/hero"
import { Pillars } from "./_components/pillars"
import { Playback } from "./_components/playback"
import { Reviews } from "./_components/reviews"

const PAGE_DESCRIPTION =
  "Live wallpapers for Mac: 1,000+ 4K animated wallpapers on your desktop, Lock Screen and screen saver (macOS 26). Native app, free 24-hour trial, one payment."

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
    "mac live backgrounds",
    "live desktop backgrounds mac",
    "dynamic wallpaper mac",
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

const HOME_FAQ = macwallHomeFaq.map((item) => ({
  question: item.q,
  answer: item.a,
}))

export default async function Page() {
  return (
    <>
      <JsonLd payload={faqPageJsonLd([...HOME_FAQ])} />
      <Hero />
      <Categories />
      <Features variant="rows" />
      <Everything />
      <Pillars />
      <Reviews />
      <Playback />
      <MarketingFaqSection items={macwallHomeFaq} />
    </>
  )
}
