import { BlogArticleShell } from "@/components/blog/blog-article-shell"
import { BlogRelatedArticles } from "@/components/blog/blog-related-articles"
import { JsonLd } from "@/components/seo/json-ld"
import {
  blogArticleLastModified,
  getAllBlogSlugs,
  getBlogArticle,
} from "@/lib/blog"
import {
  getRelatedBlogArticles,
  getRelatedGuides,
} from "@/lib/blog/partition-articles"
import { blogArticleImageCrops, blogTilePoster } from "@/lib/blog/tile-media"
import {
  BLOG_CATEGORY_LABELS,
  type BlogArticle,
  type ContentVideoBlock,
} from "@/lib/content/types"
import {
  articleJsonLd,
  faqPageJsonLd,
  jsonLdGraph,
  videoObjectJsonLd,
  type ArticleCitation,
} from "@/lib/seo/json-ld-helpers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { ogImageForPath } from "@/lib/seo/og-images"
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

  const poster = blogTilePoster(slug, article.category, "og")
  const posterUrl = poster.startsWith("http")
    ? poster
    : `${canonicalSiteOrigin()}${poster}`

  return createSeoPageMetadata(article, {
    openGraphType: "article",
    publishedTime: article.publishedAt,
    modifiedTime: blogArticleLastModified(article),
    // The generated share card when there is one, else the blog poster.
    image: ogImageForPath(article.pathname) ?? {
      url: posterUrl,
      width: 1200,
      height: 630,
      alt: article.headline,
    },
  })
}

const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/

/**
 * The external pages a post's "Sources" list links to, for the Article's
 * `citation`: the first link of each item after the "Sources" heading.
 */
function articleCitations(article: BlogArticle): ArticleCitation[] {
  const heading = article.sections.findIndex(
    (block) => block.type === "h2" && block.text === "Sources"
  )
  const list = heading === -1 ? undefined : article.sections[heading + 1]
  if (!list || list.type !== "ul") return []
  return list.items.flatMap((item) => {
    const link = item.match(MARKDOWN_LINK)
    return link ? [{ name: link[1], url: link[2] }] : []
  })
}

function videoBlocks(article: BlogArticle): ContentVideoBlock[] {
  return article.sections.filter(
    (block): block is ContentVideoBlock => block.type === "video"
  )
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const origin = canonicalSiteOrigin()
  const videos = videoBlocks(article)
  const structuredData = jsonLdGraph(
    articleJsonLd({
      origin,
      pathname: article.pathname,
      headline: article.headline,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: blogArticleLastModified(article),
      image: blogArticleImageCrops(slug),
      citation: articleCitations(article),
      mentions: "#softwareapplication",
    }),
    article.faq && article.faq.length > 0 ? faqPageJsonLd(article.faq) : null,
    ...videos.map((video, index) =>
      videoObjectJsonLd({
        origin,
        pathname: article.pathname,
        name: video.caption,
        description: video.caption,
        thumbnailUrl: video.poster,
        uploadDate: video.uploadDate,
        contentUrl: video.src,
        duration: video.durationIso,
        width: video.width,
        height: video.height,
        clips: video.clips,
        fragment: index === 0 ? "video" : `video-${index + 1}`,
      })
    )
  )

  const relatedArticles = getRelatedBlogArticles(slug)
  const relatedGuides = getRelatedGuides(slug)
  const coverSrc = blogTilePoster(slug, article.category, "tile")

  return (
    <>
      <JsonLd payload={structuredData} />
      <BlogArticleShell
        slug={article.slug}
        headline={article.headline}
        description={article.description}
        sections={article.sections}
        faq={article.faq}
        categoryLabel={BLOG_CATEGORY_LABELS[article.category]}
        readMinutes={article.readMinutes}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        coverSrc={coverSrc}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: article.title, href: article.pathname },
        ]}
      >
        <BlogRelatedArticles
          articles={relatedArticles}
          guides={relatedGuides}
        />
      </BlogArticleShell>
    </>
  )
}
