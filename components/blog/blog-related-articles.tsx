import { BlogArticleCard } from "@/components/blog/blog-index-cards"
import type { BlogArticle } from "@/lib/content/types"
import { blogRelatedSection, blogRelatedTitle } from "@/lib/blog-prose-classes"

export function BlogRelatedArticles({
  articles,
}: Readonly<{ articles: BlogArticle[] }>) {
  if (articles.length === 0) return null

  return (
    <section
      className={blogRelatedSection}
      aria-labelledby="blog-related-title"
    >
      <h2 id="blog-related-title" className={blogRelatedTitle}>
        Related articles
      </h2>
      <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {articles.map((article, index) => (
          <BlogArticleCard
            key={article.slug}
            article={article}
            priority={index < 3}
          />
        ))}
      </ul>
    </section>
  )
}
