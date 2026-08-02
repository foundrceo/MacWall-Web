import type { Metadata } from "next"

import MarketingOpenWallpaper from "@/components/macwall-marketing/marketing-open-wallpaper"
import { macwall, macwallOpenWallpaperPath } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"

export const metadata: Metadata = {
  title: `Open in ${macwall.name}`,
  description: `Open a live wallpaper in the ${macwall.name} Mac app.`,
  alternates: { canonical: canonicalSitePath(macwallOpenWallpaperPath) },
  robots: { index: false, follow: false },
}

export default function OpenWallpaperPage() {
  return <MarketingOpenWallpaper />
}
