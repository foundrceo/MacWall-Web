import { LEGAL_HUB_HREF } from "@/lib/legal/documents"
import { macwall } from "@/lib/macwall-site"

/** WebPage + BreadcrumbList for indexable marketing/legal routes (trusted server strings only). */
export function webPageWithBreadcrumbsJsonLd(input: {
  origin: string
  pathname: string
  pageTitle: string
  headline: string
  description: string
  dateModifiedIso?: string
  /** When set, inserts Legal hub as breadcrumb position 2. */
  legalHub?: boolean
}) {
  const origin = input.origin.replace(/\/$/, "")
  const url = `${origin}${input.pathname.startsWith("/") ? input.pathname : `/${input.pathname}`}`
  const siteId = `${origin}/#website`
  const pageId = `${url}#webpage`
  const legalHubUrl = `${origin}${LEGAL_HUB_HREF}`

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": pageId,
    url,
    name: input.pageTitle,
    headline: input.headline,
    description: input.description,
    inLanguage: "en-US",
    isPartOf: { "@id": siteId },
  }

  if (input.dateModifiedIso) {
    webPage.dateModified = input.dateModifiedIso
  }

  const crumbs: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item: string
  }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: macwall.name,
      item: origin,
    },
  ]

  if (input.legalHub && input.pathname !== LEGAL_HUB_HREF) {
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: "Legal",
      item: legalHubUrl,
    })
    crumbs.push({
      "@type": "ListItem",
      position: 3,
      name: input.pageTitle,
      item: url,
    })
  } else {
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: input.pageTitle,
      item: url,
    })
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs,
      },
      webPage,
    ],
  } as const
}
