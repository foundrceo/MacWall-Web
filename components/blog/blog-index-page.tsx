import { BlogArticleCard } from "@/components/blog/blog-index-cards"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import type { BlogArticle } from "@/lib/content/types"

const BLOG_TITLE_ID = "blog-title"

export function BlogIndexPage({
  articles,
}: Readonly<{ articles: BlogArticle[] }>) {
  return (
    <div className="marketing-page">
      <MarketingSiteChrome />

      <a href="#main-content" className="marketing-skip-link">
        Skip to main content
      </a>

      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby={BLOG_TITLE_ID}
        className="marketing-main"
      >
        <header className="marketing-page-header mx-auto max-w-xl text-center">
          <h1
            id={BLOG_TITLE_ID}
            className="text-[32px] leading-[1.12] font-normal tracking-tight text-white sm:text-[40px] lg:text-[48px]"
          >
            Blog
          </h1>
          <p className="mx-auto mt-4 max-w-[34rem] font-sans text-[16px] leading-6 text-landing-muted">
            Guides, release notes, and ideas from the MacWall team on live wallpapers,
            macOS tips, and what we are building next.
          </p>
        </header>

        {articles.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {articles.map((article, index) => (
              <BlogArticleCard
                key={article.slug}
                article={article}
                priority={index < 6}
              />
            ))}
          </ul>
        ) : null}
      </main>

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
