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

const doc = legalDocumentBySlug("gdpr")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalGdprPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} GDPR Information`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} GDPR`}
        intro={
          <p>
            This page summarizes how {macwall.name} approaches the EU General
            Data Protection Regulation (GDPR) and UK GDPR for users in the EEA,
            UK, and Switzerland. It complements our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        }
      >
        <LegalSection id="controller" title="Controller">
          <p>
            For personal data processed through the {macwall.name} app and
            website, the controller is {macwall.name}. Contact:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="bases" title="Legal Bases">
          <ul className={legalBulletList}>
            <li>
              <strong>Contract</strong> — processing purchases and delivering
              license entitlements.
            </li>
            <li>
              <strong>Legitimate interests</strong> — securing the service,
              preventing abuse, and improving reliability, balanced against your
              rights.
            </li>
            <li>
              <strong>Consent</strong> — where we ask for it (for example
              optional non-essential communications).
            </li>
            <li>
              <strong>Legal obligation</strong> — when we must retain or
              disclose data to comply with law.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="rights" title="Your Rights">
          <p>Depending on your situation, you may have the right to:</p>
          <ul className={legalBulletList}>
            <li>Access the personal data we hold about you.</li>
            <li>Rectify inaccurate data.</li>
            <li>Erase data in certain circumstances.</li>
            <li>Restrict or object to certain processing.</li>
            <li>Receive a portable copy of data you provided.</li>
            <li>Withdraw consent where processing is consent-based.</li>
            <li>Lodge a complaint with your local supervisory authority.</li>
          </ul>
        </LegalSection>

        <LegalSection id="exercise" title="How to Exercise Your Rights">
          <p>
            Email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            with subject line <strong>GDPR Request</strong>. Describe the right
            you want to exercise and enough detail for us to locate your data
            (for example purchase email or license key). We may need to verify
            your identity before responding.
          </p>
        </LegalSection>

        <LegalSection id="transfers" title="International Transfers">
          <p>
            We use subprocessors that may process data outside the EEA/UK. See{" "}
            <Link href="/legal/subprocessors">Subprocessors</Link> for the
            current list and safeguards overview.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            © {year} {macwall.legalCompanyName}. Last updated{" "}
            {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
