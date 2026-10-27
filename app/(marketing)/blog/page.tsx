import { BlogIndexPage } from "@/components/blog/blog-index-page"
import { blogArticles } from "@/lib/blog"
import { macwall, macwallLockScreenMacOSVersion } from "@/lib/macwall-site"
import { JsonLd } from "@/components/seo/json-ld"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import { collectionPageJsonLd } from "@/lib/seo/json-ld-helpers"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `Guides, app comparisons and macOS news for live wallpapers on Mac, with ${macwallLockScreenMacOSVersion} Lock Screen tips and battery advice from the MacWall team.`

export const metadata: Metadata = {
  ...createSimplePageMetadata({
    title: "Blog: Mac Live Wallpaper Guides and Comparisons",
    description: PAGE_DESCRIPTION,
    path: "/blog",
  }),
  keywords: [
    "mac wallpaper blog",
    "live wallpaper guides mac",
    "macos wallpaper tips",
    macwall.name,
  ],
}

export default function BlogPage() {
  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: "/blog",
          name: "MacWall Blog",
          description: PAGE_DESCRIPTION,
          breadcrumbLabel: "Blog",
          items: blogArticles.map((article) => ({
            name: article.headline,
            pathname: article.pathname,
          })),
        })}
      />
      <BlogIndexPage articles={blogArticles} />
    </>
  )
}
