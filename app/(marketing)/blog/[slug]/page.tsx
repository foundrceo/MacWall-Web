import { BlogArticleShell } from "@/components/blog/blog-article-shell"
import { BlogRelatedArticles } from "@/components/blog/blog-related-articles"
import { JsonLd } from "@/components/seo/json-ld"
import { getAllBlogSlugs, getBlogArticle } from "@/lib/blog"
import { getRelatedBlogArticles } from "@/lib/blog/partition-articles"
import { blogTilePoster } from "@/lib/blog/tile-media"
import { BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/content/types"
import { articleJsonLd } from "@/lib/seo/json-ld-helpers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
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

  const poster = blogTilePoster(slug, article.category, "og")
  const posterUrl = poster.startsWith("http")
    ? poster
    : `${canonicalSiteOrigin()}${poster}`
  const posterImage = {
    url: posterUrl,
    width: 1200,
    height: 630,
    alt: article.headline,
  }

  return {
    ...base,
    openGraph: { ...base.openGraph, images: [posterImage] },
    twitter: { ...base.twitter, images: [posterUrl] },
  }
}

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

  const relatedArticles = getRelatedBlogArticles(slug)
  const coverSrc = blogTilePoster(slug, article.category, "tile")

  return (
    <>
      <JsonLd payload={articleLd} />
      <BlogArticleShell
        headline={article.headline}
        description={article.description}
        sections={article.sections}
        categoryLabel={BLOG_CATEGORY_LABELS[article.category as BlogCategory]}
        readMinutes={article.readMinutes}
        publishedAt={article.publishedAt}
        coverSrc={coverSrc}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: article.title, href: article.pathname },
        ]}
      >
        <BlogRelatedArticles articles={relatedArticles} />
      </BlogArticleShell>
    </>
  )
}
