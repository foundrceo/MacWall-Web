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

const doc = legalDocumentBySlug("subprocessors")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalSubprocessorsPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Subprocessors`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Subprocessors`}
        intro={
          <p>
            A subprocessor is a third party that may process personal data on
            our behalf so we can run {macwall.name}. We list categories of
            processing below — not a public inventory of every vendor name. See
            also the <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        }
      >
        <LegalSection id="categories" title="Categories of Subprocessors">
          <ul className={legalBulletList}>
            <li>
              <strong>Payments:</strong> processors that handle checkout,
              billing metadata, and related fraud checks.
            </li>
            <li>
              <strong>Infrastructure:</strong> cloud hosting, databases, APIs,
              and media storage that power the Site and catalog.
            </li>
            <li>
              <strong>Communications:</strong> providers that send transactional
              email such as license delivery and support replies.
            </li>
            <li>
              <strong>Analytics &amp; attribution:</strong> limited product
              analytics and referral attribution where configured on the Site.
            </li>
          </ul>
          <p>
            Each provider is engaged only for the scope needed to operate{" "}
            {macwall.name}, and is bound by contracts and safeguards where
            required by law. For a current vendor list related to your own data,
            email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="transfers" title="International Transfers">
          <p>
            Some subprocessors may process data outside your country. Where
            required, we rely on appropriate safeguards such as Standard
            Contractual Clauses, vendor DPAs, and encryption in transit.
          </p>
        </LegalSection>

        <LegalSection id="updates" title="Updates">
          <p>
            We may change providers as the product evolves. This page describes
            categories of processing; the effective date is{" "}
            {macwall.legalEffectiveDate}.
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
