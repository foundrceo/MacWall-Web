import { PageMotion } from "@/components/motion/page-motion"
import { JsonLd } from "@/components/seo/json-ld"
import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import { MARKETING_HERO_VIDEO_MP4_PATH } from "@/lib/marketing-assets-urls"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall, macwallCatalog, macwallSocialProof } from "@/lib/macwall-site"
import { macwallHomeFaq, macwallPricingCopy } from "@/lib/macwall-pricing-copy"
import { getPublicStats } from "@/lib/public-stats"
import {
  faqPageJsonLd,
  jsonLdGraph,
  videoObjectJsonLd,
  webPageJsonLd,
} from "@/lib/seo/json-ld-helpers"
import { brandedTitle, OPEN_GRAPH_LOCALE } from "@/lib/seo/create-page-metadata"
import { ogImageForPath } from "@/lib/seo/og-images"
import {
  canonicalSiteOrigin,
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
import { HomeCompareLinks } from "./_components/home-link-bands"
import { Playback } from "./_components/playback"
import { Reviews } from "./_components/reviews"
import { WhatIsMacWall } from "./_components/what-is-macwall"

const PAGE_DESCRIPTION = `The live wallpaper app for Mac: ${macwallCatalog.liveCountLabel} animated wallpapers, most in 4K, for your desktop and Lock Screen. ${macwallSocialProof.downloadsLine}. Free 24-hour trial, pay once.`

/**
 * "live wallpaper app for Mac" first (the query family the home page sits
 * just off page one for), 4K kept for "4k backgrounds for mac", brand last
 * like every other page.
 */
const PAGE_TITLE = brandedTitle("Live Wallpaper App for Mac: 4K, Lock Screen")

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
    locale: OPEN_GRAPH_LOCALE,
    type: "website",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [{ url: SHARE_IMAGE.url, alt: SHARE_IMAGE.alt }],
  },
}

/**
 * The hero demo (lib/marketing-assets-urls): a 24-second, 1662×1080 screen
 * recording, uploaded to the CDN on 2026-10-16 (its Last-Modified). Re-check
 * both if the file is replaced.
 */
const HERO_VIDEO = {
  name: `${macwall.name} demo: setting a live wallpaper on a Mac`,
  description: `A screen recording of the ${macwall.name} app on a Mac: browsing the catalog, opening a 4K live wallpaper and setting it on the desktop in one click.`,
  poster: "/hero/hero-video-poster.jpg",
  uploadDate: "2026-10-16",
  durationSeconds: 24,
  width: 1662,
  height: 1080,
} as const

/**
 * The home FAQ's structured data. Questions also shown (and marked up) on
 * /pricing are left out, so each FAQ is marked up once; the visible FAQ
 * below still lists them.
 */
const PRICING_FAQ_QUESTIONS = new Set<string>(
  macwallPricingCopy.faq.map((item) => item.q)
)
const HOME_FAQ_STRUCTURED = macwallHomeFaq
  .filter((item) => !PRICING_FAQ_QUESTIONS.has(item.q))
  .map((item) => ({ question: item.q, answer: item.a }))

function homeJsonLd() {
  const origin = canonicalSiteOrigin()
  return jsonLdGraph(
    webPageJsonLd({
      origin,
      pathname: "/",
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      about: "#softwareapplication",
      mainEntity: "#softwareapplication",
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${origin}${HERO_VIDEO.poster}`,
        width: 1108,
        height: 720,
        caption: macwallMarketingCopy.interact.heroPosterAlt,
      },
      video: "#video",
    }),
    videoObjectJsonLd({
      origin,
      pathname: "/",
      name: HERO_VIDEO.name,
      description: HERO_VIDEO.description,
      thumbnailUrl: HERO_VIDEO.poster,
      uploadDate: HERO_VIDEO.uploadDate,
      contentUrl: MARKETING_HERO_VIDEO_MP4_PATH,
      duration: HERO_VIDEO.durationSeconds,
      width: HERO_VIDEO.width,
      height: HERO_VIDEO.height,
    }),
    faqPageJsonLd(HOME_FAQ_STRUCTURED)
  )
}

export default async function Page() {
  const stats = await getPublicStats()
  return (
    <>
      <JsonLd payload={homeJsonLd()} />
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
      <WhatIsMacWall />
      <MarketingFaqSection
        items={macwallHomeFaq}
        heading="Live wallpaper for Mac: FAQ"
        aside={<HomeCompareLinks />}
      />
    </>
  )
}
