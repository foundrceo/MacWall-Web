import Link from "next/link"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { blogTileEyebrow, formatTileDateAbsolute } from "@/lib/blog/tile-copy"
import { blogTilePoster } from "@/lib/blog/tile-media"
import type { BlogArticle } from "@/lib/content/types"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"

function BlogArticleCard({
  article,
  featured = false,
  priority = false,
}: Readonly<{
  article: BlogArticle
  featured?: boolean
  priority?: boolean
}>) {
  const href = `/blog/${article.slug}`
  const poster = blogTilePoster(article.slug, article.category, featured ? "hero" : "tile")
  const date = formatTileDateAbsolute(article.publishedAt)

  if (featured) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-surface">
        <Link href={href} className="group block">
          <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
            <div className="h-full w-full transition duration-300 group-hover:scale-[1.02]">
              <BlogTilePicture
                src={poster}
                alt=""
                variant="hero"
                priority={priority}
              />
            </div>
          </div>
          <div className="space-y-3 p-6 md:p-8">
            <p className="text-[12px] font-medium tracking-[0.08em] text-marketing-muted uppercase">
              {blogTileEyebrow(article.category)}
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-foreground">
              {article.title}
            </h2>
            {article.description ? (
              <p className="max-w-2xl text-[16px] leading-[1.55] text-foreground/70">
                {article.description}
              </p>
            ) : null}
            {date ? (
              <time
                dateTime={article.publishedAt}
                className="block text-[13px] text-marketing-muted"
              >
                {date}
              </time>
            ) : null}
          </div>
        </Link>
      </article>
    )
  }

  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:border-foreground/20"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
          <div className="h-full w-full transition duration-300 group-hover:scale-[1.02] [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
            <BlogTilePicture
              src={poster}
              alt=""
              variant="tile"
              priority={priority}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-[11px] font-medium tracking-[0.08em] text-marketing-muted uppercase">
            {blogTileEyebrow(article.category)}
          </p>
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
            {article.title}
          </h3>
          {date ? (
            <time
              dateTime={article.publishedAt}
              className="mt-auto text-[12px] text-marketing-muted"
            >
              {date}
            </time>
          ) : null}
        </div>
      </Link>
    </li>
  )
}

export function BlogIndexPage({
  articles,
}: Readonly<{ articles: BlogArticle[] }>) {
  const [featured, ...rest] = articles

  return (
    <div className={MARKETING_PAGE_CLASS}>
      <MarketingSiteChrome />

      <main
        id="blog-main"
        className={cn(
          "mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24",
          MARKETING_MAIN_OFFSET_CLASS,
          "pt-12 md:pt-16"
        )}
      >
        <header className="mb-10 text-center md:mb-14">
          <p className="text-[15px] text-marketing-muted">Blog</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,2.75rem)] font-normal leading-[1.12] tracking-[-0.02em] text-foreground">
            MacWall Blog
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-[1.55] text-muted-foreground">
            Guides, comparisons, and macOS news for live wallpapers on Mac.
          </p>
        </header>

        {featured ? (
          <section aria-label="Featured article" className="mb-12 md:mb-16">
            <BlogArticleCard article={featured} featured priority />
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section aria-labelledby="latest-articles-title">
            <h2
              id="latest-articles-title"
              className="mb-6 text-[20px] font-semibold tracking-[-0.02em] text-foreground md:text-[24px]"
            >
              Latest
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, index) => (
                <BlogArticleCard
                  key={article.slug}
                  article={article}
                  priority={index < 3}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
