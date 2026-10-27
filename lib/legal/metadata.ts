import type { Metadata } from "next"
import type { LegalDocument } from "@/lib/legal/documents"
import { LEGAL_HUB_HREF } from "@/lib/legal/documents"
import { macwall } from "@/lib/macwall-site"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"

export const LEGAL_HUB_DESCRIPTION = `The ${macwall.name} legal center: terms of service, privacy, cookies, refunds, DMCA, GDPR, CCPA, security and the companies that process data for us.`

export function legalPageMetadata(doc: LegalDocument): Metadata {
  return createSimplePageMetadata({
    title: doc.title,
    description: doc.metaDescription,
    path: doc.href,
  })
}

export function legalHubMetadata(): Metadata {
  return createSimplePageMetadata({
    title: "Legal",
    description: LEGAL_HUB_DESCRIPTION,
    path: LEGAL_HUB_HREF,
  })
}
