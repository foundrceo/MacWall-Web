import TikTokLandingHero from "@/components/macwall-marketing/marketing-tiktok-landing"
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

const PAGE_DESCRIPTION = `Live wallpapers for Mac. 4K on the desktop, Lock Screen on ${macwallLockScreenMacOSVersion}. ${macwall.name} Pro is ${macwall.pro.price} once.`

export const metadata: Metadata = {
  title: "Live wallpapers for Mac",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/tiktok") },
  robots: { index: false, follow: false },
  openGraph: {
    title: `${macwall.name} for ${macwall.pro.price}, paid once`,
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
    title: `${macwall.name} for ${macwall.pro.price}, paid once`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

export default function TikTokLandingPage() {
  return <TikTokLandingHero />
}
