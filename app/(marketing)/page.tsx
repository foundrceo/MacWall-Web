import MacWallMarketingHome from "@/components/macwall-marketing/marketing-home"
import MacWallMarketingGallerySection from "@/components/macwall-marketing/marketing-gallery-section"
import MacWallMarketingWalkthroughSection from "@/components/macwall-marketing/marketing-walkthrough-section"
import { JsonLd } from "@/components/seo/json-ld"
import { fetchMarketingHomePickSlides } from "@/lib/fetch-marketing-home-pick-wallpapers"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

/** ≤158 chars; leads with the app entity to disambiguate from the unrelated "MACWALL" retaining-wall product. */
const PAGE_DESCRIPTION =
  "MacWall is the native macOS app for cinematic live wallpapers, controlled from the menu bar, with near-zero battery impact and a Lock Screen on macOS 26. One-time $7.99, no subs."

/** Exact homepage <title>. "App" is the key signal that separates the MacWall app from the MACWALL retaining-wall brand. */
const HOME_DOCUMENT_TITLE_ABSOLUTE =
  "MacWall App — Live Wallpapers for Mac" as const

export const metadata: Metadata = {
  title: { absolute: HOME_DOCUMENT_TITLE_ABSOLUTE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/") },
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
    title: HOME_DOCUMENT_TITLE_ABSOLUTE,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/"),
    siteName: macwall.name,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} – ${macwall.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_DOCUMENT_TITLE_ABSOLUTE,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

export const dynamic = "force-static"

const HOME_FAQ = [
  {
    question: "What is the best live wallpaper app for Mac?",
    answer:
      "MacWall is a native macOS app with hardware-accelerated video playback, menu bar controls, community catalog, and one-time Pro pricing, built for smooth daily use on Apple Silicon and Intel Macs.",
  },
  {
    question: "How much does MacWall cost?",
    answer:
      "MacWall is a one-time $7.99 purchase (early bird, normally $9.99) with lifetime updates and no subscription. One license covers up to 3 personal Macs, and posting a Reel with #macwall can earn up to 100% of the price back.",
  },
  {
    question: "Does MacWall work on MacBook Air and MacBook Pro?",
    answer:
      "MacWall supports Apple Silicon (M-series) and Intel Macs running macOS 14 Sonoma or later, with automatic pause on battery, full screen, and high CPU. Live Lock Screen and Screen Saver wallpapers require macOS 26 Tahoe.",
  },
] as const

/** MacWall marketing homepage (vendored layout CSS + catalog demo). */
export default async function Page() {
  const homePickSlides = await fetchMarketingHomePickSlides()
  const origin = canonicalSiteOrigin()

  const webPageLd = webPageWithBreadcrumbsJsonLd({
    origin,
    pathname: "/",
    pageTitle: macwall.name,
    headline: `${macwall.name} – ${macwall.tagline}`,
    description: PAGE_DESCRIPTION,
  })

  return (
    <>
      <JsonLd payload={webPageLd} />
      <JsonLd payload={faqPageJsonLd([...HOME_FAQ])} />
      <MacWallMarketingHome
        homePickSlides={homePickSlides}
        gallerySection={<MacWallMarketingGallerySection />}
        walkthroughSection={<MacWallMarketingWalkthroughSection />}
      />
    </>
  )
}
