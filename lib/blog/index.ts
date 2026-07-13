import { comparisonArticles } from "@/lib/blog/articles/comparisons"
import { featureArticles } from "@/lib/blog/articles/features"
import { guideArticles } from "@/lib/blog/articles/guides"
import { macosArticles } from "@/lib/blog/articles/macos"
import { wallpaperArticles } from "@/lib/blog/articles/wallpapers"
import type { BlogArticle } from "@/lib/content/types"

export const blogArticles: BlogArticle[] = [
  ...guideArticles,
  ...comparisonArticles,
  ...featureArticles,
  ...macosArticles,
  ...wallpaperArticles,
].sort(
  (a, b) =>
    new Date(b.publishedAt ?? 0).getTime() -
    new Date(a.publishedAt ?? 0).getTime()
)

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return blogArticles.map((article) => article.slug)
}
