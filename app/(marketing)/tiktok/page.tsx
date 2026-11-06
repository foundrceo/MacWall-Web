import TikTokLandingHero from "@/components/macwall-marketing/marketing-tiktok-landing"
import { macwall, macwallLockScreenMacOSVersion } from "@/lib/macwall-site"
import { formatPriceCents, proPriceFor } from "@/lib/pricing/sale-aware-price"
import {
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

/** Sale-aware: the sale-boundary cron re-renders every page when a price changes. */
export function generateMetadata(): Metadata {
  const price = formatPriceCents(proPriceFor("default").currentCents)
  const PAGE_DESCRIPTION = `Live wallpapers for Mac. 4K on the desktop, Lock Screen on ${macwallLockScreenMacOSVersion}. ${macwall.name} Pro is ${price} once.`
  return {
    title: "Live wallpapers for Mac",
    description: PAGE_DESCRIPTION,
    alternates: { canonical: canonicalSitePath("/tiktok") },
    robots: { index: false, follow: false },
    openGraph: {
      title: `${macwall.name} for ${price}, paid once`,
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
      title: `${macwall.name} for ${price}, paid once`,
      description: PAGE_DESCRIPTION,
      images: [openGraphImageAbsoluteUrl()],
    },
  }
}

export default function TikTokLandingPage() {
  return <TikTokLandingHero />
}
