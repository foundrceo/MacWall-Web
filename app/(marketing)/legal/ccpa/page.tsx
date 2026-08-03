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

const doc = legalDocumentBySlug("ccpa")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalCcpaPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} CCPA / CPRA Information`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} CCPA / CPRA`}
        intro={
          <p>
            This page describes California privacy rights under the California
            Consumer Privacy Act (CCPA) as amended by the CPRA for users of{" "}
            {macwall.name}. It complements our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        }
      >
        <LegalSection id="categories" title="Categories of Information">
          <p>
            Depending on how you use MacWall, we may process identifiers (such
            as email and IP address), commercial information (purchase and
            license status), internet/activity data (site logs and limited
            analytics), and device identifiers used for license binding. We do
            not intentionally collect sensitive personal information beyond what
            is needed to run the product.
          </p>
        </LegalSection>

        <LegalSection id="sale" title="Sale and Sharing">
          <p>
            We do not sell personal information for money. We do not share
            personal information for cross-context behavioral advertising as a
            business model. Limited analytics or affiliate attribution partners
            may receive technical data as described in our{" "}
            <Link href="/legal/cookies">Cookie Policy</Link> and{" "}
            <Link href="/legal/subprocessors">Subprocessors</Link> list.
          </p>
        </LegalSection>

        <LegalSection id="rights" title="Your California Rights">
          <ul className={legalBulletList}>
            <li>
              Know / access categories and specific pieces of personal
              information collected.
            </li>
            <li>Delete personal information, subject to legal exceptions.</li>
            <li>Correct inaccurate personal information.</li>
            <li>
              Opt out of sale or sharing, to the extent those concepts apply.
            </li>
            <li>Non-discrimination for exercising your privacy rights.</li>
          </ul>
        </LegalSection>

        <LegalSection id="exercise" title="How to Submit a Request">
          <p>
            Email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            with subject line <strong>CCPA Request</strong>. Tell us which right
            you want to exercise and include your purchase email if you have
            one. We will verify the request and respond within the timelines
            required by law (generally within 45 days).
          </p>
          <p>
            Authorized agents may submit requests with proof of authorization.
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
