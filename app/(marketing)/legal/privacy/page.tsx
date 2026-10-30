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

const doc = legalDocumentBySlug("privacy")!

export const metadata: Metadata = legalPageMetadata(doc)

const siteHost = macwall.website.replace(/^https?:\/\//, "")
const support = (
  <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>
)

export default function LegalPrivacyPage() {
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
        company={
          <p>
            The controller responsible for the personal information described
            here is {macwall.legalCompanyName}, which makes and sells{" "}
            {macwall.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;). Contact:{" "}
            {support}.
          </p>
        }
        intro={
          <>
            <p>
              This Privacy Policy explains what information the {macwall.name}{" "}
              macOS app (&ldquo;App&rdquo;) and {siteHost} (&ldquo;Site&rdquo;)
              collect, what we use it for, who receives it, how long we keep it,
              and the choices and rights you have. {macwall.name} has no user
              accounts: most of what we hold is tied to a random install ID, a
              license key or an email address you give us.
            </p>
            <p>
              For privacy requests, email {support}. Related pages:{" "}
              <Link href="/legal/cookies">Cookies</Link>,{" "}
              <Link href="/legal/subprocessors">Subprocessors</Link>,{" "}
              <Link href="/legal/gdpr">GDPR</Link>,{" "}
              <Link href="/legal/ccpa">CCPA</Link>.
            </p>
          </>
        }
      >
        <LegalSection id="site" title="When You Visit the Site">
          <ul className={legalBulletList}>
            <li>
              <strong>Hosting and security logs.</strong> Cloudflare, which
              hosts the Site, processes your IP address, browser user agent and
              request details to deliver pages and protect the Site.
            </li>
            <li>
              <strong>Your country.</strong> We read your approximate country
              from Cloudflare&apos;s location header to show regional prices
              and to decide whether to ask for cookie consent, and keep it in
              the <code>mw_country</code> cookie. If the header is missing when
              you load pricing or start a checkout, our server sends your IP
              address to ipwho.is to look the country up.
            </li>
            <li>
              <strong>Our own site analytics.</strong> For every visitor,
              wherever they are and before any cookie choice, the Site records a
              sample of page views on marketing pages (about 1 in 10) and
              events such as download,
              pricing and checkout clicks in our database (Supabase). Each
              record holds the page path, the referring page, your browser user
              agent, your country and a random session ID kept in your
              browser&apos;s local storage (<code>macwall_analytics_session</code>
              ). Installer downloads are recorded the same way; when no session
              ID is available we use a one-way hash of your IP address and
              browser instead.
            </li>
            <li>
              <strong>Ahrefs Web Analytics</strong> runs on marketing pages for
              every visitor. It sets no cookies and counts visits from your IP
              address, browser and referrer.
            </li>
            <li>
              <strong>Optional analytics and ad measurement.</strong> In the
              EEA, UK and Switzerland these load only after you choose
              &ldquo;Accept all&rdquo;; elsewhere they load by default; and they
              never load in a browser that sends Global Privacy Control. They
              are:
              <ul className={legalBulletList}>
                <li>
                  <strong>PostHog</strong> (product analytics): page views,
                  time on page, clicks on download, pricing and checkout,
                  page-speed measurements (Core Web Vitals), and a recording of
                  the session for about 1 in 10 visits, showing the page layout,
                  scrolling and clicks with all text and form inputs masked.
                  PostHog does not run on the activation, support or admin
                  pages. If you open the Site from a link in the App, the link
                  carries your App install ID (<code>visitor_id</code>) and
                  PostHog connects that visit to the App&apos;s analytics
                  profile.
                </li>
                <li>
                  <strong>Google Analytics, Meta Pixel, TikTok Pixel and X
                  Pixel</strong> on marketing pages (not on legal, docs or
                  learn pages): visits and which ads lead to downloads and
                  purchases. They set their own cookies.
                </li>
                <li>
                  <strong>Affonso</strong>: if you arrive through an affiliate
                  link, a cookie records the referral so the affiliate can be
                  credited.
                </li>
              </ul>
            </li>
            <li>
              <strong>&ldquo;Email me the link&rdquo;.</strong> If you ask for
              the download link by email (for example on a phone), we store
              your email and the wallpaper you were viewing, send the link and
              one reminder a day later.
            </li>
          </ul>
          <p>
            Cookie names, lifetimes and your choices are in our{" "}
            <Link href="/legal/cookies">Cookie Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection id="purchases" title="When You Buy">
          <ul className={legalBulletList}>
            <li>
              <strong>Payment.</strong> Checkout runs on{" "}
              {macwall.paymentProcessor}&apos;s pages. You give your payment
              details, email and billing country (and address where needed)
              to {macwall.paymentProcessor}; card details never reach our
              servers. We receive your email, country, the amount, currency,
              any discount code and {macwall.paymentProcessor}&apos;s payment
              references.
            </li>
            <li>
              <strong>License records.</strong> We create your license key and
              store it with your email, plan, number of Macs, country, payment
              references and, if you started checkout from the App, the install
              ID of that Mac so the App can unlock itself.
            </li>
            <li>
              <strong>Links from the App or our emails</strong> can carry your
              email and install ID to checkout, so the email is filled in and
              the purchase reaches your Mac. We keep them in the{" "}
              <code>mw_lead_email</code> and <code>mw_visitor_id</code> cookies
              for 30 days.
            </li>
            <li>
              <strong>Purchase measurement, sent by our server.</strong> When a
              purchase completes, our server sends:
              <ul className={legalBulletList}>
                <li>
                  to <strong>TikTok</strong> (Events API): a SHA-256 hash of
                  your email, the order value and currency, and, only if you
                  had accepted ad cookies when you started checkout, the TikTok
                  click ID and cookie, your IP address and browser user agent;
                </li>
                <li>
                  to <strong>X</strong> (Conversions API): a SHA-256 hash of
                  your email;
                </li>
                <li>
                  to <strong>PostHog</strong>: your email, the amount,
                  currency, plan, discount code and country, linked to your App
                  install ID when there is one.
                </li>
              </ul>
              These server-side messages are sent for every purchase,
              wherever you are, whatever you chose in the cookie banner and
              whether or not your browser sends Global Privacy Control. A
              hashed email can be matched by TikTok or X to an account you
              have with them.
            </li>
            <li>
              <strong>Affiliate referrals.</strong> If an affiliate referred
              you, the referral ID is attached to your{" "}
              {macwall.paymentProcessor} payment so the affiliate can be
              credited through Affonso.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="app" title="When You Use the App">
          <ul className={legalBulletList}>
            <li>
              <strong>Install ID and device token.</strong> On first launch the
              App creates a random install ID and a device token. They identify
              your Mac for likes, submissions, support chat, the trial and
              analytics, without an account.
            </li>
            <li>
              <strong>Catalog.</strong> Browsing and downloading wallpapers
              sends ordinary requests (with your IP address) to our database
              (Supabase) and media storage (Cloudflare). Likes are stored with
              your install ID.
            </li>
            <li>
              <strong>App analytics (PostHog).</strong> The App sends usage
              events such as launches, onboarding steps, screens viewed,
              wallpapers opened and applied, searches, settings changed, offers
              shown, checkout started, errors and crash reports, together with
              your install ID, app and macOS version, Mac model, chip, memory,
              number of displays and plan. PostHog may estimate a rough
              location from the connection&apos;s IP address. If you start a
              trial, the email you enter is added to the same analytics
              profile. Names of videos you import are never sent. The App does
              not currently have a setting to turn analytics off.
            </li>
            <li>
              <strong>Free trial.</strong> To start the trial, the App sends
              your Mac&apos;s hardware identifier (its platform UUID) to our
              licensing server, which stores only a SHA-256 hash of it so each
              Mac gets one trial. The email you enter is stored with your
              install ID, device token, and app and macOS version, and is used
              for the trial emails described below.
            </li>
            <li>
              <strong>License activation and checks.</strong> When you
              activate Pro, and when the App re-checks your license (about once
              a week), it sends the license key and the hardware identifier;
              the server stores a hash of the identifier to count your Macs.
            </li>
            <li>
              <strong>Community submissions.</strong> If you submit a
              wallpaper, we receive the video or image, its thumbnail, title
              and category, the author name you enter (shown publicly with the
              wallpaper), your rights declaration (whether you made it or have a
              license, and any rights holder, source link, license type and
              permission link you give), the time you declared it, and the
              install ID and device token of the Mac that sent it. We use these
              to review the submission, keep a record of its origin and rights,
              handle copyright notices and, if approved, publish it. To suggest
              a title and category, our server sends OpenAI the thumbnail (not
              the video), the file name and any draft title; see the{" "}
              <Link href="/legal/terms#ai">Terms</Link>.
            </li>
            <li>
              <strong>Support chat.</strong> If you contact us in the App, we
              receive your messages, the name and email you give, screenshots
              you attach, and your Mac model, chip, memory, macOS and app
              version. When your chat goes to a person, the App also attaches a
              diagnostics report: settings, displays, install location,
              license and trial status (with the key masked) and recent App
              logs. Screenshots and diagnostics reports are stored in a storage
              area where anyone who has a file&apos;s exact link can open it;
              the links are long and random and we don&apos;t publish them, but
              they are not password-protected.
            </li>
            <li>
              <strong>Notifications.</strong> If you allow notifications, the
              App registers an Apple push token with us so we can tell you
              about support replies, your submissions and App news.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="music-sync" title="Music Sync and Mac Permissions">
          <ul className={legalBulletList}>
            <li>
              <strong>Automation.</strong> With your permission, Music Sync
              reads the current track (title, artist, album, artwork and
              position) from Apple Music or Spotify. This stays on your Mac,
              except: Spotify artwork is downloaded from Spotify&apos;s
              servers; and when the Lock Screen shows the player or lyrics, the
              App sends the song&apos;s title, artist, album and length to
              LRCLIB (lrclib.net) to find lyrics, and the artist and title to
              Apple&apos;s iTunes Search API when it needs cover art.
            </li>
            <li>
              <strong>System audio.</strong> If you allow it, the App measures
              how loud the music is, on your Mac, so the wallpaper moves on the
              beat. The audio is not recorded, stored or sent anywhere.
            </li>
            <li>
              <strong>Your own videos.</strong> Videos you import stay on your
              Mac and are never uploaded unless you submit them to the catalog.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="emails" title="Emails We Send">
          <ul className={legalBulletList}>
            <li>
              <strong>Purchase emails:</strong> your license key, receipt
              details and anything needed to deliver what you bought.
            </li>
            <li>
              <strong>Trial emails:</strong> when your trial ends, and up to
              two follow-ups over the next week (about the money-back-for-a-video
              program, and a time-limited discount). We sometimes send a
              one-off offer to people who tried {macwall.name} but didn&apos;t
              buy.
            </li>
            <li>
              <strong>Checkout reminders:</strong> if you open checkout with
              an email we know, or type your email into checkout, and don&apos;t
              finish, up to three reminders over about three days, some with a
              discount code.
            </li>
            <li>
              <strong>App update emails</strong> asking customers and trial
              users to update, sometimes with an offer.
            </li>
            <li>
              <strong>&ldquo;Email me the link&rdquo;:</strong> the link and one
              reminder.
            </li>
            <li>
              Every email other than purchase emails has an unsubscribe link
              that works with one click. Unsubscribing never stops purchase or
              license emails. Emails are sent through Resend.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="how-we-use-data" title="Why We Use It">
          <ul className={legalBulletList}>
            <li>Deliver, activate and enforce licenses and the trial.</li>
            <li>Run the catalog, downloads, search, likes and submissions.</li>
            <li>Answer support requests and fix problems.</li>
            <li>Detect fraud, abuse, key sharing and licensing violations.</li>
            <li>
              Understand how the Site and App are used, measure which ads and
              affiliates lead to downloads and purchases, and improve the
              product.
            </li>
            <li>Send the emails described above.</li>
            <li>Keep tax and accounting records and comply with law.</li>
          </ul>
          <p>
            We don&apos;t sell personal information for money and we don&apos;t
            show ads in the App. The Site&apos;s ad pixels and the server-side
            purchase messages above do share information with ad platforms,
            which California law can treat as &ldquo;sharing&rdquo;; see our{" "}
            <Link href="/legal/ccpa">CCPA</Link> page.
          </p>
        </LegalSection>

        <LegalSection id="gdpr-basis" title="Legal Bases (EEA, UK, Switzerland)">
          <ul className={legalBulletList}>
            <li>
              <strong>Contract:</strong> selling and delivering licenses,
              running the trial and the features you turn on (such as Music
              Sync), and answering support.
            </li>
            <li>
              <strong>Legitimate interests:</strong> security and fraud
              prevention, one trial per Mac, App analytics and crash reports,
              our own site analytics and Ahrefs, server-side purchase
              measurement, and reminder and update emails, balanced against
              your rights. You can object at any time.
            </li>
            <li>
              <strong>Consent:</strong> PostHog, Google Analytics, Affonso and
              the ad pixels on the Site. You can withdraw consent at any time.
            </li>
            <li>
              <strong>Legal obligation:</strong> tax and accounting records.
            </li>
          </ul>
          <p>
            More on your rights: <Link href="/legal/gdpr">GDPR</Link>.
          </p>
        </LegalSection>

        <LegalSection id="recipients" title="Who Receives Data">
          <p>
            Service providers that run {macwall.name} for us:{" "}
            {macwall.paymentProcessor} (payments), Supabase (database,
            licensing and storage), Cloudflare (hosting and media), Resend
            (email), PostHog (analytics), OpenAI (title suggestions) and
            Apple (push notifications). Other parties that receive data as
            described above: Google, Meta, TikTok and X (ad measurement),
            Ahrefs (site analytics), Affonso (affiliate referrals), ipwho.is
            (country lookup), LRCLIB, Apple&apos;s iTunes Search API and
            Spotify (Music Sync). The full list with what each one does is on
            our <Link href="/legal/subprocessors">Subprocessors</Link> page. We
            also disclose information when the law requires it, to protect our
            rights or users, or as part of a sale or reorganization of the
            business.
          </p>
        </LegalSection>

        <LegalSection id="retention" title="How Long We Keep It">
          <ul className={legalBulletList}>
            <li>
              <strong>Licenses and purchases:</strong> while your license is
              active and afterward as needed for tax, accounting and fraud
              prevention.
            </li>
            <li>
              <strong>Unfinished checkouts:</strong> a checkout that expires
              unpaid (after one hour) has its pending license record deleted
              automatically, usually within a day. If we had your email for it,
              the email and checkout reference stay on our reminder list until
              you ask us to delete them, so we can send the reminders and
              respect an unsubscribe. {macwall.paymentProcessor} keeps its own
              record of every checkout.
            </li>
            <li>
              <strong>Trial records:</strong> the hashed hardware identifier is
              kept so the same Mac doesn&apos;t get a second trial; the trial
              email is kept until you ask us to delete it.
            </li>
            <li>
              <strong>Community submissions:</strong> while under review or
              published. The record of who submitted a wallpaper, its rights
              declaration and its moderation history is kept after removal so
              we can answer copyright notices and enforce our repeat-infringer
              policy.
            </li>
            <li>
              <strong>Support chats, site analytics and App analytics:</strong>{" "}
              we don&apos;t yet delete these on a fixed schedule. You can ask
              us to delete yours.
            </li>
          </ul>
          <p>
            You can ask us to delete your data at any time by emailing{" "}
            {support}, except what we must keep by law.
          </p>
        </LegalSection>

        <LegalSection id="your-rights" title="Your Rights and Choices">
          <p>
            Wherever you live, you can ask us to access, correct, export or
            delete your personal data, or object to or restrict how we use it.
            Email {support} from the address involved, or include your license
            key, so we can find your data. We
            respond within the time the law requires (one month under GDPR, 45
            days under CCPA) and won&apos;t treat you differently for asking.
            You can also complain to your local data protection authority.
          </p>
          <ul className={legalBulletList}>
            <li>
              Change your cookie choice any time on the{" "}
              <Link href="/legal/cookies#consent">Cookie Policy</Link> page, or
              turn on Global Privacy Control in your browser.
            </li>
            <li>Unsubscribe from any non-purchase email with one click.</li>
            <li>
              Turn off Music Sync, notifications or the macOS permissions in
              the App or System Settings.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="transfers" title="International Transfers">
          <p>
            Most of our providers are based in the United States, and your
            data may be processed there and in other countries where they
            operate. Where the law requires it, we rely on the transfer
            safeguards our providers offer, such as Standard Contractual
            Clauses or the EU-U.S. Data Privacy Framework.
          </p>
        </LegalSection>

        <LegalSection id="security" title="Security">
          <p>
            Traffic to the Site and our servers is encrypted in transit, card
            details are handled only by {macwall.paymentProcessor}, hardware
            identifiers are stored as one-way hashes, and administrative access
            is limited to our own staff. See our{" "}
            <Link href="/legal/security">Security</Link> page. No method of
            transmission or storage is completely secure.
          </p>
        </LegalSection>

        <LegalSection id="children" title="Children">
          <p>
            The App and Site are not directed at children under 13 (or the
            minimum age where you live), and we do not knowingly collect their
            personal information. If you believe we have, email {support} and
            we will delete it.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy. The current version is always at{" "}
            <Link href={doc.href}>{doc.href}</Link> with its effective date, and
            we announce material changes on the Site or in the App.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Privacy questions and requests: {support}. Last updated{" "}
            {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
