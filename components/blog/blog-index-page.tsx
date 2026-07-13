import MacWallMarketingAnnouncementBar from "@/components/macwall-marketing/marketing-announcement-bar"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import {
  NewsroomHeroTile,
  NewsroomListTile,
  NewsroomThreeUpTile,
  NewsroomTwoUpTile,
} from "@/components/blog/newsroom-tiles"
import type { BlogArticle } from "@/lib/content/types"

const LATEST_TILE_COUNT = 3

function partitionArticles(articles: BlogArticle[]) {
  const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, ...more] = articles
  return {
    takeoverHeroes: [a0, a1, a2].filter(Boolean) as BlogArticle[],
    takeoverTwoUp: a3 as BlogArticle | undefined,
    takeoverTwoUpBleed: a4 as BlogArticle | undefined,
    latest: [a5, a6, a7]
      .filter(Boolean)
      .slice(0, LATEST_TILE_COUNT) as BlogArticle[],
    archive: [a8, a9, ...more].filter(Boolean) as BlogArticle[],
  }
}

export function BlogIndexPage({
  articles,
}: Readonly<{ articles: BlogArticle[] }>) {
  const { takeoverHeroes, takeoverTwoUp, takeoverTwoUpBleed, latest, archive } =
    partitionArticles(articles)

  return (
    <div className="MacWallMarketingPage MacWallNewsroomPage">
      <MacWallMarketingHeader variant="light" />
      <MacWallMarketingAnnouncementBar />

      <main id="blog-main" className="MacWallNewsroomMain">
        {takeoverHeroes.length > 0 ? (
          <section
            className="MacWallNewsroomSection takeover theme-dark"
            aria-label="Featured articles"
          >
            <header className="MacWallNewsroomPageHead">
              <h1 className="MacWallNewsroomPageTitle">MacWall Blog</h1>
              <p className="MacWallNewsroomPageLead">
                Stay up to date with the latest articles from MacWall Blog.
              </p>
            </header>
            <ul role="list" className="takeover-content section-tiles">
              {takeoverHeroes.map((article, index) => (
                <NewsroomHeroTile
                  key={article.slug}
                  article={article}
                  reversed={index === 1}
                  priority={index === 0}
                  timestampStyle={index === 0 ? "relative" : "absolute"}
                  hideTimestampIcon={index !== 0}
                />
              ))}
              {takeoverTwoUp ? (
                <NewsroomTwoUpTile article={takeoverTwoUp} />
              ) : null}
              {takeoverTwoUpBleed ? (
                <NewsroomTwoUpTile article={takeoverTwoUpBleed} />
              ) : null}
            </ul>
          </section>
        ) : null}

        {latest.length > 0 ? (
          <section
            id="latest-news"
            className="MacWallNewsroomSection everydayfeed"
            aria-labelledby="latest-news-title"
          >
            <div className="section-content">
              <h2 id="latest-news-title" className="section-head">
                Latest
              </h2>
              <ul role="list" className="section-tiles section-tiles--feed">
                {latest.map((article, index) => (
                  <NewsroomThreeUpTile
                    key={article.slug}
                    article={article}
                    itemClassName={`tile-item feed-item-3up feed-item-3up-${index + 1}`}
                  />
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {archive.length > 0 ? (
          <section
            className="MacWallNewsroomSection more-from-newsroom"
            aria-labelledby="more-blog-title"
          >
            <div className="section-content">
              <h2 id="more-blog-title" className="section-head">
                More from MacWall Blog
              </h2>
              <ul role="list" className="section-tiles section-tiles--list">
                {archive.map((article) => (
                  <NewsroomListTile key={article.slug} article={article} />
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
