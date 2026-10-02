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
              you use our macOS app and website. {macwall.legalCompanyName} is
              responsible for the personal information described here.
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
              processor, {macwall.paymentProcessor}. We do not collect or store
              your full payment card details on our servers. We may receive
              transaction identifiers, license status, and your email for
              fulfillment and support.
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
              <strong>App usage analytics:</strong> The App sends usage events
              (for example app launches, onboarding steps, wallpapers applied
              and errors) to our analytics provider, Mixpanel, linked to a
              pseudonymous install ID. If you enter your email to start a free
              trial, that email is attached to the same analytics profile.
            </li>
            <li>
              <strong>Community submissions:</strong> If you submit a wallpaper
              from the App, we receive the video or image, its thumbnail, title
              and category, the author name you enter (shown publicly with the
              wallpaper), your rights declaration (whether you made it or have a
              license, and any rights holder, source link, license type and
              permission link you give), the time you declared it, and the
              install ID and device token of the Mac that sent it. We use these
              to review the submission, keep a record of its origin and rights,
              handle copyright notices, and, if approved, distribute it in the
              catalog. To suggest a title and category, the App sends the
              thumbnail (not the video) to OpenAI.
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
            <li>Selling personal information.</li>
            <li>
              Advertising inside the App, or using what you do in the App to
              target ads.
            </li>
            <li>
              Re-identifying you from pseudonymous community IDs for marketing.
            </li>
          </ul>
          <p>
            Our marketing website does use ad-measurement pixels (Meta, TikTok,
            X, Google and Whop) to see which ads lead to downloads and
            purchases. Visitors in the EEA, UK and Switzerland are asked first,
            and browsers sending Global Privacy Control never load them. See the{" "}
            <Link href="/legal/cookies">Cookie Policy</Link>.
          </p>
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

        <LegalSection id="emails" title="Emails We Send">
          <ul className={legalBulletList}>
            <li>
              <strong>Purchase emails:</strong> your license key, receipt
              details and anything needed to deliver what you bought.
            </li>
            <li>
              <strong>Reminders:</strong> if you give us your email in the App
              or start a checkout without finishing it, we may send a small
              number of follow-up emails about your trial or that checkout,
              sometimes with a discount code.
            </li>
            <li>
              Every reminder email has an unsubscribe link that works with one
              click. Unsubscribing never affects purchase or license emails.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="retention" title="Data Retention">
          <p>
            We keep license and purchase records for as long as your license is
            active and as required for tax, accounting and fraud-prevention
            obligations. Abandoned checkout records are deleted automatically
            after 14 days. Support emails are kept while needed to help you and
            for a reasonable period afterward. Community submissions are kept
            while they are under review or published; the record of who
            submitted a wallpaper, its rights declaration and its moderation
            history is kept after removal so we can answer copyright notices and
            enforce our repeat-infringer policy. You can ask us to delete your
            data at any time by emailing{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            , except where we must keep it by law.
          </p>
        </LegalSection>

        <LegalSection
          id="your-content"
          title="Catalog Content and Local Imports"
        >
          <p>
            Community wallpapers are licensed to us by the people who submit
            them; older wallpapers that {macwall.name} added are under rights
            review (see our <Link href="/legal/terms#content">Terms</Link>).
            Your license to use the App does not give you ownership of catalog
            media.
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

        <LegalSection id="your-rights" title="Your Rights">
          <p>
            Wherever you live, you can ask us to access, correct, export or
            delete your personal data, or object to or restrict how we use it.
            Email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            and we will respond within the time the law requires (one month
            under GDPR, 45 days under CCPA). You can also complain to your local
            data protection authority.
          </p>
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
