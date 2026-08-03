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

const doc = legalDocumentBySlug("security")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalSecurityPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Security`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Security`}
        intro={
          <p>
            How {macwall.name} approaches security for the app and website. This
            is a high-level overview, not a guarantee that any system is
            risk-free. Related: <Link href="/legal/privacy">Privacy</Link>,{" "}
            <Link href="/legal/subprocessors">Subprocessors</Link>.
          </p>
        }
      >
        <LegalSection id="payments" title="Payments">
          <ul className={legalBulletList}>
            <li>
              Card payments are processed by our payment provider. We do not
              store full card numbers on MacWall servers.
            </li>
            <li>
              License keys are issued after successful payment and validated by
              our licensing systems.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="transport" title="Transport and Access">
          <ul className={legalBulletList}>
            <li>
              Website and API traffic use TLS encryption in transit where
              supported.
            </li>
            <li>
              Administrative access to production systems is limited to
              authorized operators and protected by authentication controls.
            </li>
            <li>
              Hosting and storage providers apply their own infrastructure
              security practices under our agreements with them.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="licensing" title="Licensing and Devices">
          <p>
            Pro licenses may be bound to hardware identifiers to enforce Mac
            limits and reduce key sharing. You are responsible for keeping your
            license key private within your allowed device count.
          </p>
        </LegalSection>

        <LegalSection id="reporting" title="Reporting a Vulnerability">
          <p>
            If you believe you found a security issue, email{" "}
            <a
              href={`mailto:${macwall.supportEmail}?subject=${encodeURIComponent("Security report — MacWall")}`}
            >
              {macwall.supportEmail}
            </a>{" "}
            with subject <strong>Security report — MacWall</strong>. Please
            include enough detail to reproduce the issue and give us reasonable
            time to investigate before public disclosure.
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
