import { macwall, macwallAppIconPath } from "@/lib/macwall-site"

/** Single shared JSON-LD graph — no fabricated ratings, review counts, or download stats. */
export function macwallSchemaGraph(canonicalOrigin: string) {
  const origin = canonicalOrigin.replace(/\/$/, "")
  const logoUrl = `${origin}${macwallAppIconPath}`
  const orgId = `${origin}/#organization`
  const siteId = `${origin}/#website`
  const appId = `${origin}/#softwareapplication`

  const proPriceUsd = macwall.pro.price.replace(/[^\d.]/g, "") || "9.99"

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: macwall.name,
        url: origin,
        logo: logoUrl,
        email: macwall.supportEmail,
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: origin,
        name: macwall.name,
        description:
          "Native macOS app for motion wallpapers behind your windows: curated catalog search and filters, your own clips, multi-display playback, and optional MacWall Pro for Lock Screen clips where Apple allows.",
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        name: macwall.name,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "macOS",
        description:
          `${macwall.name} brings live motion wallpapers and daily catalog updates to Intel and Apple Silicon Macs running recent Sonoma, Ventura, and Sequoia builds where playback is supported; features vary by OS version.`,
        url: origin,
        image: logoUrl,
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
