import { notFound } from "next/navigation"
import { SeoPageShell } from "@/components/content/seo-page-shell"
import { HubLinkList } from "@/components/content/hub-link-list"
import { JsonLd } from "@/components/seo/json-ld"
import { sourceCitations } from "@/lib/content/sources"
import { getAllLearnSlugs, getLearnPage, learnPages } from "@/lib/learn/pages"
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
  return getAllLearnSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const page = getLearnPage(slug)
  if (!page) return {}
  return createSeoPageMetadata(page, {
    openGraphType: "article",
    publishedTime: page.publishedAt,
    modifiedTime: page.updatedAt,
  })
}

export default async function LearnDetailPage({ params }: RouteParams) {
  const { slug } = await params
  const page = getLearnPage(slug)
  if (!page) notFound()

  const others = learnPages.filter((candidate) => candidate.slug !== page.slug)

  return (
    <>
      <JsonLd
        payload={articleJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: page.pathname,
          headline: page.headline,
          description: page.description,
          // Both dates are required on LearnPage: never an invented or empty one.
          datePublished: page.publishedAt,
          dateModified: page.updatedAt,
          image: ogImageForPath(page.pathname)?.url,
          section: { name: "Learn", pathname: "/learn" },
          breadcrumbName: page.navLabel,
          type: "Article",
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
          { label: "Learn", href: "/learn" },
        ]}
      >
        <HubLinkList
          title="Keep learning"
          items={others.map((other) => ({
            href: other.pathname,
            label: other.navLabel,
            description: other.takeaway,
          }))}
        />
      </SeoPageShell>
    </>
  )
}
