import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalDocumentShell } from "@/components/legal/legal-document-shell"
import { LegalSection, legalBulletList } from "@/components/legal/legal-section"
import { legalDocumentBySlug } from "@/lib/legal/documents"
import { legalPageMetadata } from "@/lib/legal/metadata"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

const doc = legalDocumentBySlug("cookies")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalCookiesPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Cookie Policy`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Cookie Policy`}
        intro={
          <p>
            This Cookie Policy explains how {macwall.name} uses cookies and
            similar technologies on {macwall.website}. For broader privacy
            practices, see our <Link href="/legal/privacy">Privacy Policy</Link>
            .
          </p>
        }
      >
        <LegalSection id="what-are-cookies" title="What Are Cookies?">
          <p>
            Cookies are small text files stored on your device when you visit a
            website. Similar technologies include local storage and pixels used
            by payment or analytics partners.
          </p>
        </LegalSection>

        <LegalSection id="how-we-use" title="How We Use Cookies">
          <ul className={legalBulletList}>
            <li>
              <strong>Essential / functional:</strong> keep the site working —
              for example remembering approximate country for pricing display (
              <code>mw_country</code>) and securing admin sessions for our own
              operators.
            </li>
            <li>
              <strong>Payments:</strong> our payment processor may set cookies
              during checkout to process your purchase securely.
            </li>
            <li>
              <strong>Attribution / analytics:</strong> where configured,
              analytics or referral partners may use cookies or similar
              identifiers to understand traffic and product usage. These help us
              improve the product; they are not used to sell your personal
              information as a standalone product.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="managing" title="Managing Cookies">
          <p>
            You can control cookies through your browser settings. Blocking
            essential cookies may break checkout or regional pricing. Clearing
            cookies may reset preferences such as country detection.
          </p>
        </LegalSection>

        <LegalSection id="updates" title="Updates">
          <p>
            We may update this policy when our stack changes. The latest version
            is always on this page. Last updated {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Questions:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . © {year} {macwall.legalCompanyName}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
