import MacWallMarketingHome from "@/components/macwall-marketing/marketing-home"
import { macwall } from "@/lib/macwall-site"
import { canonicalSitePath, openGraphImageAbsoluteUrl } from "@/lib/site-url"
import type { Metadata } from "next"

/** ≤160 chars · conversion + Lock Screen hint (paired with curated title). */
const PAGE_DESCRIPTION =
  "Mac live wallpapers behind your Desktop: fresh offline-friendly catalog & Apple Silicon decode. Pro adds Lock Screen motion on Sonoma/Sequoia/newer builds."

const HOME_DOCUMENT_TITLE_ABSOLUTE = `${macwall.name} – ${macwall.tagline}` as const

export const metadata: Metadata = {
  title: { absolute: HOME_DOCUMENT_TITLE_ABSOLUTE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/") },
  keywords: [
    `${macwall.name} download`,
    "best live wallpaper macOS",
    "animated wallpapers Mac Desktop",
    "HD motion backgrounds Mac",
    "Mac live wallpapers",
    "motion desktop background",
  ],
  openGraph: {
    title: HOME_DOCUMENT_TITLE_ABSOLUTE,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/"),
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: 1200,
        height: 630,
        alt: `${macwall.name} – ${macwall.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_DOCUMENT_TITLE_ABSOLUTE,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

export const dynamic = "force-static"

/** MacWall marketing homepage (vendored layout CSS + catalog demo). */
export default function Page() {
  return <MacWallMarketingHome />
}
