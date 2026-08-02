import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { ContentFaq } from "@/lib/content/types"

/** CollectionPage + BreadcrumbList + ItemList for hub pages such as /docs and /learn. */
export function collectionPageJsonLd(input: {
  pathname: string
  name: string
  description: string
  breadcrumbLabel: string
  items: { name: string; pathname: string; description?: string }[]
}) {
  const origin = canonicalSiteOrigin()
  const url = `${origin}${input.pathname}`

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
            name: input.breadcrumbLabel,
            item: url,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: input.name,
        description: input.description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${origin}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: input.items.length,
          itemListElement: input.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: `${origin}${item.pathname}`,
          })),
        },
      },
    ],
  } as const
}

export function faqPageJsonLd(faqs: ContentFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } as const
}

export function articleJsonLd(input: {
  origin: string
  pathname: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  image?: string
}) {
  const origin = input.origin.replace(/\/$/, "")
  const url = `${origin}${input.pathname}`
  const siteId = `${origin}/#website`

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
            name: "Blog",
            item: `${origin}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: input.headline,
            item: url,
          },
        ],
      },
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: input.headline,
        description: input.description,
        url,
        ...(input.image ? { image: [input.image] } : {}),
        datePublished: input.datePublished,
        dateModified: input.dateModified ?? input.datePublished,
        author: {
          "@type": "Organization",
          name: macwall.name,
          url: origin,
        },
        publisher: {
          "@type": "Organization",
          name: macwall.name,
          url: origin,
          logo: {
            "@type": "ImageObject",
            url: `${origin}/MacWall.png`,
          },
        },
        isPartOf: { "@id": siteId },
        inLanguage: "en-US",
      },
    ],
  } as const
}
