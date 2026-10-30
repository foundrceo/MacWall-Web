import type { Metadata } from "next"
import Link from "next/link"
import { CookieChoiceReset } from "@/components/consent/ad-consent"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalDocumentShell } from "@/components/legal/legal-document-shell"
import { LegalSection, legalBulletList } from "@/components/legal/legal-section"
import { legalDocumentBySlug } from "@/lib/legal/documents"
import { legalPageMetadata } from "@/lib/legal/metadata"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

const doc = legalDocumentBySlug("cookies")!

export const metadata: Metadata = legalPageMetadata(doc)

const support = (
  <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>
)

export default function LegalCookiesPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Cookie Policy`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Cookie Policy`}
        intro={
          <p>
            This Cookie Policy explains the cookies, browser storage and
            tracking tools {macwall.website} uses, how long they last, and how
            to change your choice. For everything else, see our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        }
      >
        <LegalSection id="what-are-cookies" title="What Are Cookies?">
          <p>
            Cookies are small text files a website stores in your browser.
            Local storage and session storage are similar browser storage;
            session storage is cleared when you close the tab. Pixels are small
            scripts that tell an analytics or ad service you visited a page.
          </p>
        </LegalSection>

        <LegalSection id="consent" title="Your Choice">
          <ul className={legalBulletList}>
            <li>
              <strong>EEA, UK and Switzerland:</strong> PostHog, Google
              Analytics, Affonso and the ad pixels stay off until you choose
              &ldquo;Accept all&rdquo; in the cookie banner. &ldquo;Essential
              only&rdquo; keeps them off. We decide whether to ask from your
              country, or from your browser&apos;s time zone if we don&apos;t
              know it.
            </li>
            <li>
              <strong>Everywhere else</strong> they are on by default and you
              can turn them off below.
            </li>
            <li>
              <strong>Global Privacy Control:</strong> if your browser sends
              it, they never load, wherever you are.
            </li>
            <li>
              <strong>Always on:</strong> essential cookies, our own site
              analytics (with its session ID in local storage) and Ahrefs Web
              Analytics run for every visitor, including before you choose.
            </li>
            <li>
              Your current setting on this device: <CookieChoiceReset />.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="list" title="Our Own Cookies">
          <ul className={legalBulletList}>
            <li>
              <code>mw_country</code> (essential, 30 days): your approximate
              country, to show regional prices.
            </li>
            <li>
              <code>mw_lead_email</code> and <code>mw_visitor_id</code>{" "}
              (functional, 30 days): set when you open checkout from a link
              that carries your email or App install ID, so the email is filled
              in and your license reaches the Mac that started the purchase.
            </li>
            <li>
              <code>mw_ttclid</code> (advertising, 28 days, only with ad
              consent): the TikTok click ID from an ad link, copied into your
              checkout so TikTok can match the purchase to the ad.
            </li>
            <li>
              <code>affonso_referral</code> (affiliate, 30 days, only with
              consent): records which affiliate referred you, so the right
              partner is credited.
            </li>
            <li>
              <code>macwall_admin_session</code>: signs our own staff in to the
              admin area. Never set for customers.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="storage" title="Browser Storage">
          <ul className={legalBulletList}>
            <li>
              <strong>Local storage</strong>, kept until you clear it:{" "}
              <code>mw_cookie_consent</code> (your cookie choice),{" "}
              <code>macwall_analytics_session</code> (a random ID for our own
              site analytics, set for every visitor), whether you have
              downloaded the installer, cached prices and dismissed banners.
            </li>
            <li>
              <strong>Session storage</strong>, cleared when you close the
              tab: campaign tags and ad click IDs from the link you arrived by
              (UTM tags, TikTok, Google and Meta click IDs), whether you
              started or finished a checkout in this visit, and similar
              short-lived flags.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="third-party" title="Third-Party Tools">
          <ul className={legalBulletList}>
            <li>
              <strong>PostHog</strong> (analytics, with consent where
              required): a <code>ph_…_posthog</code> cookie and matching local
              storage, kept up to a year, holding a random ID. It records page
              views, page leaves, clicks on download, pricing and checkout,
              page-speed measurements, and a session recording for about 1 in
              10 visits with all text and inputs masked. It runs on all pages
              except activation, support and admin.
            </li>
            <li>
              <strong>Google Analytics, Meta Pixel, TikTok Pixel and X
              Pixel</strong> (advertising and analytics, with consent where
              required, marketing pages only): they set their own cookies, for
              example <code>_ga</code> (Google), <code>_fbp</code> (Meta) and{" "}
              <code>_ttp</code> (TikTok), with lifetimes set by each company.
            </li>
            <li>
              <strong>Ahrefs Web Analytics</strong> (always on, marketing pages
              only): sets no cookies.
            </li>
            <li>
              <strong>{macwall.paymentProcessor}</strong> sets its own cookies
              on its checkout pages to process your payment and prevent fraud.
            </li>
          </ul>
          <p>
            Legal, docs and learn pages never load the ad pixels. Our server
            also sends purchase information to TikTok, X and PostHog whatever
            your cookie choice; see{" "}
            <Link href="/legal/privacy#purchases">When You Buy</Link>.
          </p>
        </LegalSection>

        <LegalSection id="legal-basis" title="Legal Basis">
          <p>
            Essential and functional cookies rely on our legitimate interest in
            a secure, working site and on what&apos;s needed to deliver your
            purchase. Our own site analytics and Ahrefs rely on legitimate
            interests. PostHog, Google Analytics, Affonso and the ad pixels
            rely on your consent where the law requires it.
          </p>
        </LegalSection>

        <LegalSection id="rights" title="Your Rights">
          <p>
            You can ask to access or delete data collected through cookies,
            and withdraw consent at any time above. California residents can
            opt out of sharing as described on our{" "}
            <Link href="/legal/ccpa">CCPA</Link> page. Email {support}.
          </p>
        </LegalSection>

        <LegalSection id="managing" title="Managing Cookies">
          <p>
            You can also block or delete cookies and storage in your browser
            settings. Blocking essential cookies may break checkout or regional
            pricing.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Questions: {support}. We update this policy when our tools change.
            Last updated {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
