import { notFound } from "next/navigation"
import { SeoPageShell } from "@/components/content/seo-page-shell"
import { HubLinkList } from "@/components/content/hub-link-list"
import { JsonLd } from "@/components/seo/json-ld"
import { getAllLearnSlugs, getLearnPage, learnPages } from "@/lib/learn/pages"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

type RouteParams = { params: Promise<{ slug: string }> }

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
    modifiedTime: page.updatedAt ?? page.publishedAt,
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
        payload={webPageWithBreadcrumbsJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: page.pathname,
          pageTitle: page.title,
          headline: page.headline,
          description: page.description,
          dateModifiedIso: page.updatedAt ?? page.publishedAt,
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
