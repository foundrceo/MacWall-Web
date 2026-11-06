import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import {
  landingPageH1,
  landingPageLead,
} from "@/components/macwall-marketing/landing-type"
import { BlogArticleCard } from "@/components/blog/blog-index-cards"
import type { BlogArticle } from "@/lib/content/types"

const BLOG_TITLE_ID = "blog-title"

export function BlogIndexPage({
  articles,
}: Readonly<{ articles: BlogArticle[] }>) {
  return (
    <>
      <MarketingTitleSection aria-labelledby={BLOG_TITLE_ID}>
        <h1 id={BLOG_TITLE_ID} className={landingPageH1}>
          Blog
        </h1>
        <p className={landingPageLead}>
          Guides to wallpapers, the Lock Screen and screen savers on Mac, plus
          comparisons and macOS notes from the MacWall team.
        </p>
      </MarketingTitleSection>
      <MarketingBodySection>
        {articles.length > 0 ? (
          <ul className="grid text-left">
            {articles.map((article, index) => (
              <BlogArticleCard
                key={article.slug}
                article={article}
                priority={index < 4}
              />
            ))}
          </ul>
        ) : null}
      </MarketingBodySection>
    </>
  )
}
