import MacWallMarketingHome from "@/components/macwall-marketing/marketing-home"
import { macwall } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION =
  "Live motion Mac wallpapers behind your Desktop: searchable catalog for fresh clips, imports, tuned multi-display playback, and MacWall Pro for Lock Screen live wallpaper where recent Sonoma, Ventura, and Sequoia builds allow."

export const metadata: Metadata = {
  title: `${macwall.name} — ${macwall.tagline}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/") },
  keywords: [
    `${macwall.name} download`,
    "best live wallpaper macOS",
    "animated wallpapers Mac Desktop",
    "HD motion backgrounds Mac",
  ],
  openGraph: {
    title: `${macwall.name} — ${macwall.tagline}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} — ${macwall.tagline}`,
    description: PAGE_DESCRIPTION,
  },
}

export const dynamic = "force-static"

/** MacWall marketing homepage (vendored layout CSS + catalog demo). */
export default function Page() {
  return <MacWallMarketingHome />
}
