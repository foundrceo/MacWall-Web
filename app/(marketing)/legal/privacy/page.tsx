import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalDocumentShell } from "@/components/legal/legal-document-shell"
import { legalTextPrimary } from "@/components/legal/legal-classes"
import { LegalSection, legalBulletList } from "@/components/legal/legal-section"
import { legalDocumentBySlug } from "@/lib/legal/documents"
import { legalPageMetadata } from "@/lib/legal/metadata"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { cn } from "@/lib/utils"

const doc = legalDocumentBySlug("privacy")!

export const metadata: Metadata = legalPageMetadata(doc)

const siteHost = macwall.website.replace(/^https?:\/\//, "")

export default function LegalPrivacyPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Privacy Policy`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Privacy Policy`}
        intro={
          <>
            <p>
              {macwall.name} is committed to your privacy. This Privacy Policy
              explains how we collect, use, disclose, and store information when
              you use our macOS app and website.
            </p>
            <p>
              {macwall.name} does not require user accounts. To manage licensing
              and preferences, use{" "}
              <strong className={cn("font-semibold", legalTextPrimary)}>
                Settings
              </strong>{" "}
              in the Mac app. For privacy requests, contact{" "}
              <a href={`mailto:${macwall.supportEmail}`}>
                {macwall.supportEmail}
              </a>
              . Related policies: <Link href="/legal/gdpr">GDPR</Link>,{" "}
              <Link href="/legal/ccpa">CCPA</Link>,{" "}
              <Link href="/legal/cookies">Cookies</Link>,{" "}
              <Link href="/legal/subprocessors">Subprocessors</Link>.
            </p>
          </>
        }
      >
        <LegalSection
          id="information-we-collect"
          title="Information We Collect"
        >
          <p>
            We do not require registration for basic catalog and wallpaper use.
            Some technical and purchase-related data is collected automatically
            or when you use specific features.
          </p>
          <ul className={legalBulletList}>
            <li>
              <strong>Device and app data:</strong> The app may send your app
              version, macOS version, and a pseudonymous identifier used for
              community features (for example likes) without signing in.
            </li>
            <li>
              <strong>Licensing data:</strong> When you activate {macwall.name}{" "}
              Pro, we send your license key and a stable hardware identifier
              (such as your Mac&apos;s platform UUID) to our payment and
              licensing systems so your purchase can be validated and bound to
              this device.
            </li>
            <li>
              <strong>Purchase data:</strong> Checkout is handled by our payment
              processor. We do not collect or store your full payment card
              details on our servers. We may receive transaction identifiers,
              license status, and your email for fulfillment and support.
            </li>
            <li>
              <strong>Website and infrastructure logs:</strong> When you visit{" "}
              {siteHost}, hosting providers may log standard data such as IP
              address, user agent, and request time for security and
              reliability.
            </li>
            <li>
              <strong>Support:</strong> If you email {macwall.supportEmail}, we
              retain your message and address to respond.
            </li>
            <li>
              <strong>Community submissions:</strong> If you submit a wallpaper
              through the Site, we process the files and metadata you provide
              for review and, if approved, public distribution in the catalog.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="how-we-use-data" title="How We Use Collected Data">
          <p>We use this information to operate and improve our services.</p>
          <ul className={legalBulletList}>
            <li>Deliver and enforce Pro license activations.</li>
            <li>Detect fraud, abuse, and licensing violations.</li>
            <li>
              Provide the cloud catalog, downloads, search, and related
              features.
            </li>
            <li>
              Improve performance, diagnose errors, and keep the app stable.
            </li>
            <li>
              Send transactional communications related to your purchase where
              appropriate.
            </li>
            <li>Comply with law and respond to valid legal process.</li>
          </ul>
        </LegalSection>

        <LegalSection
          id="what-we-do-not-do"
          title="What We Do Not Use Data For"
        >
          <ul className={legalBulletList}>
            <li>Behavioral ad profiling across unrelated apps or sites.</li>
            <li>Selling personal information as a standalone product.</li>
            <li>
              Re-identifying you from pseudonymous community IDs for marketing.
            </li>
          </ul>
        </LegalSection>

        <LegalSection
          id="storage-and-processing"
          title="Data Storage and Processing"
        >
          <p>
            We rely on trusted service providers to operate {macwall.name}. See
            categories of processing on our{" "}
            <Link href="/legal/subprocessors">Subprocessors</Link> page
            (payments, infrastructure, email, and limited analytics).
          </p>
          <p>
            We use contracts and appropriate safeguards with processors where
            required by law.
          </p>
        </LegalSection>

        <LegalSection
          id="your-content"
          title="Catalog Content and Local Imports"
        >
          <p>
            Wallpapers in our catalog are licensed or provided for distribution
            through the service. Your license to use the App does not give you
            ownership of catalog media.
          </p>
          <ul className={legalBulletList}>
            <li>
              Video files you import from your own storage stay on your Mac
              unless you explicitly use a feature that uploads them (the current
              app keeps personal imports local).
            </li>
            <li>
              You are responsible for ensuring you have rights to any files you
              import and set as wallpapers.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="gdpr-basis" title="Legal Basis for Processing (GDPR)">
          <p>
            If you are in the EEA, UK, or Switzerland, we rely on contract,
            legitimate interests, and consent where applicable. Details and how
            to exercise your rights are on our{" "}
            <Link href="/legal/gdpr">GDPR</Link> page.
          </p>
        </LegalSection>

        <LegalSection id="rights-california" title="California Privacy (CCPA)">
          <p>
            California residents have additional rights under CCPA/CPRA. See our{" "}
            <Link href="/legal/ccpa">CCPA</Link> page, or email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="security" title="Data Security">
          <p>
            We use reasonable technical and organizational measures. More detail
            is on our <Link href="/legal/security">Security</Link> page. No
            method of transmission or storage is completely secure.
          </p>
        </LegalSection>

        <LegalSection id="children" title="Children's Privacy">
          <p>
            The App and Site are not directed at children under 13 (or the
            minimum age in your region), and we do not knowingly collect their
            personal information. Contact us if you believe we have done so
            inadvertently.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. The current
            version will be posted at <Link href={doc.href}>{doc.href}</Link>.
            Material changes may be communicated through the app or website.
            Continued use after updates constitutes acceptance where permitted
            by law.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Privacy questions and requests:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . Copyright © {year} {macwall.legalCompanyName}. Website:{" "}
            <a href={macwall.website} target="_blank" rel="noopener noreferrer">
              {siteHost}
            </a>
            . Last updated {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
