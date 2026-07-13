import MacWallMarketingThankYouPage from "@/components/macwall-marketing/marketing-thank-you"
import { macwallThankYouPath } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your MacWall Pro purchase is complete.",
  alternates: { canonical: canonicalSitePath(macwallThankYouPath) },
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
