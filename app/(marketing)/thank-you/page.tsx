import MacWallMarketingThankYouPage from "@/components/macwall-marketing/marketing-thank-you"
import { macwall, macwallThankYouPath } from "@/lib/macwall-site"
import {
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `Your ${macwall.name} Pro purchase is complete. Check your inbox for your license key, then activate MacWall on up to ${macwall.maxLicensedMacs} personal Macs and unlock Lock Screen wallpapers.`

export const metadata: Metadata = {
  title: "Thank you",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath(macwallThankYouPath) },
  openGraph: {
    title: `${macwall.name} App – Thank you`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath(macwallThankYouPath),
    siteName: `${macwall.name} App`,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} App`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} App – Thank you`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export const dynamic = "force-static"

export default function ThankYouPage() {
  return <MacWallMarketingThankYouPage />
}
