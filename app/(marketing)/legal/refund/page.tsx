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
            Every {macwall.name} license comes with a{" "}
            <strong>{macwall.refundWindowDays}-day money-back guarantee</strong>.
            If you&apos;re not happy for any reason, email us within{" "}
            {macwall.refundWindowDays} days of purchase and we&apos;ll refund
            you in full.
          </p>
        }
      >
        <LegalSection id="guarantee" title={`${macwall.refundWindowDays}-Day Money-Back Guarantee`}>
          <ul className={legalBulletList}>
            <li>
              Covers every {macwall.name} license purchase: Pro, Pro+ and
              multi-Mac packs.
            </li>
            <li>
              Applies even if you have downloaded, installed or activated the
              App. No reason is needed, though feedback helps us improve.
            </li>
            <li>
              The {macwall.refundWindowDays} days are counted from the date of
              purchase.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="how-to-request" title="How to Request a Refund">
          <p>
            Email{" "}
            <a href={`mailto:${macwall.supportEmail}?subject=Refund%20request`}>
              {macwall.supportEmail}
            </a>{" "}
            with the subject &ldquo;Refund request&rdquo;, from the email you
            paid with if you can. Include your license key or the approximate
            purchase date so we can find the order. We reply within 1 to 2
            business days.
          </p>
        </LegalSection>

        <LegalSection id="after-window" title={`After ${macwall.refundWindowDays} Days`}>
          <p>
            We still fix billing problems at any time: duplicate charges,
            charges you don&apos;t recognize, or a license key that was never
            delivered are refunded or corrected whenever you contact us.
          </p>
        </LegalSection>

        <LegalSection id="declined" title="When a Refund May Be Declined">
          <ul className={legalBulletList}>
            <li>
              The request arrives after {macwall.refundWindowDays} days and is
              not a billing problem described above.
            </li>
            <li>
              The purchase used a stolen payment method or is otherwise
              fraudulent.
            </li>
            <li>
              Repeated buy-and-refund cycles, or a license that was resold or
              shared beyond its Mac limit.
            </li>
          </ul>
          <p>
            None of this limits rights you have under consumer law.
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
            Our {macwall.refundWindowDays}-day guarantee is offered in addition
            to those rights everywhere we sell, including the EU and UK, and
            never reduces them.
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
            is a separate promotional offer with its own rules. It works
            alongside, and does not replace, the money-back guarantee above.
          </p>
        </LegalSection>

        <LegalSection id="chargebacks" title="Disputed Charges">
          <p>
            If you don&apos;t recognize a charge or something went wrong, email
            us; we usually fix it within 1 to 2 business days and can refund
            directly. You can always dispute a charge with your bank or card
            issuer. A charged-back payment deactivates the license key it paid
            for.
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
