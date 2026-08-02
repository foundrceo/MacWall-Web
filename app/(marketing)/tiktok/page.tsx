import TikTokLandingHero from "@/components/macwall-marketing/marketing-tiktok-landing"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import {
  macwall,
  macwallLockScreenMacOSVersion,
} from "@/lib/macwall-site"
import {
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `Get ${macwall.name} Pro for ${macwall.pro.price} — live wallpapers for Mac (macOS 14+) with Lock Screen on ${macwallLockScreenMacOSVersion}. One-time purchase, no subscription.`

export const metadata: Metadata = {
  title: "Live wallpapers for Mac",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/tiktok") },
  robots: { index: false, follow: false },
  openGraph: {
    title: `${macwall.name} — ${macwall.pro.price} one-time`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/tiktok"),
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
    title: `${macwall.name} — ${macwall.pro.price} one-time`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

export default function TikTokLandingPage() {
  return (
    <div className="marketing-page">
      <MarketingSiteChrome />
      <main id="main-content" className="marketing-main-offset">
        <TikTokLandingHero />
      </main>
      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
