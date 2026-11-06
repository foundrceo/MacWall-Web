import { notFound } from "next/navigation"
import { HubLinkList } from "@/components/content/hub-link-list"
import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import {
  FAQ_HUB_PATH,
  faqAnswerSeoPage,
  getAllFaqSlugs,
  getFaqAnswer,
  relatedFaqAnswers,
} from "@/lib/faq/answers"
import { faqAnswerJsonLd } from "@/lib/faq/json-ld"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

type RouteParams = { params: Promise<{ slug: string }> }

/** Only the answers in lib/faq/answers.ts exist; anything else is a 404. */
export const dynamicParams = false

/** "November 6, 2026" */
function dateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function generateStaticParams(): { slug: string }[] {
  return getAllFaqSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const answer = getFaqAnswer(slug)
  if (!answer) return {}
  return createSeoPageMetadata(
    { ...faqAnswerSeoPage(answer), description: answer.description },
    {
      openGraphType: "article",
      publishedTime: answer.publishedAt,
      modifiedTime: answer.updatedAt,
    }
  )
}

export default async function FaqAnswerPage({ params }: RouteParams) {
  const { slug } = await params
  // Priced at render time; the sale-boundary cron re-renders it when a sale
  // starts or ends.
  const answer = getFaqAnswer(slug)
  if (!answer) notFound()

  const related = relatedFaqAnswers(answer)

  return (
    <>
      <JsonLd payload={faqAnswerJsonLd(answer, canonicalSiteOrigin())} />

      <SeoPageShell
        headline={answer.question}
        description={answer.answer}
        sections={answer.details}
        cta={{ slug: answer.slug, pageType: "faq" }}
        meta={
          <>
            Updated{" "}
            <time dateTime={answer.updatedAt}>
              {dateLabel(answer.updatedAt)}
            </time>
          </>
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ", href: FAQ_HUB_PATH },
          { label: answer.navLabel, href: answer.pathname },
        ]}
      >
        <HubLinkList title="Go deeper" items={answer.docLinks} />
        <HubLinkList
          title="More questions"
          items={related.map((other) => ({
            href: other.pathname,
            label: other.question,
            description: other.description,
          }))}
        />
      </SeoPageShell>
    </>
  )
}
