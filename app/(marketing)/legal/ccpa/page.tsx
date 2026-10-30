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

const support = (
  <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>
)

export default function LegalCcpaPage() {
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
            This page describes the rights California residents have under the
            California Consumer Privacy Act, as amended by the CPRA, when they
            use {macwall.name}. It complements our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>, which describes
            each kind of data in detail.
          </p>
        }
      >
        <LegalSection id="categories" title="What We Collect and Why">
          <ul className={legalBulletList}>
            <li>
              <strong>Identifiers:</strong> email, IP address, App install ID,
              device token, license key and a hash of your Mac&apos;s hardware
              identifier. Used to deliver licenses and the trial, prevent
              fraud, support you and send emails.
            </li>
            <li>
              <strong>Commercial information:</strong> what you bought, the
              price, currency, discount code and license status.
            </li>
            <li>
              <strong>Internet and app activity:</strong> pages and events on
              the Site, App usage events and crash reports, and session
              recordings with text masked. Used to run and improve the product
              and measure ads.
            </li>
            <li>
              <strong>Approximate location:</strong> country, from your IP
              address. Used for regional prices.
            </li>
            <li>
              <strong>Content you send:</strong> support messages, screenshots
              and wallpaper submissions.
            </li>
          </ul>
          <p>
            The business responsible for this information is{" "}
            {macwall.legalCompanyName}, which makes and sells {macwall.name}. We
            collect it from you, your browser and Mac, and{" "}
            {macwall.paymentProcessor}. We don&apos;t collect sensitive
            personal information as the CCPA defines it. Retention is described
            in the <Link href="/legal/privacy#retention">Privacy Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection id="sale" title="Sale and Sharing">
          <p>
            We don&apos;t sell personal information for money. We do
            &ldquo;share&rdquo; it, as California law uses that word, with ad
            platforms: the Site&apos;s ad pixels (Google, Meta, TikTok and X)
            receive your visits and ad click IDs, and when you buy, our server
            sends TikTok and X a SHA-256 hash of your email (and TikTok the
            order value). We don&apos;t knowingly sell or share the personal
            information of anyone under 16.
          </p>
          <p>
            <strong>To opt out of sharing:</strong> turn on Global Privacy
            Control in your browser; we honor it automatically and the
            Site&apos;s ad pixels never load. Today Global Privacy Control does
            not stop the server-side purchase messages; to opt out of those
            too, email {support} with the subject{" "}
            <strong>Do Not Sell or Share</strong> and the email you buy with.
            Details of each partner are in our{" "}
            <Link href="/legal/cookies">Cookie Policy</Link> and{" "}
            <Link href="/legal/subprocessors">Subprocessors</Link> list.
          </p>
        </LegalSection>

        <LegalSection id="rights" title="Your California Rights">
          <ul className={legalBulletList}>
            <li>
              Know and access the categories and specific pieces of personal
              information we collected.
            </li>
            <li>Delete personal information, subject to legal exceptions.</li>
            <li>Correct inaccurate personal information.</li>
            <li>Opt out of sale or sharing.</li>
            <li>Non-discrimination for exercising your privacy rights.</li>
          </ul>
        </LegalSection>

        <LegalSection id="exercise" title="How to Submit a Request">
          <p>
            Email {support} with the subject line <strong>CCPA Request</strong>.
            Tell us which right you want to exercise and include your purchase
            email or license key. We verify the request by confirming you
            control that email, and respond within the time the law requires
            (generally 45 days).
          </p>
          <p>
            Authorized agents may submit requests with proof of authorization.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Questions: {support}. Last updated {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
