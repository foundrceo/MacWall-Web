import { BlogContentBody } from "@/components/blog/blog-content-body"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import { ProseBreadcrumbs } from "@/components/content/prose-breadcrumbs"
import type { ContentBlock } from "@/lib/content/types"
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function BlogArticleShell({
  headline,
  description,
  sections,
  breadcrumbs,
  categoryLabel,
  readMinutes,
  publishedAt,
  coverSrc,
  children,
}: Readonly<{
  headline: string
  description: string
  sections?: ContentBlock[]
  breadcrumbs?: { label: string; href: string }[]
  categoryLabel: string
  readMinutes: number
  publishedAt?: string
  coverSrc?: string
  children?: ReactNode
}>) {
  const titleId = "blog-article-title"

  return (
    <MarketingProseShell
      width="article"
      mainId="blog-article-main"
      labelledBy={titleId}
      showBottomCta={false}
    >
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
            {publishedAt ? (
              <>
                <span aria-hidden className={blogHeroMetaSep}>
                  ·
                </span>
                <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
              </>
            ) : null}
          </p>
        </header>

        {coverSrc ? (
          <div className={blogCover}>
            <BlogTilePicture
              src={coverSrc}
              alt=""
              variant="curated"
              priority
            />
          </div>
        ) : null}

        <div className={blogDivider} role="presentation" />

        <article className={blogArticle}>
          {sections ? <BlogContentBody sections={sections} /> : null}
          {children}
        </article>
      </div>
    </MarketingProseShell>
  )
}
