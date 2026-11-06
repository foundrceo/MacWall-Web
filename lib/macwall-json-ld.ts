import { curatedChangelogReleases } from "@/lib/changelog/curated-releases"
import { CHANGELOG_FIRST_PUBLIC_VERSION } from "@/lib/changelog/page-copy"
import type { PricingRegion } from "@/lib/license/offers.shared"
import {
  macwall,
  macwallAppIconPath,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallMinimumMacOSRequirementOrLater,
} from "@/lib/macwall-site"
import {
  offerPackLabel,
  offersFor,
  schemaOfferPricing,
  type SaleAwarePrice,
} from "@/lib/pricing/sale-aware-price"
import { siteEntityIds } from "@/lib/seo/json-ld-helpers"
import { openGraphImagePath } from "@/lib/site-url"

/**
 * The site's name is "MacWall", the same as og:site_name and every title
 * suffix. The alternate names separate the app from the unrelated "MACWALL"
 * retaining-wall product; a tagline is not a name, so none is listed.
 */
const MACWALL_ALTERNATE_NAMES = ["MacWall App", "macwall.app"] as const

/** MacWall's YouTube channel (@MacWallApp), which links back to macwall.app. */
const MACWALL_YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/channel/UC0AggWIjNCI-iCQC1NNHdeA"

/**
 * Stable brand profiles only. The Discord invite is left out: invites expire
 * and are not a profile of the brand.
 */
const MACWALL_SAME_AS = [
  macwall.reelRefundInstagramURL,
  macwall.reelRefundTiktokURL,
  MACWALL_YOUTUBE_CHANNEL_URL,
] as const

/** Date of the first public release, v1.3, from the curated changelog. */
const FIRST_PUBLIC_RELEASE_ISO = curatedChangelogReleases
  .find((release) => release.version === CHANGELOG_FIRST_PUBLIC_VERSION)
  ?.date.slice(0, 10)

const INDIA = { "@type": "Country", name: "IN" } as const

/**
 * What the app does, checked against the shipping 4.1.0 source: the trial
 * (SupportAssistCatalog.swift), power settings (SettingsPowerPane.swift),
 * imports (movie types only) and Music Sync (MusicSyncDesktop.swift).
 */
const MACWALL_FEATURE_LIST = [
  "Live video wallpapers for the Mac desktop, up to 4K",
  `Curated cloud catalog with search, filters and ${macwall.categories.length} categories`,
  "Free 24-hour trial of the full catalog and the Lock Screen, once per Mac, with no card",
  "Import your own MP4 and MOV videos with Pro",
  "Multi-display playback: the same wallpaper on every display, or a different one on each",
  "Menu bar control to pause, resume and switch wallpapers",
  "Pauses behind full-screen apps by default; optional pause on battery, lower quality on battery and pause when the Mac is busy",
  "Shuffle, and a Day Schedule that changes the wallpaper through the day",
  "Music Sync: visuals in the album cover's colors for Apple Music and Spotify",
  `MacWall Pro: live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}`,
] as const

/**
 * One Offer per license pack for a pricing region, at the price checkout
 * charges at `now`: while a sale runs, the sale price with its last day as
 * `priceValidUntil` and the regular price as the strikethrough price. India
 * has its own USD prices; everyone else pays the default ones.
 */
function licenseOffers(
  region: PricingRegion,
  origin: string,
  sellerId: string,
  now: number
) {
  return offersFor(region, now).map((price: SaleAwarePrice) => ({
    "@type": "Offer",
    name: `${macwall.name} ${offerPackLabel(price)} permanent license${region === "india" ? " (India)" : ""}`,
    description: `One-time payment for a permanent MacWall Pro license on up to ${price.macs} Macs.`,
    ...schemaOfferPricing(price),
    ...(region === "india"
      ? { eligibleRegion: INDIA }
      : { ineligibleRegion: INDIA }),
    availability: "https://schema.org/OnlineOnly",
    url: `${origin}/pricing`,
    seller: { "@id": sellerId },
  }))
}

/**
 * Single shared JSON-LD graph, rendered by the root layout on every page. No
 * fabricated ratings, review counts or download stats. Prices follow the sale
 * calendar at render time; /api/cron/sale-boundary revalidates the root
 * layout when a sale starts or ends, so the Offers flip with the banner.
 */
export function macwallSchemaGraph(
  canonicalOrigin: string,
  now: number = Date.now()
) {
  const origin = canonicalOrigin.replace(/\/$/, "")
  const logoUrl = `${origin}${macwallAppIconPath}`
  const ids = siteEntityIds(origin)

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ids.organization,
        name: macwall.name,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        url: origin,
        logo: {
          "@type": "ImageObject",
          "@id": ids.logo,
          url: logoUrl,
          contentUrl: logoUrl,
          width: 1024,
          height: 1024,
          caption: macwall.name,
        },
        image: { "@id": ids.logo },
        email: macwall.supportEmail,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: macwall.supportEmail,
          availableLanguage: ["English"],
        },
        description: `Maker of MacWall, the native macOS app for live video wallpapers on the Mac desktop, with menu bar control and Lock Screen motion on ${macwallLockScreenMacOSVersion}.`,
        sameAs: [...MACWALL_SAME_AS],
      },
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: origin,
        name: macwall.name,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        description: `Native macOS app for live video wallpapers behind your windows: curated cloud catalog with search and filters, Pro video imports, multi-display playback, menu bar control, and MacWall Pro for Lock Screen and Screen Saver motion on ${macwallLockScreenMacOSVersion}.`,
        publisher: { "@id": ids.organization },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": ids.softwareApplication,
        name: macwall.name,
        alternateName: ["MacWall App", "MacWall Live Wallpaper"],
        identifier: macwall.bundleIdentifier,
        applicationCategory: "DesktopEnhancementApplication",
        applicationSubCategory: "Desktop Wallpaper / Live Wallpaper",
        operatingSystem: "macOS",
        softwareRequirements: macwallMinimumMacOSRequirementOrLater,
        description: `${macwall.name} is a native macOS app that brings live video wallpapers and a curated cloud catalog to Apple Silicon and Intel Macs running ${macwallMinimumMacOSVersion} or later, including live Lock Screen and Screen Saver wallpapers on ${macwallLockScreenMacOSVersion}+.`,
        url: origin,
        image: logoUrl,
        screenshot: `${origin}${openGraphImagePath}`,
        // The page, not /download/latest: that route counts every fetch as a
        // download, and crawlers follow schema URLs.
        downloadUrl: `${origin}/download`,
        installUrl: `${origin}/download`,
        softwareVersion: macwall.currentVersion,
        ...(FIRST_PUBLIC_RELEASE_ISO
          ? { datePublished: FIRST_PUBLIC_RELEASE_ISO }
          : {}),
        dateModified: macwall.currentVersionReleasedIso,
        releaseNotes: `${origin}/changelog`,
        softwareHelp: {
          "@type": "WebPage",
          url: `${origin}/docs`,
        },
        featureList: [...MACWALL_FEATURE_LIST],
        author: { "@id": ids.organization },
        publisher: { "@id": ids.organization },
        isPartOf: { "@id": ids.website },
        offers: [
          {
            "@type": "Offer",
            name: `${macwall.name} 24-hour free trial`,
            description:
              "The full catalog and the Lock Screen free for 24 hours, once per Mac, with no card. Importing your own videos needs Pro.",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/OnlineOnly",
            url: `${origin}/download`,
            seller: { "@id": ids.organization },
          },
          ...licenseOffers("default", origin, ids.organization, now),
          ...licenseOffers("india", origin, ids.organization, now),
        ],
      },
    ],
  } as const
}
