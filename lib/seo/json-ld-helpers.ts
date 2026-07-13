import { macwall } from "@/lib/macwall-site"
import type { ContentFaq } from "@/lib/content/types"

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
        },
        isPartOf: { "@id": siteId },
        inLanguage: "en-US",
      },
    ],
  } as const
}
