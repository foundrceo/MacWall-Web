import { BlogIndexPage } from "@/components/blog/blog-index-page"
import { blogArticles } from "@/lib/blog"
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

const PAGE_DESCRIPTION =
  `Guides, comparisons, and macOS news for live wallpapers on Mac. ${macwallLockScreenMacOSVersion} Lock Screen tips, app comparisons, battery advice, and more from the MacWall team.`

export const metadata: Metadata = {
  title: "Blog: Mac Live Wallpaper Guides, Comparisons & News",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/blog") },
  keywords: [
    "mac wallpaper blog",
    "live wallpaper guides mac",
    "macos wallpaper tips",
    macwall.name,
  ],
  openGraph: {
    title: `${macwall.name} App – Blog`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/blog"),
    siteName: `${macwall.name} App`,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} App – Blog`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} App – Blog`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}


export default function BlogPage() {
  return <BlogIndexPage articles={blogArticles} />
}
