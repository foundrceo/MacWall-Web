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

const support = (
  <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>
)

export default function LegalSubprocessorsPage() {
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
            These are the outside companies and services that process personal
            data so we can run {macwall.name}, and the other services that
            receive data when you use certain features. What each one gets is
            described in our <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        }
      >
        <LegalSection id="list" title="Service Providers">
          <ul className={legalBulletList}>
            <li>
              <strong>{macwall.paymentProcessor}</strong>: checkout, payments,
              currency conversion, refunds and fraud checks.
            </li>
            <li>
              <strong>Whop and Cashfree Payments</strong>: payment records and
              refunds only, for purchases made while {macwall.paymentProcessor}{" "}
              checkout was paused in October 2026. No new purchases go through
              them.
            </li>
            <li>
              <strong>Supabase</strong>: database, license and trial checks,
              server functions, site analytics, support chat and storage of
              submissions, screenshots and diagnostics reports.
            </li>
            <li>
              <strong>Cloudflare</strong>: website hosting and security, plus
              storage and delivery of wallpaper media and app downloads.
            </li>
            <li>
              <strong>Resend</strong>: sending license, trial, reminder, update
              and support emails.
            </li>
            <li>
              <strong>PostHog</strong>: App analytics and crash reports,
              website analytics and session recordings (with consent where
              required), and purchase events sent by our server.
            </li>
            <li>
              <strong>OpenAI</strong>: suggests a title and category for a
              wallpaper you submit, from one thumbnail image and its file name.
            </li>
            <li>
              <strong>Apple</strong>: push notifications, if you allow them.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="others" title="Other Services That Receive Data">
          <ul className={legalBulletList}>
            <li>
              <strong>Google Analytics, Meta and X</strong>: website analytics
              and ad measurement on marketing pages (with consent where
              required). X also receives a SHA-256 hash of your email when you
              buy.
            </li>
            <li>
              <strong>TikTok</strong>: website ad measurement (with consent
              where required) and, when you buy, a SHA-256 hash of your email
              and the order value, plus click and browser details if you had
              accepted ad cookies.
            </li>
            <li>
              <strong>Ahrefs</strong>: cookieless website analytics on
              marketing pages.
            </li>
            <li>
              <strong>Affonso</strong>: affiliate referral tracking.
            </li>
            <li>
              <strong>ipwho.is</strong>: looks up your country from your IP
              address when our host doesn&apos;t provide it.
            </li>
            <li>
              <strong>LRCLIB, Apple (iTunes Search API) and Spotify</strong>:
              Music Sync looks up lyrics and cover art for the song you are
              playing.
            </li>
            <li>
              <strong>Discord</strong>: our community server, only if you choose
              to join it.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="transfers" title="International Transfers">
          <p>
            Most of these providers are based in the United States and may
            process data in other countries. Where the law requires it, we rely
            on the transfer safeguards they offer, such as Standard Contractual
            Clauses or the EU-U.S. Data Privacy Framework.
          </p>
        </LegalSection>

        <LegalSection id="updates" title="Updates">
          <p>
            We change providers as the product evolves and post changes on this
            page with a new effective date. For questions about a provider,
            email {support}. Last updated {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
