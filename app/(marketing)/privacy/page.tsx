import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalDocumentShell } from "@/components/legal/legal-document-shell"
import { legalTextPrimary } from "@/components/legal/legal-classes"
import { LegalSection, legalBulletList } from "@/components/legal/legal-section"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import { cn } from "@/lib/utils"

const PAGE_DESCRIPTION = `How the ${macwall.name} app collects, uses, stores, and shares information across the macOS app and website, including licensing, analytics, and your data-protection rights.`

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/privacy") },
  openGraph: {
    title: `${macwall.name} App – Privacy Policy`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/privacy"),
    siteName: `${macwall.name} App`,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} App – Privacy Policy`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} App – Privacy Policy`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

const siteHost = macwall.website.replace(/^https?:\/\//, "")

export default function PrivacyPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/privacy",
    pageTitle: "Privacy Policy",
    headline: `${macwall.name} Privacy Policy`,
    description: PAGE_DESCRIPTION,
    dateModifiedIso: macwall.legalEffectiveDateIso,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        variant="privacy"
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
              in the Mac app, or read the latest policy at{" "}
              <a
                href={macwall.legalPrivacy}
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteHost}/privacy
              </a>
              . For corrections or general enquiries, contact{" "}
              <a href={`mailto:${macwall.supportEmail}`}>
                {macwall.supportEmail}
              </a>
              .
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
              licensing provider so your purchase can be validated and bound to
              this device.
            </li>
            <li>
              <strong>Purchase data:</strong> Checkout is handled by our
              merchant (Whop). We do not collect or store your full payment card
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
            We rely on trusted service providers to operate {macwall.name}, for
            example:
          </p>
          <ul className={legalBulletList}>
            <li>
              <strong>Whop:</strong> payment, checkout, and software licensing.
            </li>
            <li>
              <strong>Cloud infrastructure:</strong> APIs and databases that
              power the catalog and related backend services.
            </li>
            <li>
              <strong>Email delivery (e.g. Resend):</strong> transactional mail
              such as license delivery when configured for your purchase flow.
            </li>
            <li>
              <strong>Website hosting:</strong> deployment and delivery of{" "}
              {siteHost}.
            </li>
          </ul>
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
          <p>If you are in the EEA, UK, or Switzerland, we rely on:</p>
          <ul className={legalBulletList}>
            <li>
              <strong>Contract</strong> — to process purchases and deliver Pro
              entitlements.
            </li>
            <li>
              <strong>Legitimate interests</strong> — to secure the service,
              prevent abuse, and improve reliability (balanced against your
              rights).
            </li>
            <li>
              <strong>Consent</strong> — where we ask for it (for example
              optional communications beyond essentials).
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="rights-eea" title="Your Rights (EU/EEA/UK)">
          <p>You may have rights including:</p>
          <ul className={legalBulletList}>
            <li>
              Access, rectification, erasure, and restriction of processing.
            </li>
            <li>Data portability and objection to certain processing.</li>
            <li>
              The right to lodge a complaint with a supervisory authority.
            </li>
            <li>
              To exercise these rights, contact{" "}
              <a href={`mailto:${macwall.supportEmail}`}>
                {macwall.supportEmail}
              </a>
              . We may need to verify your request.
            </li>
          </ul>
        </LegalSection>

        <LegalSection
          id="rights-california"
          title="Your Rights (California — CCPA/CPRA)"
        >
          <p>
            California residents may request disclosure, deletion, and
            correction of personal information, and opt out of certain sharing,
            subject to exceptions. To submit a request, email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . We will verify and respond in line with applicable law.
          </p>
        </LegalSection>

        <LegalSection id="security" title="Data Security">
          <p>
            We use reasonable technical and organizational measures, including
            encryption in transit where appropriate, access controls, and
            monitoring. No method of transmission or storage is completely
            secure.
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
            version will be posted at{" "}
            <a
              href={macwall.legalPrivacy}
              target="_blank"
              rel="noopener noreferrer"
            >
              {macwall.legalPrivacy}
            </a>
            . Material changes may be communicated through the app or website.
            Continued use after updates constitutes acceptance where permitted
            by law.
          </p>
        </LegalSection>

        <LegalSection id="feedback" title="Feedback &amp; Information">
          <p>
            Feedback you provide may be used to improve the product. Information
            in this policy may change without notice apart from the posting
            above. Copyright © {year} {macwall.legalCompanyName}. All rights
            reserved.
            Contact:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . Website:{" "}
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
