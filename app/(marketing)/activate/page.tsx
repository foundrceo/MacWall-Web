import type { Metadata } from "next"

import MarketingActivateRedirect from "@/components/macwall-marketing/marketing-activate-redirect"
import { macwall, macwallActivatePath } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Activate MacWall Pro",
  description: `Open ${macwall.name} and activate Pro instantly after checkout.`,
  alternates: { canonical: canonicalSitePath(macwallActivatePath) },
  robots: { index: false, follow: false },
}

export default function ActivatePage() {
  return <MarketingActivateRedirect />
}
