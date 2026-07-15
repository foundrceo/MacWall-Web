import { SeoPageShell } from "@/components/content/seo-page-shell"
import {
  ProseActionRow,
  ProseSecondaryLink,
} from "@/components/content/prose-action-row"
import { JsonLd } from "@/components/seo/json-ld"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { getAllBlogSlugs, getBlogArticle } from "@/lib/blog"
import { blogTilePoster } from "@/lib/blog/tile-media"
import { BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/content/types"
import { articleJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { macwallInstallerLatestPath } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) return {}

  const base = createSeoPageMetadata({
    ...article,
    title: article.title,
  })

  const poster = blogTilePoster(slug, article.category, "hero")
  const posterUrl = poster.startsWith("http")
    ? poster
    : `${canonicalSiteOrigin()}${poster}`
  const posterImage = {
    url: posterUrl,
    width: 1600,
    height: 1000,
    alt: article.headline,
  }

  return {
    ...base,
    openGraph: { ...base.openGraph, images: [posterImage] },
    twitter: { ...base.twitter, images: [posterUrl] },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const dynamic = "force-static"

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const origin = canonicalSiteOrigin()
  const articleLd = articleJsonLd({
    origin,
    pathname: article.pathname,
    headline: article.headline,
    description: article.description,
    datePublished: article.publishedAt ?? "2026-03-01",
    dateModified: article.updatedAt,
  })

  const faqLd =
    article.faq && article.faq.length > 0 ? faqPageJsonLd(article.faq) : null

  return (
    <>
      <JsonLd payload={articleLd} />
      {faqLd ? <JsonLd payload={faqLd} /> : null}
      <SeoPageShell
        showBottomCta={false}
        headline={article.headline}
        description={article.description}
        sections={article.sections}
        faq={article.faq}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: article.title, href: article.pathname },
        ]}
        meta={
          <>
            {BLOG_CATEGORY_LABELS[article.category as BlogCategory]} ·{" "}
            {article.readMinutes} min read ·{" "}
            {article.publishedAt ? formatDate(article.publishedAt) : null}
          </>
        }
      >
        <ProseActionRow>
          <TrackedDownloadButton
            href={macwallInstallerLatestPath}
            size="lg"
            location="blog_article"
          >
            Download for Mac
          </TrackedDownloadButton>
          <ProseSecondaryLink href="/blog">All articles</ProseSecondaryLink>
        </ProseActionRow>
      </SeoPageShell>
    </>
  )
}
