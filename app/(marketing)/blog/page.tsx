import { BlogIndexPage } from "@/components/blog/blog-index-page"
import { blogArticleLastModified, blogArticles } from "@/lib/blog"
import { macwallLockScreenMacOSVersion } from "@/lib/macwall-site"
import { JsonLd } from "@/components/seo/json-ld"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import { collectionPageJsonLd } from "@/lib/seo/json-ld-helpers"
import type { Metadata } from "next"

const PAGE_DESCRIPTION = `Guides, app comparisons and macOS news for live wallpapers on Mac, with ${macwallLockScreenMacOSVersion} Lock Screen tips and battery advice from the MacWall team.`

export const metadata: Metadata = createSimplePageMetadata({
  title: "Blog: Mac Live Wallpaper Guides and Comparisons",
  description: PAGE_DESCRIPTION,
  path: "/blog",
})

/** The newest publish or update date across the posts. */
function blogLastModified(): string | undefined {
  return blogArticles.map(blogArticleLastModified).sort().at(-1)
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
          dateModified: blogLastModified(),
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
