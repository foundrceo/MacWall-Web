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
          "Maker of MacWall, the native macOS app for 4K live motion wallpapers on Mac.",
        sameAs: [...MACWALL_SAME_AS],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: origin,
        name: `${macwall.name} App`,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        description:
          "Native macOS app for motion wallpapers behind your windows: curated catalog search and filters, your own clips, multi-display playback, and optional MacWall Pro for Lock Screen clips where Apple allows.",
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        name: macwall.name,
        alternateName: [...MACWALL_ALTERNATE_NAMES],
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Desktop Wallpaper / Live Wallpaper",
        operatingSystem: "macOS 14 Sonoma, macOS 15 Sequoia, and newer",
        description: `${macwall.name} is a macOS app that brings live motion wallpapers and daily catalog updates to Intel and Apple Silicon Macs running recent Sonoma, Ventura, and Sequoia builds where playback is supported; features vary by OS version.`,
        url: origin,
        image: logoUrl,
        screenshot: `${origin}/og.jpg`,
        downloadUrl: `${origin}/download`,
        installUrl: `${origin}/download`,
        softwareVersion: "1.0",
        featureList: [
          "4K live motion wallpapers for the Mac desktop",
          "Curated daily catalog with search and filters",
          "Import and play your own video clips",
          "Multi-display playback with hardware decoding",
          "Auto-pause on battery and full screen",
          "MacWall Pro: Lock Screen live wallpaper where macOS allows",
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
