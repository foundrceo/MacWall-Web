import { macwall, macwallAppIconPath } from "@/lib/macwall-site"

/**
 * Alternate names help Google resolve the "MacWall" entity to this software app
 * rather than the unrelated "MACWALL" retaining-wall product.
 */
const MACWALL_ALTERNATE_NAMES = [
  "MacWall App",
  "MacWall - Live Wallpapers for Mac",
  "MacWall Live Wallpaper",
] as const

/** Public profiles that anchor the entity in Google's Knowledge Graph. */
const MACWALL_SAME_AS = [
  macwall.reelRefundInstagramURL,
  macwall.reelRefundTiktokURL,
  macwall.discordInvite,
] as const

/** Single shared JSON-LD graph — no fabricated ratings, review counts, or download stats. */
export function macwallSchemaGraph(canonicalOrigin: string) {
  const origin = canonicalOrigin.replace(/\/$/, "")
  const logoUrl = `${origin}${macwallAppIconPath}`
  const orgId = `${origin}/#organization`
  const siteId = `${origin}/#website`
  const appId = `${origin}/#softwareapplication`

  const proPriceUsd = macwall.pro.price.replace(/[^\d.]/g, "") || "7.99"

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: `${macwall.name} App`,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        url: origin,
        logo: logoUrl,
        image: logoUrl,
        email: macwall.supportEmail,
        description:
          "Maker of MacWall, the native macOS app for live video wallpapers on the Mac desktop, with menu bar control and Lock Screen motion on macOS 26 Tahoe.",
        sameAs: [...MACWALL_SAME_AS],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: origin,
        name: `${macwall.name} App`,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        description:
          "Native macOS app for live video wallpapers behind your windows: curated cloud catalog with search and filters, your own clips, multi-display playback, menu bar control, and optional MacWall Pro for Lock Screen and Screen Saver motion on macOS 26 Tahoe.",
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        name: macwall.name,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Desktop Wallpaper / Live Wallpaper",
        operatingSystem:
          "macOS 14 Sonoma, macOS 15 Sequoia, macOS 26 Tahoe, and newer",
        description: `${macwall.name} is a native macOS app that brings live video wallpapers and a curated cloud catalog to Apple Silicon and Intel Macs running macOS 14 Sonoma or later. Live Lock Screen and Screen Saver wallpapers require macOS 26 Tahoe; features vary by OS version.`,
        url: origin,
        image: logoUrl,
        screenshot: `${origin}/og.jpg`,
        downloadUrl: `${origin}/download`,
        installUrl: `${origin}/download`,
        softwareVersion: "1.7",
        featureList: [
          "Live video wallpapers for the Mac desktop, up to 4K",
          "Curated cloud catalog with search, filters, and 9 categories",
          "Import and play your own MP4 and MOV clips",
          "Multi-display playback, synced or solo, with hardware decoding",
          "Menu bar control and auto-pause on battery, full screen, and high CPU",
          "Music Sync: album-art gradients from Apple Music and Spotify",
          "MacWall Pro: live Lock Screen and Screen Saver on macOS 26 Tahoe",
        ],
        publisher: { "@id": orgId },
        isPartOf: { "@id": siteId },
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            price: proPriceUsd,
            priceCurrency: "USD",
            availability: "https://schema.org/OnlineOnly",
            url: `${origin}/pricing`,
          },
        ],
      },
    ],
  } as const
}
