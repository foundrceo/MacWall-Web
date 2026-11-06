import Link from "next/link"

import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import type { RelatedGuide } from "@/lib/blog/partition-articles"
import { formatTileDateCurated } from "@/lib/blog/tile-copy"
import { blogTilePoster } from "@/lib/blog/tile-media"
import type { BlogArticle } from "@/lib/content/types"
import { blogRelatedSection, blogRelatedTitle } from "@/lib/blog-prose-classes"

/**
 * Related posts (thumbnail tiles) and related Docs/Learn pages (a link list),
 * both picked by shared search terms. The tiles sit far below the fold, so
 * they lazy-load: only the article cover is a high-priority image.
 */
export function BlogRelatedArticles({
  articles,
  guides = [],
}: Readonly<{ articles: BlogArticle[]; guides?: RelatedGuide[] }>) {
  if (articles.length === 0 && guides.length === 0) return null

  return (
    <section
      className={blogRelatedSection}
      aria-labelledby="blog-related-title"
    >
      <h2 id="blog-related-title" className={blogRelatedTitle}>
        Related articles
      </h2>
      {articles.length > 0 ? (
        <ul className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {articles.map((article) => {
            const poster = blogTilePoster(
              article.slug,
              article.category,
              "tile"
            )
            const date = formatTileDateCurated(article.publishedAt)

            return (
              <li key={article.slug} className="min-w-0">
                <Link
                  href={`/blog/${article.slug}`}
                  className="group block min-w-0 no-underline transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-white/[0.04]">
                    <BlogTilePicture src={poster} alt="" variant="curated" />
                  </div>
                  <p className="mt-4 line-clamp-2 text-[15px] leading-snug font-medium tracking-[-0.01em] text-foreground">
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
      ) : null}
      {guides.length > 0 ? (
        <div className="mx-auto mt-10 max-w-[620px]">
          <h3 className="font-sans text-[13px] font-medium tracking-[0.12em] text-marketing-muted uppercase">
            In the help center
          </h3>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {guides.map((guide) => (
              <li key={guide.pathname}>
                <Link
                  href={guide.pathname}
                  className="block py-3.5 no-underline transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block text-[15px] leading-snug font-medium text-foreground">
                    <span className="text-marketing-muted">{guide.kind}: </span>
                    {guide.title}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-muted-foreground">
                    {guide.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
