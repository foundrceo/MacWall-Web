import "@/components/blog/blog-newsroom.css"
import { BlogIndexPage } from "@/components/blog/blog-index-page"
import { blogArticles } from "@/lib/blog"
import { macwall } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_DESCRIPTION =
  "Guides, comparisons, and tips for live wallpapers on Mac. Learn why MacWall is the smoothest native wallpaper app for macOS."

export const metadata: Metadata = {
  title: "Blog",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/blog") },
  keywords: [
    "mac wallpaper blog",
    "live wallpaper guides mac",
    "macos wallpaper tips",
    macwall.name,
  ],
  openGraph: {
    title: `${macwall.name} – Blog`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/blog"),
    type: "website",
  },
}

export const dynamic = "force-static"

export default function BlogPage() {
  return <BlogIndexPage articles={blogArticles} />
}
