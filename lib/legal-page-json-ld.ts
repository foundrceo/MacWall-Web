import { LEGAL_HUB_HREF } from "@/lib/legal/documents"
import {
  breadcrumbListNode,
  jsonLdGraph,
  siteEntityIds,
  type BreadcrumbCrumb,
  type JsonLdNode,
} from "@/lib/seo/json-ld-helpers"

const LEGAL_HUB_CRUMB: BreadcrumbCrumb = {
  name: "Legal",
  pathname: LEGAL_HUB_HREF,
}

function crumbList(
  parent: BreadcrumbCrumb | readonly BreadcrumbCrumb[] | undefined
): readonly BreadcrumbCrumb[] {
  if (!parent) return []
  return "pathname" in parent ? [parent] : parent
}

/**
 * WebPage + BreadcrumbList for indexable marketing and legal routes (trusted
 * server strings only). The trail is MacWall > parent levels > page.
 */
export function webPageWithBreadcrumbsJsonLd(input: {
  origin: string
  pathname: string
  pageTitle: string
  headline: string
  description: string
  dateModifiedIso?: string
  datePublishedIso?: string
  /**
   * Connects an informational page to its subject: a full `@id`, or a site
   * entity fragment such as `"#softwareapplication"`.
   */
  aboutId?: string
  /** Levels between MacWall and the page, e.g. `{ name: "Docs", pathname: "/docs" }`. */
  parent?: BreadcrumbCrumb | readonly BreadcrumbCrumb[]
  /** Shorthand for the Legal hub parent. */
  legalHub?: boolean
  /** Short leaf crumb ("Changelog"); defaults to `pageTitle`. */
  breadcrumbName?: string
}) {
  const origin = input.origin.replace(/\/$/, "")
  const pathname = input.pathname.startsWith("/")
    ? input.pathname
    : `/${input.pathname}`
  const url = `${origin}${pathname}`
  const parents: BreadcrumbCrumb[] = [
    ...(input.legalHub ? [LEGAL_HUB_CRUMB] : []),
    ...crumbList(input.parent),
  ]
  const breadcrumb = breadcrumbListNode({
    origin,
    pathname,
    name: input.breadcrumbName ?? input.pageTitle,
    parents,
  })

  const webPage: JsonLdNode = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.pageTitle,
    headline: input.headline,
    description: input.description,
    inLanguage: "en-US",
    isPartOf: { "@id": siteEntityIds(origin).website },
    breadcrumb: { "@id": breadcrumb["@id"] },
  }

  if (input.datePublishedIso) {
    webPage.datePublished = input.datePublishedIso
  }

  if (input.dateModifiedIso) {
    webPage.dateModified = input.dateModifiedIso
  }

  if (input.aboutId) {
    const about = {
      "@id": input.aboutId.startsWith("#")
        ? `${origin}/${input.aboutId}`
        : input.aboutId,
    }
    webPage.about = about
    webPage.mainEntity = about
  }

  return jsonLdGraph(breadcrumb, webPage)
}
