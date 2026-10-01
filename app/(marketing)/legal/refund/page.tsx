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

const doc = legalDocumentBySlug("refund")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalRefundPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Refund Policy`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Refund Policy`}
        intro={
          <p>
            {macwall.name} does <strong>not</strong> offer a general refund
            policy. License purchases are final once a key is delivered. This
            page only describes rare exceptions, and those are never
            guaranteed. Mandatory consumer rights in your country still apply
            where they cannot be waived.
          </p>
        }
      >
        <LegalSection id="no-general-refunds" title="No General Refunds">
          <p>
            Digital licenses are sold as-is. We do not provide refunds for
            change of mind, unused licenses, preference changes, or similar
            reasons. Buying {macwall.name} Pro means you accept that sales are
            final under normal circumstances.
          </p>
        </LegalSection>

        <LegalSection id="exceptions" title="Exceptions (Discretionary Only)">
          <p>
            In a small number of cases we <em>may</em> choose to refund, but only
            if we decide the situation clearly warrants it. That decision is
            entirely ours. Examples we might consider:
          </p>
          <ul className={legalBulletList}>
            <li>A clear billing error or duplicate charge on our side.</li>
            <li>
              You were charged but never received a working license key, and
              we could not deliver one after you contacted support.
            </li>
            <li>
              The App cannot run on a supported macOS version we advertised at
              the time of purchase, after reasonable troubleshooting.
            </li>
          </ul>
          <p>
            Even in those situations, a refund is not automatic. Contacting
            support does not create a right to a refund.
          </p>
          <p>
            If you want us to review an exceptional case, email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            with your purchase email, approximate purchase date, and what went
            wrong. We aim to reply within a few business days.
          </p>
        </LegalSection>

        <LegalSection id="statutory-rights" title="Your Statutory Rights">
          <p>
            Nothing in this policy limits rights you have under the consumer
            laws of your country that cannot be excluded by contract. If{" "}
            {macwall.name} is faulty or not as described, you may be entitled
            to a repair, replacement or refund under those laws, and we will
            honor them.
          </p>
          <p>
            Customers in the EU, UK and similar jurisdictions: {macwall.name}{" "}
            Pro is digital content supplied immediately after payment. By
            completing checkout you request immediate delivery and acknowledge
            that the statutory right of withdrawal ends once the license key is
            delivered, to the extent the law allows.
          </p>
        </LegalSection>

        <LegalSection id="how-refunds-work" title="How Approved Refunds Are Paid">
          <p>
            Approved refunds go back to the original payment method through
            our payment processor, {macwall.paymentProcessor}. Banks usually
            show them within 5 to 10 business days. The refunded license key
            is deactivated when the refund is issued.
          </p>
        </LegalSection>

        <LegalSection id="creator-program" title="Creator Reel Program">
          <p>
            The creator / Reel program on <Link href="/creator">/creator</Link>{" "}
            is a separate promotional offer with its own rules. It is not a
            standard refund policy and does not change the “sales are final”
            rule above for ordinary purchases.
          </p>
        </LegalSection>

        <LegalSection id="chargebacks" title="Chargebacks">
          <p>
            Please contact us before filing a chargeback; most problems are
            solved by email within a few business days. A charged-back payment
            deactivates the license key, and abuse of chargebacks may result in
            refusal of future sales.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Questions:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . © {year} {macwall.legalCompanyName}. Last updated{" "}
            {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
