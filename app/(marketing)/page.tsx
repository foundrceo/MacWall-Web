import { PageMotion } from "@/components/motion/page-motion"
import { JsonLd } from "@/components/seo/json-ld"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { macwall, macwallCatalog, macwallSocialProof } from "@/lib/macwall-site"
import { macwallHomeFaq } from "@/lib/macwall-pricing-copy"
import { getPublicStats } from "@/lib/public-stats"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { brandedTitle } from "@/lib/seo/create-page-metadata"
import { ogImageForPath } from "@/lib/seo/og-images"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

import { BuiltForMac } from "./_components/built-for-mac"
import { Categories } from "./_components/categories"
import { Everything } from "./_components/everything"
import { Features } from "./_components/features"
import { Hero } from "./_components/hero"
import { Playback } from "./_components/playback"
import { Reviews } from "./_components/reviews"

const PAGE_DESCRIPTION = `Live wallpapers for Mac: ${macwallCatalog.liveCountLabel} animated wallpapers, most in 4K, for your desktop and Lock Screen. ${macwallSocialProof.downloadsLine}. Free 24-hour trial, one payment.`

/** Head term first ("live wallpaper mac"), brand last like every other page. */
const PAGE_TITLE = brandedTitle(
  "4K Live Wallpapers for Mac Desktop and Lock Screen"
)

const SHARE_IMAGE = ogImageForPath("/") ?? {
  url: openGraphImageAbsoluteUrl(),
  width: openGraphImageSize.width,
  height: openGraphImageSize.height,
  alt: macwall.fullTagline,
}

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
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
}

const HOME_FAQ = macwallHomeFaq.map((item) => ({
  question: item.q,
  answer: item.a,
}))

export default async function Page() {
  const stats = await getPublicStats()
  return (
    <>
      <JsonLd payload={faqPageJsonLd([...HOME_FAQ])} />
      <PageMotion
        layout="landing"
        rootSelector="#main-content section:not(section section)"
      />
      <Hero />
      <Categories />
      <Features variant="rows" />
      <Everything />
      <BuiltForMac stats={stats} />
      <Reviews />
      <Playback />
      <MarketingFaqSection items={macwallHomeFaq} />
    </>
  )
}
