import Link from "next/link"

import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import { formatTileDateCurated } from "@/lib/blog/tile-copy"
import { blogTilePoster } from "@/lib/blog/tile-media"
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
      <ul className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {articles.map((article, index) => {
          const poster = blogTilePoster(article.slug, article.category, "tile")
          const date = formatTileDateCurated(article.publishedAt)

          return (
            <li key={article.slug} className="min-w-0">
              <Link
                href={`/blog/${article.slug}`}
                className="group block min-w-0 no-underline outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-white/[0.04]">
                  <BlogTilePicture
                    src={poster}
                    alt=""
                    variant="curated"
                    priority={index < 3}
                  />
                </div>
                <p className="mt-4 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em] text-foreground">
                  {article.headline}
                </p>
                {date ? (
                  <time
                    dateTime={article.publishedAt}
                    className="mt-1.5 block text-[13px] leading-none text-muted-foreground"
                  >
                    {date}
                  </time>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
