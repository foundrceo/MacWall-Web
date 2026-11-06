import { notFound } from "next/navigation"
import { SeoPageShell } from "@/components/content/seo-page-shell"
import { HubLinkList } from "@/components/content/hub-link-list"
import { JsonLd } from "@/components/seo/json-ld"
import { sourceCitations } from "@/lib/content/sources"
import { docsPages, getAllDocsSlugs, getDocsPage } from "@/lib/docs/pages"
import { articleJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { ogImageForPath } from "@/lib/seo/og-images"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

type RouteParams = { params: Promise<{ slug: string }> }

/** "November 5, 2026" */
function dateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function generateStaticParams(): { slug: string }[] {
  return getAllDocsSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const page = getDocsPage(slug)
  if (!page) return {}
  return createSeoPageMetadata(page, {
    openGraphType: "article",
    publishedTime: page.publishedAt,
    modifiedTime: page.updatedAt,
  })
}

export default async function DocsDetailPage({ params }: RouteParams) {
  const { slug } = await params
  const page = getDocsPage(slug)
  if (!page) notFound()

  const siblings = docsPages.filter(
    (candidate) =>
      candidate.section === page.section && candidate.slug !== page.slug
  )

  return (
    <>
      <JsonLd
        payload={articleJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: page.pathname,
          headline: page.headline,
          description: page.description,
          datePublished: page.publishedAt,
          dateModified: page.updatedAt,
          image: ogImageForPath(page.pathname)?.url,
          section: { name: "Docs", pathname: "/docs" },
          breadcrumbName: page.navLabel,
          type: "TechArticle",
          about: "#softwareapplication",
          citation: sourceCitations(page.sources),
        })}
      />
      {page.faq && page.faq.length > 0 ? (
        <JsonLd payload={faqPageJsonLd(page.faq)} />
      ) : null}

      <SeoPageShell
        headline={page.headline}
        description={page.description}
        sections={page.sections}
        faq={page.faq}
        meta={
          <>
            Updated{" "}
            <time dateTime={page.updatedAt}>{dateLabel(page.updatedAt)}</time>
          </>
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Docs", href: "/docs" },
        ]}
      >
        <HubLinkList
          title="More in this section"
          items={siblings.map((sibling) => ({
            href: sibling.pathname,
            label: sibling.navLabel,
            description: sibling.description,
          }))}
        />
      </SeoPageShell>
    </>
  )
}
