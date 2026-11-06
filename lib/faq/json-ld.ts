import {
  FAQ_HUB_PATH,
  faqHubPage,
  faqLastUpdated,
  type FaqAnswer,
} from "@/lib/faq/answers"
import {
  absoluteUrl,
  breadcrumbListNode,
  collectionPageJsonLd,
  faqPageJsonLd,
  jsonLdGraph,
  organizationRef,
  siteEntityIds,
} from "@/lib/seo/json-ld-helpers"

const FAQ_CRUMB = { name: "FAQ", pathname: FAQ_HUB_PATH } as const

/**
 * An answer page as one graph: MacWall > FAQ > question breadcrumbs, and the
 * page itself typed FAQPage (a WebPage subtype) with its one Question. The
 * answer text is the lead paragraph the page shows under the H1.
 */
export function faqAnswerJsonLd(answer: FaqAnswer, origin: string) {
  const base = origin.replace(/\/+$/, "")
  const url = absoluteUrl(base, answer.pathname)
  const ids = siteEntityIds(base)
  const breadcrumb = breadcrumbListNode({
    origin: base,
    pathname: answer.pathname,
    name: answer.navLabel,
    parents: [FAQ_CRUMB],
  })
  const { mainEntity } = faqPageJsonLd([
    { question: answer.question, answer: answer.answer },
  ])

  return jsonLdGraph(breadcrumb, {
    "@type": "FAQPage",
    "@id": `${url}#webpage`,
    url,
    name: answer.question,
    description: answer.description,
    inLanguage: "en-US",
    isPartOf: { "@id": ids.website },
    publisher: organizationRef(base),
    about: { "@id": ids.softwareApplication },
    breadcrumb: { "@id": breadcrumb["@id"] },
    datePublished: answer.publishedAt,
    dateModified: answer.updatedAt,
    mainEntity,
  })
}

/** The hub: CollectionPage + ItemList of every answer page. */
export function faqHubJsonLd(answers: readonly FaqAnswer[]) {
  return collectionPageJsonLd({
    pathname: FAQ_HUB_PATH,
    name: faqHubPage.headline,
    description: faqHubPage.description,
    breadcrumbLabel: FAQ_CRUMB.name,
    dateModified: faqLastUpdated(),
    items: answers.map((answer) => ({
      name: answer.question,
      pathname: answer.pathname,
    })),
  })
}
