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

/** ≤125 chars so social cards never truncate (paired with curated title). */
const PAGE_DESCRIPTION =
  "Cinematic 4K live wallpapers for Mac with near-zero battery impact. Lock Screen motion with Pro. One-time $7.99, no subs."

const HOME_DOCUMENT_TITLE_ABSOLUTE =
  `${macwall.name} – ${macwall.tagline}` as const

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
      "MacWall supports M-series and Intel Macs running recent Sonoma, Ventura, and Sequoia builds, with automatic pause on battery and full screen.",
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
