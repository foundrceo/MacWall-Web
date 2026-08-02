import { blogArticles, getBlogArticle } from "@/lib/blog"
import type { BlogArticle } from "@/lib/content/types"

/** Related articles: same category first, then the rest of the index order. */
export function getRelatedBlogArticles(
  currentSlug: string,
  limit = 3
): BlogArticle[] {
  const current = getBlogArticle(currentSlug)
  if (!current) return []

  const rest = blogArticles.filter((article) => article.slug !== currentSlug)
  const sameCategory = rest.filter(
    (article) => article.category === current.category
  )
  const otherCategories = rest.filter(
    (article) => article.category !== current.category
  )

  return [...sameCategory, ...otherCategories].slice(0, limit)
}
