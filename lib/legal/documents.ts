import { macwall } from "@/lib/macwall-site"

export type LegalDocumentSlug =
  | "terms"
  | "privacy"
  | "cookies"
  | "refund"
  | "subprocessors"
  | "acceptable-use"
  | "dmca"
  | "gdpr"
  | "ccpa"
  | "security"

export type LegalDocument = {
  slug: LegalDocumentSlug
  href: `/legal/${LegalDocumentSlug}`
  title: string
  shortTitle: string
  description: string
}

export const LEGAL_HUB_HREF = "/legal" as const

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: "terms",
    href: "/legal/terms",
    title: "Terms of Service",
    shortTitle: "Terms of Service",
    description: `Rules for using the ${macwall.name} macOS app, website, catalog, and paid licenses.`,
  },
  {
    slug: "privacy",
    href: "/legal/privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy Policy",
    description:
      "What we collect, how we use it, and the rights you have when you use MacWall.",
  },
  {
    slug: "cookies",
    href: "/legal/cookies",
    title: "Cookie Policy",
    shortTitle: "Cookie Policy",
    description:
      "Cookies and similar tech on macwall.app — what they do and why they are used.",
  },
  {
    slug: "refund",
    href: "/legal/refund",
    title: "Refund Policy",
    shortTitle: "Refund Policy",
    description:
      "MacWall does not offer a general refund policy — only rare exceptions we approve.",
  },
  {
    slug: "subprocessors",
    href: "/legal/subprocessors",
    title: "Subprocessors",
    shortTitle: "Subprocessors",
    description:
      "Third parties that may process data to run payments, hosting, and delivery.",
  },
  {
    slug: "acceptable-use",
    href: "/legal/acceptable-use",
    title: "Acceptable Use",
    shortTitle: "Acceptable Use",
    description:
      "What you can and cannot do with MacWall, the catalog, and submissions.",
  },
  {
    slug: "dmca",
    href: "/legal/dmca",
    title: "DMCA / Copyright",
    shortTitle: "DMCA",
    description:
      "How to report copyright infringement and how we handle takedowns.",
  },
  {
    slug: "gdpr",
    href: "/legal/gdpr",
    title: "GDPR",
    shortTitle: "GDPR",
    description: "EEA/UK/Swiss rights and how to exercise them with MacWall.",
  },
  {
    slug: "ccpa",
    href: "/legal/ccpa",
    title: "CCPA / CPRA",
    shortTitle: "CCPA",
    description:
      "California privacy rights, including disclosure and deletion requests.",
  },
  {
    slug: "security",
    href: "/legal/security",
    title: "Security",
    shortTitle: "Security",
    description:
      "How we protect licenses, payments, and infrastructure at a high level.",
  },
] as const

export function legalDocumentBySlug(
  slug: LegalDocumentSlug
): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug)
}

export function legalDocumentHrefs(): string[] {
  return [LEGAL_HUB_HREF, ...LEGAL_DOCUMENTS.map((doc) => doc.href)]
}
