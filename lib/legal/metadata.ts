import type { Metadata } from "next"
import type { LegalDocument } from "@/lib/legal/documents"
import { LEGAL_HUB_HREF } from "@/lib/legal/documents"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"

export function legalPageMetadata(doc: LegalDocument): Metadata {
  const title = doc.title
  const description = doc.description
  const path = doc.href
  const ogTitle = `${macwall.name} – ${title}`

  return {
    title,
    description,
    alternates: { canonical: canonicalSitePath(path) },
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalSitePath(path),
      siteName: `${macwall.name} App`,
      type: "website",
      images: [
        {
          url: openGraphImageAbsoluteUrl(),
          width: openGraphImageSize.width,
          height: openGraphImageSize.height,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [openGraphImageAbsoluteUrl()],
    },
  }
}

export function legalHubMetadata(): Metadata {
  const title = "Legal"
  const description = `${macwall.name} legal center — terms, privacy, cookies, refunds, DMCA, GDPR, CCPA, security, and more.`
  const path = LEGAL_HUB_HREF
  const ogTitle = `${macwall.name} – Legal`

  return {
    title,
    description,
    alternates: { canonical: canonicalSitePath(path) },
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalSitePath(path),
      siteName: `${macwall.name} App`,
      type: "website",
      images: [
        {
          url: openGraphImageAbsoluteUrl(),
          width: openGraphImageSize.width,
          height: openGraphImageSize.height,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [openGraphImageAbsoluteUrl()],
    },
  }
}
