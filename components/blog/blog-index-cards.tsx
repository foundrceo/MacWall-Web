import { CalendarIcon } from "lucide-react"
import Link from "next/link"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import { formatTileDateCurated } from "@/lib/blog/tile-copy"
import { blogTilePoster } from "@/lib/blog/tile-media"
import { BLOG_CATEGORY_LABELS, type BlogArticle } from "@/lib/content/types"

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
  const category = BLOG_CATEGORY_LABELS[article.category]

  return (
    <li className="min-w-0">
      <Link
        href={href}
        className="grid grid-cols-1 gap-4 bg-card/50 px-6 py-6 transition-colors hover:bg-card/80 md:grid-cols-3 xl:grid-cols-4"
      >
        <div className="order-2 flex h-full flex-col justify-between gap-4 md:order-1 md:col-span-2 xl:col-span-3">
          <div>
            <h2 className="font-medium text-lg md:text-xl lg:text-2xl">
              {article.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-base text-muted-foreground">
              {article.excerpt || article.description}
            </p>
          </div>
          <div className="inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{category}</span>
            {date ? (
              <>
                <span aria-hidden>•</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="size-4" />
                  <time dateTime={article.publishedAt}>{date}</time>
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="relative order-1 aspect-[16/10] overflow-hidden rounded-lg bg-card md:order-2">
          <BlogTilePicture
            src={poster}
            alt=""
            variant="curated"
            priority={priority}
          />
        </div>
      </Link>
    </li>
  )
}
