import Link from "next/link"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { formatTileDateCurated } from "@/lib/blog/tile-copy"
import { blogTilePoster } from "@/lib/blog/tile-media"
import type { BlogArticle } from "@/lib/content/types"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"

/** Curated tile: image full-bleeds card; date + title layered on top. */
function BlogArticleCard({
  article,
  priority = false,
}: Readonly<{
  article: BlogArticle
  priority?: boolean
}>) {
  const href = `/blog/${article.slug}`
  const poster = blogTilePoster(article.slug, article.category, "tile")
  const date = formatTileDateCurated(article.publishedAt)

  return (
    <li className="min-w-0 w-full">
      <Link
        href={href}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border-0 bg-black outline-none ring-0 no-underline transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-0.5 hover:scale-[1.008]"
      >
        <div className="absolute inset-0">
          <BlogTilePicture
            src={poster}
            alt=""
            variant="curated"
            priority={priority}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 bg-gradient-to-t from-black from-40% via-black/85 to-transparent px-4 pb-4 pt-20">
          {date ? (
            <time
              dateTime={article.publishedAt}
              className="text-[14px] leading-5 text-white/60"
            >
              {date}
            </time>
          ) : null}
          <p className="line-clamp-2 text-[14px] leading-5 text-white">
            {article.title}
          </p>
        </div>
      </Link>
    </li>
  )
}

export function BlogIndexPage({
  articles,
}: Readonly<{ articles: BlogArticle[] }>) {
  return (
    <div className={MARKETING_PAGE_CLASS}>
      <MarketingSiteChrome />

      <main
        id="blog-main"
        className={cn(
          "mx-auto w-full max-w-[1360px] px-6 pb-20 sm:px-8 md:pb-24 lg:px-10",
          MARKETING_MAIN_OFFSET_CLASS,
          "pt-14 md:pt-16"
        )}
      >
        <header className="mb-10 max-w-xl text-left md:mb-14">
          <h1 className="text-[2.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
            Blog
          </h1>
          <p className="mt-2 text-base leading-6 tracking-[0.01em] text-marketing-muted">
            Written words about live wallpapers on Mac.
          </p>
        </header>

        {articles.length > 0 ? (
          <ul className="grid grid-cols-1 items-start gap-4 min-[810px]:[grid-template-columns:repeat(auto-fill,minmax(min(380px,100%),1fr))]">
            {articles.map((article, index) => (
              <BlogArticleCard
                key={article.slug}
                article={article}
                priority={index < 8}
              />
            ))}
          </ul>
        ) : null}
      </main>

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
