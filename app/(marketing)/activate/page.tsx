import type { Metadata } from "next"

import MarketingActivateRedirect from "@/components/macwall-marketing/marketing-activate-redirect"
import { macwall, macwallActivatePath } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Activate MacWall Pro",
  description: `Open ${macwall.name} and activate Pro instantly after checkout.`,
  alternates: { canonical: canonicalSitePath(macwallActivatePath) },
  robots: { index: false, follow: false },
  // License keys may appear in the URL — never leak via Referer.
  referrer: "no-referrer",
}

export default function ActivatePage() {
  return <MarketingActivateRedirect />
}
