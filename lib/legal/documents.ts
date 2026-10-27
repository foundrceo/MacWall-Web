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
  /** Search snippet, 110-160 characters; `description` stays short for lists. */
  metaDescription: string
}

export const LEGAL_HUB_HREF = "/legal" as const

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: "terms",
    href: "/legal/terms",
    title: "Terms of Service",
    shortTitle: "Terms of Service",
    description: `Rules for using the ${macwall.name} macOS app, website, catalog, and paid licenses.`,
    metaDescription: `The terms for using the ${macwall.name} macOS app, website and wallpaper catalog: your license, acceptable use, content rights, payments and refunds.`,
  },
  {
    slug: "privacy",
    href: "/legal/privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy Policy",
    description:
      "What we collect, how we use it, and the rights you have when you use MacWall.",
    metaDescription:
      "What MacWall collects in the macOS app and on macwall.app, how licensing and analytics data are used and stored, and the privacy rights you have.",
  },
  {
    slug: "cookies",
    href: "/legal/cookies",
    title: "Cookie Policy",
    shortTitle: "Cookie Policy",
    description:
      "Cookies and similar tech on macwall.app: what they do and why they are used.",
    metaDescription:
      "The cookies and similar technologies macwall.app uses, what each one does, how long it lasts, and how to change your consent at any time.",
  },
  {
    slug: "refund",
    href: "/legal/refund",
    title: "Refund Policy",
    shortTitle: "Refund Policy",
    description: `Every MacWall license has a ${macwall.refundWindowDays}-day money-back guarantee. How to request a refund and how it is paid.`,
    metaDescription: `Every ${macwall.name} license has a ${macwall.refundWindowDays}-day money-back guarantee. How to request a refund, what qualifies, and how the money is returned.`,
  },
  {
    slug: "subprocessors",
    href: "/legal/subprocessors",
    title: "Subprocessors",
    shortTitle: "Subprocessors",
    description:
      "Third parties that may process data to run payments, hosting, and delivery.",
    metaDescription:
      "The third-party services that may process data for MacWall to run payments, hosting, email, analytics and wallpaper delivery, and what each does.",
  },
  {
    slug: "acceptable-use",
    href: "/legal/acceptable-use",
    title: "Acceptable Use",
    shortTitle: "Acceptable Use",
    description:
      "What you can and cannot do with MacWall, the catalog, and submissions.",
    metaDescription:
      "What you can and cannot do with MacWall, its wallpaper catalog and community uploads, including content rules and how violations are handled.",
  },
  {
    slug: "dmca",
    href: "/legal/dmca",
    title: "DMCA / Copyright",
    shortTitle: "DMCA",
    description:
      "How to report copyright infringement and how we handle takedowns.",
    metaDescription:
      "How to report copyright infringement on macwall.app or in the MacWall catalog, what a notice must include, and how takedowns and counter-notices work.",
  },
  {
    slug: "gdpr",
    href: "/legal/gdpr",
    title: "GDPR",
    shortTitle: "GDPR",
    description: "EEA/UK/Swiss rights and how to exercise them with MacWall.",
    metaDescription:
      "Your rights under the GDPR and UK GDPR when you use MacWall: access, correction, deletion, portability and objection, and how to make a request.",
  },
  {
    slug: "ccpa",
    href: "/legal/ccpa",
    title: "CCPA / CPRA",
    shortTitle: "CCPA",
    description:
      "California privacy rights, including disclosure and deletion requests.",
    metaDescription:
      "California privacy rights under the CCPA and CPRA for MacWall users, including how to request disclosure or deletion of your personal information.",
  },
  {
    slug: "security",
    href: "/legal/security",
    title: "Security",
    shortTitle: "Security",
    description:
      "How we protect licenses, payments, and infrastructure at a high level.",
    metaDescription:
      "How MacWall protects licenses, payments and its infrastructure at a high level, and how to report a security vulnerability to the team responsibly.",
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
