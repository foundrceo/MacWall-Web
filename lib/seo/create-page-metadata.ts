import { macwall } from "@/lib/macwall-site"
import {
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { SeoContentPage } from "@/lib/content/types"
import type { Metadata } from "next"

export function createSeoPageMetadata(page: SeoContentPage): Metadata {
  const title = page.title.includes(macwall.name) ? page.title : `${page.title}`

  return {
    title,
    description: page.description,
    alternates: { canonical: canonicalSitePath(page.pathname) },
    keywords: page.keywords,
    openGraph: {
      title: `${macwall.name} – ${page.headline}`,
      description: page.description,
      url: canonicalSitePath(page.pathname),
      type: "website",
      images: [
        {
          url: openGraphImageAbsoluteUrl(),
          width: openGraphImageSize.width,
          height: openGraphImageSize.height,
          alt: `${macwall.name} – ${page.headline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${macwall.name} – ${page.headline}`,
      description: page.description,
      images: [openGraphImageAbsoluteUrl()],
    },
  }
}
