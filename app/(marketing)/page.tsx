import MacWallMarketingHome from "@/components/macwall-marketing/marketing-home"
import { macwall } from "@/lib/macwall-site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `${macwall.name} — ${macwall.tagline}`,
  description:
    "Live video wallpapers for Mac: curated cloud catalog with search and filters, your own clips, multi-display playback, and MacWall Pro for Lock Screen video.",
  alternates: { canonical: macwall.website },
  openGraph: {
    title: `${macwall.name} — ${macwall.tagline}`,
    description:
      "Live video wallpapers for Mac. Curated catalog, multi-display playback, and MacWall Pro for Lock Screen video.",
    url: macwall.website,
    type: "website",
    images: [{ url: "/macwall-app-icon.png", width: 512, height: 512 }],
  },
}

export const dynamic = "force-static"

/** MacWall marketing homepage (vendored layout CSS + catalog demo). */
export default function Page() {
  return <MacWallMarketingHome />
}
