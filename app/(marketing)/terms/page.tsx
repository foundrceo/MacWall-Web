import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalDocumentShell } from "@/components/legal/legal-document-shell"
import { LegalSection, legalBulletList } from "@/components/legal/legal-section"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin, canonicalSitePath } from "@/lib/site-url"

const PAGE_DESCRIPTION = `Terms covering the ${macwall.name} macOS app website, installs, downloads, billing, licensing, acceptable use, and Apple platform policies.`

export const metadata: Metadata = {
  title: "Terms of Use",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/terms") },
  openGraph: {
    title: `Terms of Use · ${macwall.name}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/terms"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms of Use · ${macwall.name}`,
    description: PAGE_DESCRIPTION,
  },
}

const siteHost = macwall.website.replace(/^https?:\/\//, "")

export default function TermsPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/terms",
    pageTitle: "Terms of Use",
    headline: `${macwall.name} Terms of Use`,
    description: PAGE_DESCRIPTION,
    dateModifiedIso: macwall.legalEffectiveDateIso,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        variant="terms"
        intro={
          <>
            <p>
              These Terms of Use (&ldquo;Terms&rdquo;) govern your access to the{" "}
              {macwall.name} macOS application (&ldquo;App&rdquo;) and our website
              at {siteHost} (&ldquo;Site&rdquo;). By using the App or Site, or
              purchasing {macwall.name} Pro, you agree to these Terms.
            </p>
            <p>
              For privacy practices, see our{" "}
              <Link href="/privacy">Privacy Policy</Link>
              . Questions:{" "}
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

      <LegalSection id="license" title="License to the App">
        <p>
          Subject to these Terms, we grant you a personal, non-exclusive,
          non-transferable license to download and run the App on Mac computers
          you control for personal or internal business use.
        </p>
        <p>You may not:</p>
        <ul className={legalBulletList}>
          <li>
            Reverse engineer or attempt to extract source code except where law
            forbids that restriction;
          </li>
          <li>
            Redistribute the App as your own product or misrepresent its origin;
          </li>
          <li>Use the App to violate law or others&apos; rights.</li>
        </ul>
      </LegalSection>

      <LegalSection id="pro" title="Accounts, Eligibility, and Pro">
        <p>
          {macwall.name} Pro is sold through our merchant (Whop). Checkout,
          receipts, refunds, and taxes may also be governed by the
          merchant&apos;s policies. License keys and device limits are set by
          the product you purchase.
        </p>
        <p>
          You agree to provide accurate information and not to share keys beyond
          what your purchase allows.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Content and the Catalog">
        <p>
          Catalog wallpapers and metadata may be owned by us or licensors. Your
          use is limited to what the App permits. Do not scrape, redistribute,
          or commercially exploit catalog assets outside the App.
        </p>
        <p>
          For files you import, you are responsible for having the rights to use
          them on your devices.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable Use">
        <p>You agree not to misuse the service, including by:</p>
        <ul className={legalBulletList}>
          <li>
            Probing, disrupting, or overloading our systems or those of our
            vendors;
          </li>
          <li>Circumventing technical limits, licensing, or security;</li>
          <li>Using the App to harass others or distribute malware.</li>
        </ul>
      </LegalSection>

      <LegalSection id="apple" title="Third-Party Services and Apple">
        <p>
          The App runs on macOS and may use system wallpaper, Lock Screen, or
          related APIs. Apple provides the platform under its own terms. We are
          not responsible for macOS changes that affect how wallpapers behave.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="Disclaimers">
        <p>
          THE APP AND SITE ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM
          IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR
          ERROR-FREE OPERATION.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR SUPPLIERS WILL NOT
          BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
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
          <a
            href={macwall.legalTerms}
            target="_blank"
            rel="noopener noreferrer"
          >
            {macwall.legalTerms}
          </a>{" "}
          with an updated effective date. Continued use after the effective date
          means you accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection id="contact-terms" title="Contact">
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>.
        </p>
        <p>
          Copyright © {year} {macwall.name}. All rights reserved. Last updated{" "}
          {macwall.legalEffectiveDate}.
        </p>
      </LegalSection>
    </LegalDocumentShell>
    </>
  )
}
