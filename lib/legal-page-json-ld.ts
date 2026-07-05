import { macwall } from "@/lib/macwall-site"

/** WebPage + BreadcrumbList for indexable marketing/legal routes (trusted server strings only). */
export function webPageWithBreadcrumbsJsonLd(input: {
  origin: string
  pathname: string
  pageTitle: string
  headline: string
  description: string
  dateModifiedIso?: string
}) {
  const origin = input.origin.replace(/\/$/, "")
  const url = `${origin}${input.pathname.startsWith("/") ? input.pathname : `/${input.pathname}`}`
  const siteId = `${origin}/#website`
  const pageId = `${url}#webpage`

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

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: macwall.name,
            item: origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: input.pageTitle,
            item: url,
          },
        ],
      },
      webPage,
    ],
  } as const
}
