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
            our behalf so we can run {macwall.name}. Below are the categories of
            processing and the current list of providers. See also the{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        }
      >
        <LegalSection id="categories" title="Categories of Subprocessors">
          <ul className={legalBulletList}>
            <li>
              <strong>Payments:</strong> {macwall.paymentProcessor} handles
              checkout, card processing, billing metadata, sales tax, and
              related fraud checks. For purchases made in India,{" "}
              {macwall.indiaPaymentProcessor} handles checkout and payments.
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
              <strong>Analytics &amp; attribution:</strong> product analytics in
              the App, and analytics and referral attribution on the Site.
            </li>
            <li>
              <strong>AI assistance:</strong> suggesting a title and category
              for a wallpaper you submit, from its thumbnail.
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

        <LegalSection id="list" title="Current Subprocessors">
          <ul className={legalBulletList}>
            <li>
              <strong>{macwall.paymentProcessor}</strong>: checkout, payments,
              sales tax and fraud checks for new purchases.
            </li>
            <li>
              <strong>{macwall.indiaPaymentProcessor}</strong>: checkout and
              payments (UPI, cards, netbanking) for purchases made in India.
            </li>
            <li>
              <strong>Stripe</strong>: payment records and refunds for purchases
              made before {macwall.paymentProcessor} checkout.
            </li>
            <li>
              <strong>Vercel</strong>: website hosting and privacy-friendly web
              analytics.
            </li>
            <li>
              <strong>Supabase</strong>: database, license verification and
              server functions.
            </li>
            <li>
              <strong>Cloudflare</strong>: storage and delivery of wallpaper
              media and app downloads.
            </li>
            <li>
              <strong>Resend</strong>: delivery of license and support emails.
            </li>
            <li>
              <strong>PostHog</strong>: product analytics and crash reports in
              the App, linked to a pseudonymous install ID (and your trial email
              if you give one).
            </li>
            <li>
              <strong>OpenAI</strong>: suggests a title and category for a
              wallpaper you submit, from its thumbnail image only.
            </li>
            <li>
              <strong>Apple</strong>: push notifications about your submissions,
              if you allow them.
            </li>
            <li>
              <strong>Google Analytics, Meta, TikTok, X, Ahrefs</strong>:
              website analytics and ad measurement on marketing pages.
            </li>
            <li>
              <strong>Affonso</strong>: affiliate referral tracking.
            </li>
            <li>
              <strong>Discord</strong>: our community server, only if you choose
              to join it.
            </li>
          </ul>
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
            We may change providers as the product evolves. We choose providers
            with strong security practices (such as SOC 2 or ISO 27001 reports),
            rely on their data processing terms and, for transfers out of the
            EEA/UK, Standard Contractual Clauses or the EU-U.S. Data Privacy
            Framework where available. Changes are posted on this page with a
            new effective date; the current date is {macwall.legalEffectiveDate}
            .
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
