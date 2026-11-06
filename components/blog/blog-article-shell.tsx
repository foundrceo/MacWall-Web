import { BlogContentBody } from "@/components/blog/blog-content-body"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import { ContentCta } from "@/components/content/content-cta"
import { ProseBreadcrumbs } from "@/components/content/prose-breadcrumbs"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import type { ContentBlock, ContentFaq } from "@/lib/content/types"
import {
  proseFaq,
  proseFaqAnswer,
  proseFaqItem,
  proseFaqList,
  proseFaqQuestion,
  proseFaqTitle,
} from "@/lib/marketing-prose-classes"
import {
  blogArticle,
  blogBreadcrumbs,
  blogCover,
  blogDivider,
  blogHero,
  blogHeroEyebrow,
  blogHeroLead,
  blogHeroMeta,
  blogHeroMetaSep,
  blogHeroTitle,
  blogRail,
} from "@/lib/blog-prose-classes"
import type { ReactNode } from "react"

/** "November 6, 2026". Dates are calendar days (YYYY-MM-DD), read as UTC. */
function formatDate(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function BlogArticleShell({
  slug,
  headline,
  description,
  sections,
  faq,
  breadcrumbs,
  categoryLabel,
  readMinutes,
  publishedAt,
  updatedAt,
  coverSrc,
  children,
}: Readonly<{
  /** Sent with CTA clicks so downloads can be traced to the post. */
  slug: string
  headline: string
  description: string
  sections?: ContentBlock[]
  faq?: ContentFaq[]
  breadcrumbs?: { label: string; href: string }[]
  categoryLabel: string
  readMinutes: number
  publishedAt: string
  /** Shown as "Updated {date}" when later than `publishedAt`. */
  updatedAt?: string
  coverSrc?: string
  children?: ReactNode
}>) {
  const titleId = "blog-article-title"
  const showUpdated = Boolean(updatedAt && updatedAt > publishedAt)

  return (
    <MarketingSection className="marketing-main" aria-labelledby={titleId}>
      <div className={blogRail}>
        {breadcrumbs ? (
          <ProseBreadcrumbs items={breadcrumbs} className={blogBreadcrumbs} />
        ) : null}

        <header className={blogHero}>
          <p className={blogHeroEyebrow}>{categoryLabel}</p>
          <h1 id={titleId} className={blogHeroTitle}>
            {headline}
          </h1>
          <p className={blogHeroLead}>{description}</p>
          <p className={blogHeroMeta}>
            <span>{readMinutes} min read</span>
            <span aria-hidden className={blogHeroMetaSep}>
              ·
            </span>
            <span>
              Published{" "}
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </span>
            {showUpdated && updatedAt ? (
              <>
                <span aria-hidden className={blogHeroMetaSep}>
                  ·
                </span>
                <span>
                  Updated{" "}
                  <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
                </span>
              </>
            ) : null}
          </p>
        </header>

        {coverSrc ? (
          <div className={blogCover}>
            <BlogTilePicture
              src={coverSrc}
              alt={headline}
              variant="curated"
              sizes="(min-width: 660px) 620px, 100vw"
              priority
            />
          </div>
        ) : null}

        <div className={blogDivider} role="presentation" />

        <article className={blogArticle}>
          {sections ? (
            <BlogContentBody
              sections={sections}
              afterFirstSection={<ContentCta slug={slug} pageType="blog" />}
            />
          ) : null}
          {faq && faq.length > 0 ? (
            <section className={proseFaq} aria-labelledby="blog-article-faq">
              <h2 id="blog-article-faq" className={proseFaqTitle}>
                Frequently asked questions
              </h2>
              <dl className={proseFaqList}>
                {faq.map((item) => (
                  <div key={item.question} className={proseFaqItem}>
                    <dt className={proseFaqQuestion}>{item.question}</dt>
                    <dd className={proseFaqAnswer}>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </article>
      </div>
      {children}
    </MarketingSection>
  )
}
