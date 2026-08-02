import Link from "next/link"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import { formatTileDateCurated } from "@/lib/blog/tile-copy"
import { blogTilePoster } from "@/lib/blog/tile-media"
import type { BlogArticle } from "@/lib/content/types"

/** Curated tile: landscape image with title and date below. */
export function BlogArticleCard({
  article,
  priority = false,
}: Readonly<{
  article: BlogArticle
  priority?: boolean
}>) {
  const href = `/blog/${article.slug}`
  const poster = blogTilePoster(article.slug, article.category, "tile")
  const date = formatTileDateCurated(article.publishedAt)
  const metaLabel = date || article.category

  return (
    <li className="min-w-0 w-full">
      <Link
        href={href}
        className="group block w-full cursor-pointer outline-none no-underline transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-0.5 hover:scale-[1.008] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
          <BlogTilePicture
            src={poster}
            alt=""
            variant="curated"
            priority={priority}
          />
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <p className="line-clamp-2 font-sans text-[15px] font-medium leading-snug tracking-[-0.01em] text-foreground">
            {article.title}
          </p>
          {metaLabel ? (
            date ? (
              <time
                dateTime={article.publishedAt}
                className="mt-1.5 text-[13px] leading-none tracking-[0.01em] text-muted-foreground"
              >
                {date}
              </time>
            ) : (
              <p className="mt-1.5 text-[13px] leading-none tracking-[0.01em] text-muted-foreground">
                {article.category}
              </p>
            )
          ) : null}
        </div>
      </Link>
    </li>
  )
}
