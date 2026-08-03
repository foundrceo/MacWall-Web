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

const doc = legalDocumentBySlug("terms")!

export const metadata: Metadata = legalPageMetadata(doc)

const siteHost = macwall.website.replace(/^https?:\/\//, "")

export default function LegalTermsPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Terms of Service`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Terms of Service`}
        intro={
          <>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
              the {macwall.name} macOS application (&ldquo;App&rdquo;) and our
              website at {siteHost} (&ldquo;Site&rdquo;). By using the App or
              Site, or purchasing {macwall.name} Pro, you agree to these Terms.
            </p>
            <p>
              Related policies:{" "}
              <Link href="/legal/privacy">Privacy Policy</Link>,{" "}
              <Link href="/legal/acceptable-use">Acceptable Use</Link>,{" "}
              <Link href="/legal/refund">Refund Policy</Link>,{" "}
              <Link href="/legal/dmca">DMCA</Link>. Questions:{" "}
              <a href={`mailto:${macwall.supportEmail}`}>
                {macwall.supportEmail}
              </a>
              .
            </p>
          </>
        }
      >
        <LegalSection id="the-service" title="The Service">
          <p>
            {macwall.name} provides live and video desktop wallpapers, including
            access to an online catalog, local imports, playback controls, and
            optional paid features ({macwall.name} Pro). We may modify, suspend,
            or discontinue features where we give reasonable notice when
            practical.
          </p>
        </LegalSection>

        <LegalSection id="eligibility" title="Eligibility">
          <p>
            The Service is intended for individuals who are at least 13 years
            old (or the minimum age in your region). If you accept these Terms
            for an organization, you confirm you have authority to bind that
            organization.
          </p>
        </LegalSection>

        <LegalSection id="license" title="License to the App">
          <p>
            Subject to these Terms, we grant you a personal, non-exclusive,
            non-transferable license to download and run the App on Mac
            computers you control for personal or internal business use.
          </p>
          <p>You may not:</p>
          <ul className={legalBulletList}>
            <li>
              Reverse engineer or attempt to extract source code except where
              law forbids that restriction;
            </li>
            <li>
              Redistribute the App as your own product or misrepresent its
              origin;
            </li>
            <li>Use the App to violate law or others&apos; rights.</li>
          </ul>
        </LegalSection>

        <LegalSection id="pro" title="Pro Licenses and Payment">
          <p>
            {macwall.name} Pro is sold through our payment processor. Checkout,
            receipts, refunds, and taxes may also be governed by that
            processor&apos;s policies. Pro covers up to{" "}
            {macwall.maxLicensedMacs} personal Macs; Pro Plus covers up to 5.
            Device limits are enforced per license key.
          </p>
          <p>
            You agree to provide accurate information and not to share keys
            beyond the Mac limit for the plan you purchased.
          </p>
          <p>
            We do not offer a general refund policy. Purchases are final except
            in rare cases we approve at our sole discretion — see the{" "}
            <Link href="/legal/refund">Refund Policy</Link>. The creator Reel
            program on <Link href="/creator">/creator</Link> is a separate
            promotional offer with its own conditions.
          </p>
        </LegalSection>

        <LegalSection id="content" title="Content and the Catalog">
          <p>
            Catalog wallpapers and metadata may be owned by us or licensors.
            Your use is limited to what the App permits. Do not scrape,
            redistribute, or commercially exploit catalog assets outside the
            App.
          </p>
          <p>
            For files you import, you are responsible for having the rights to
            use them on your devices. Community submissions must comply with our{" "}
            <Link href="/legal/acceptable-use">Acceptable Use</Link> and{" "}
            <Link href="/legal/dmca">DMCA</Link> policies.
          </p>
        </LegalSection>

        <LegalSection id="acceptable-use" title="Acceptable Use">
          <p>
            You agree not to misuse the service. The full rules live on our{" "}
            <Link href="/legal/acceptable-use">Acceptable Use</Link> page,
            including prohibitions on abuse, circumvention, and infringing
            uploads.
          </p>
        </LegalSection>

        <LegalSection id="apple" title="Third-Party Services and Apple">
          <p>
            The App runs on macOS and may use system wallpaper, Lock Screen, or
            related APIs. Apple provides the platform under its own terms. We
            are not responsible for macOS changes that affect how wallpapers
            behave.
          </p>
        </LegalSection>

        <LegalSection id="disclaimers" title="Disclaimers">
          <p>
            THE APP AND SITE ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
            AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE
            DISCLAIM IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
            UNINTERRUPTED OR ERROR-FREE OPERATION.
          </p>
        </LegalSection>

        <LegalSection id="liability" title="Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR SUPPLIERS WILL
            NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            EXEMPLARY DAMAGES, OR LOST PROFITS, DATA, OR GOODWILL, ARISING FROM
            YOUR USE OF THE APP OR SITE, EVEN IF ADVISED OF THE POSSIBILITY. OUR
            TOTAL LIABILITY FOR CLAIMS RELATING TO THE APP OR SITE IS LIMITED TO
            THE GREATER OF THE AMOUNT YOU PAID FOR {macwall.name.toUpperCase()}{" "}
            PRO IN THE TWELVE (12) MONTHS BEFORE THE CLAIM AND USD $50.
          </p>
          <p>
            Some jurisdictions do not allow certain limitations; in those
            jurisdictions our liability is limited to the fullest extent allowed
            by law.
          </p>
        </LegalSection>

        <LegalSection id="changes-terms" title="Changes to These Terms">
          <p>
            We may update these Terms. We will post the new version on{" "}
            <Link href={doc.href}>{doc.href}</Link> with an updated effective
            date. Continued use after the effective date means you accept the
            revised Terms.
          </p>
        </LegalSection>

        <LegalSection id="contact-terms" title="Contact">
          <p>
            Questions about these Terms:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
          <p>
            Copyright © {year} {macwall.legalCompanyName}. All rights reserved.
            Last updated {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
