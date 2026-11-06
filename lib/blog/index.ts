import { comparisonArticles } from "@/lib/blog/articles/comparisons"
import { featureArticles } from "@/lib/blog/articles/features"
import { guideArticles } from "@/lib/blog/articles/guides"
import { macosArticles } from "@/lib/blog/articles/macos"
import { overviewArticles } from "@/lib/blog/articles/overview"
import { contentWordCount, readMinutesForWords } from "@/lib/content/word-count"
import type { BlogArticle, BlogArticleInput } from "@/lib/content/types"

/**
 * Front-of-blog order: the pillar guides first, everything else by date.
 * These are the posts that own a search intent (changing the wallpaper,
 * wallpaper sizes, the Lock Screen, live wallpapers, macOS wallpapers,
 * dynamic wallpapers), so they get the top slots and the most internal links.
 */
const featuredSlugs = [
  "how-to-change-wallpaper-on-mac",
  "macbook-wallpaper-size",
  "how-to-change-lock-screen-on-mac",
  "how-to-set-live-wallpaper-mac",
  "macos-wallpapers",
  "dynamic-wallpaper-vs-live-wallpaper-mac",
] as const

function featuredRank(slug: string): number {
  const index = featuredSlugs.indexOf(slug as (typeof featuredSlugs)[number])
  return index === -1 ? featuredSlugs.length : index
}

/** Words in a post's body and FAQ, the figure read time is computed from. */
export function blogArticleWordCount(
  article: Pick<BlogArticleInput, "sections" | "faq">
): number {
  return contentWordCount(article.sections, article.faq)
}

function withReadTime(article: BlogArticleInput): BlogArticle {
  return {
    ...article,
    readMinutes: readMinutesForWords(blogArticleWordCount(article)),
  }
}

/** Latest of the published and updated dates (YYYY-MM-DD). */
export function blogArticleLastModified(
  article: Pick<BlogArticleInput, "publishedAt" | "updatedAt">
): string {
  return article.updatedAt && article.updatedAt > article.publishedAt
    ? article.updatedAt
    : article.publishedAt
}

export const blogArticles: BlogArticle[] = [
  ...overviewArticles,
  ...guideArticles,
  ...comparisonArticles,
  ...featureArticles,
  ...macosArticles,
]
  .map(withReadTime)
  .sort((a, b) => {
    const rankDiff = featuredRank(a.slug) - featuredRank(b.slug)
    if (rankDiff !== 0) return rankDiff
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return blogArticles.map((article) => article.slug)
}
