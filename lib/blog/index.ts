import { comparisonArticles } from "@/lib/blog/articles/comparisons"
import { featureArticles } from "@/lib/blog/articles/features"
import { guideArticles } from "@/lib/blog/articles/guides"
import { macosArticles } from "@/lib/blog/articles/macos"
import { overviewArticles } from "@/lib/blog/articles/overview"
import { wallpaperArticles } from "@/lib/blog/articles/wallpapers"
import type { BlogArticle } from "@/lib/content/types"

/**
 * Explicit front-of-blog order. The index layout features articles by
 * position (3 heroes, 2 two-ups, 3 latest), so the highest-impact stories
 * are pinned first; everything else falls back to date order.
 */
const featuredSlugs = [
  "what-is-macwall-complete-guide",
  "macwall-performance-zero-overhead-guide",
  "macos-27-beta-live-wallpaper-not-working",
  "macos-27-lock-screen-live-wallpaper",
  "macwall-vs-wallper",
  "macwall-vs-wallspace",
  "live-wallpaper-cpu-usage-mac",
  "best-live-wallpaper-app-mac-2026",
  "macwall-vs-lively-wallpaper",
  "upload-wallpaper-macwall-community",
] as const

function featuredRank(slug: string): number {
  const index = featuredSlugs.indexOf(slug as (typeof featuredSlugs)[number])
  return index === -1 ? featuredSlugs.length : index
}

export const blogArticles: BlogArticle[] = [
  ...overviewArticles,
  ...guideArticles,
  ...comparisonArticles,
  ...featureArticles,
  ...macosArticles,
  ...wallpaperArticles,
].sort((a, b) => {
  const rankDiff = featuredRank(a.slug) - featuredRank(b.slug)
  if (rankDiff !== 0) return rankDiff
  return (
    new Date(b.publishedAt ?? 0).getTime() -
    new Date(a.publishedAt ?? 0).getTime()
  )
})

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return blogArticles.map((article) => article.slug)
}

export { getRelatedBlogArticles } from "@/lib/blog/partition-articles"
