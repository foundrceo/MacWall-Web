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
              Payments are processed by {macwall.paymentProcessor}. You enter
              card and other payment details on {macwall.paymentProcessor}
              &apos;s checkout page; they never pass through or get stored on
              our servers. {macwall.paymentProcessor} is certified to PCI DSS
              Level 1.
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
              Community submissions upload to a separate pending area. A
              moderator reviews each one, together with its rights declaration,
              before it is copied into the public catalog, and every moderation
              decision is recorded in an audit log.
            </li>
            <li>
              Hosting and storage providers apply their own infrastructure
              security practices under our agreements with them.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="licensing" title="Licensing and Devices">
          <p>
            Licenses and the free trial are bound to your Mac&apos;s hardware
            identifier to enforce Mac limits and one trial per Mac; our server
            stores only a SHA-256 hash of it. Keep your license key private:
            anyone with it can use your Mac slots.
          </p>
          <p>
            Screenshots and diagnostics reports you send through in-app
            support are stored at long, random, unpublished links that are not
            password-protected: anyone who has a link can open that file.
          </p>
        </LegalSection>

        <LegalSection id="reporting" title="Reporting a Vulnerability">
          <p>
            If you believe you found a security issue, email{" "}
            <a
              href={`mailto:${macwall.supportEmail}?subject=${encodeURIComponent("Security report: MacWall")}`}
            >
              {macwall.supportEmail}
            </a>{" "}
            with subject <strong>Security report: MacWall</strong>. Please
            include enough detail to reproduce the issue and give us reasonable
            time to investigate before public disclosure.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Questions:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . Last updated{" "}
            {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
