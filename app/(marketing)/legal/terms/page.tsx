import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalDocumentShell } from "@/components/legal/legal-document-shell"
import { LegalSection, legalBulletList } from "@/components/legal/legal-section"
import { legalDocumentBySlug } from "@/lib/legal/documents"
import { legalPageMetadata } from "@/lib/legal/metadata"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { CHECKOUT_ADDONS, LICENSE_OFFERS } from "@/lib/license/offers.shared"
import { AFFILIATE_COMMISSION_PERCENT } from "@/lib/macwall-affiliate-copy"
import {
  AFFONSO_COOKIE_DURATION_DAYS,
  macwallAffiliatePortalURL,
} from "@/lib/macwall-affiliate"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

const doc = legalDocumentBySlug("terms")!

export const metadata: Metadata = legalPageMetadata(doc)

const siteHost = macwall.website.replace(/^https?:\/\//, "")
const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`
const support = (
  <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>
)

const pro = LICENSE_OFFERS.permanent
const proPlus = LICENSE_OFFERS.permanent_5
const tenMacs = LICENSE_OFFERS.permanent_10
const annual = LICENSE_OFFERS.annual

export default function LegalTermsPage() {
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
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of
              the {macwall.name} macOS application (&ldquo;App&rdquo;) and our
              website at {siteHost} (&ldquo;Site&rdquo;). By using the App or
              Site, or buying a {macwall.name} license, you agree to these
              Terms. Who &ldquo;we&rdquo; are is set out in the last section.
            </p>
            <p>
              Related policies:{" "}
              <Link href="/legal/privacy">Privacy Policy</Link>,{" "}
              <Link href="/legal/acceptable-use">Acceptable Use</Link>,{" "}
              <Link href="/legal/refund">Refund Policy</Link>,{" "}
              <Link href="/legal/dmca">DMCA / Copyright</Link>. Questions:{" "}
              {support}.
            </p>
          </>
        }
        company={
          <>
            <p>
              These Terms are an agreement between you and{" "}
              {macwall.legalCompanyName}, which makes and sells {macwall.name}{" "}
              (&ldquo;we,&rdquo; &ldquo;us&rdquo;).
            </p>
            <p>
              We are the seller of every {macwall.name} license;{" "}
              {macwall.paymentProcessor} processes the payment for us and is not
              the seller. Contact: {support}.
            </p>
          </>
        }
      >
        <LegalSection id="the-service" title="The Service">
          <p>
            {macwall.name} plays live video wallpapers on the Mac desktop, Lock
            Screen and Screen Saver. The App is free to download. It includes
            an online catalog of wallpapers, playback controls and, with a paid
            license (&ldquo;{macwall.name} Pro&rdquo;), the full catalog, your
            own videos as wallpapers and the other Pro features described on
            our <Link href="/pricing">pricing page</Link>.
          </p>
        </LegalSection>

        <LegalSection id="eligibility" title="Eligibility">
          <p>
            You must be at least 13 years old (or the minimum age where you
            live) to use the Service. If you are under the age of majority
            where you live, a parent or guardian must agree to these Terms for
            you and make any purchase. If you accept these Terms for an
            organization, you confirm you can bind it.
          </p>
        </LegalSection>

        <LegalSection id="license-key" title="No Accounts: Your License Key">
          <p>
            {macwall.name} has no user accounts. Your license key is what
            proves your purchase, so keep it private and keep the purchase
            email. When you activate Pro, the key is linked to that Mac using
            an identifier derived from its hardware (we store only a one-way
            hash of it). To move a license, unlink the old Mac in Settings,
            then activate the new one. Anyone who has your key can use your
            Mac slots: tell us at once if it leaks and we can help.
          </p>
        </LegalSection>

        <LegalSection id="license" title="License to the App">
          <p>
            Subject to these Terms, we grant you a personal, non-exclusive,
            non-transferable, revocable license to download and run the App on
            Macs you control, for personal use or internal use in your
            organization. The App, the Site, their code and design, and the{" "}
            {macwall.name} name and logo belong to us or our licensors; no
            other rights are granted.
          </p>
          <p>You may not:</p>
          <ul className={legalBulletList}>
            <li>
              Reverse engineer the App or try to extract its source code,
              except where the law forbids this restriction;
            </li>
            <li>
              Redistribute the App as your own product or misrepresent its
              origin;
            </li>
            <li>
              Copy, sell, resell, lease, sublicense or distribute the App or a
              license key;
            </li>
            <li>
              Bypass license checks, trial limits or device limits, or share a
              key beyond the Macs it covers;
            </li>
            <li>Use the App to break the law or anyone&apos;s rights.</li>
          </ul>
        </LegalSection>

        <LegalSection id="pro" title="Pro Licenses and Prices">
          <p>
            Every license is a one-time payment for permanent Pro access: there
            is no subscription and nothing renews. Licenses differ only in how
            many of your Macs they cover. Current prices:
          </p>
          <ul className={legalBulletList}>
            <li>
              <strong>Pro</strong>, {pro.maxDevices} Macs:{" "}
              {usd(pro.usdCents)}
            </li>
            <li>
              <strong>Pro+</strong>, {proPlus.maxDevices} Macs:{" "}
              {usd(proPlus.usdCents)}
            </li>
            <li>
              <strong>Pro+</strong>, {tenMacs.maxDevices} Macs:{" "}
              {usd(tenMacs.usdCents)}
            </li>
            <li>
              <strong>In India</strong>, the same licenses cost{" "}
              {usd(pro.indiaUsdCents)}, {usd(proPlus.indiaUsdCents)} and{" "}
              {usd(tenMacs.indiaUsdCents)}. We apply these prices when our
              Site detects that you are in India.
            </li>
            <li>
              <strong>Checkout add-ons</strong> (optional): with Pro, 2 more
              Macs for {usd(CHECKOUT_ADDONS.upgradeProPlus.usd)} (India{" "}
              {usd(CHECKOUT_ADDONS.upgradeProPlus.indiaUsd)}), which makes it a{" "}
              {proPlus.maxDevices}-Mac license; with Pro+ for{" "}
              {proPlus.maxDevices} Macs, 5 more Macs for{" "}
              {usd(CHECKOUT_ADDONS.addon5Macs.usd)} (India{" "}
              {usd(CHECKOUT_ADDONS.addon5Macs.indiaUsd)}).
            </li>
          </ul>
          <p>
            The price and what it includes are shown before you pay. We may
            change prices for future purchases; a change never affects a
            license you already bought. &ldquo;Lifetime updates&rdquo; and
            &ldquo;free updates forever&rdquo; mean every update to the App
            that we release, for as long as we develop and distribute it, at no
            extra charge. Some features need a recent version of the App or
            macOS.
          </p>
          <p>
            Your license key is emailed to the address you enter at checkout
            right after payment and is also shown on the activation page. If it
            doesn&apos;t arrive, email {support} from that address.
          </p>
        </LegalSection>

        <LegalSection id="payment" title="Payment, Currency and Taxes">
          <p>
            Payments are processed by {macwall.paymentProcessor}. You enter
            your card or other payment details on {macwall.paymentProcessor}
            &apos;s checkout page: they never pass through or get stored on our
            servers. {macwall.paymentProcessor} is certified to PCI DSS Level
            1, the highest level of the card industry&apos;s security standard.
          </p>
          <p>
            <strong>Currency.</strong> Our prices are set in US dollars.{" "}
            {macwall.paymentProcessor} Checkout may show the price in your
            local currency and charge you in it, converted at{" "}
            {macwall.paymentProcessor}&apos;s exchange rate; the amount and
            currency you will pay are shown before you confirm. Local-currency
            prices on our Site are estimates at a recent exchange rate. Your
            bank may add its own foreign-transaction fees.
          </p>
          <p>
            <strong>Taxes.</strong> We don&apos;t currently add sales tax,
            VAT or GST at checkout: the total shown before you confirm is the
            full amount we charge. If we start collecting tax where the law
            requires it, it will be shown at checkout before you pay.
          </p>
        </LegalSection>

        <LegalSection id="free-trial" title="Free Trial">
          <p>
            New installs of the App include a free 24-hour Pro trial, once per
            Mac. We recognize the Mac by a one-way hash of its hardware
            identifier, so reinstalling the App doesn&apos;t start another
            trial. The trial is free: no payment details are collected for it
            and nothing is charged when it ends, because there is nothing to
            renew. Current versions of the App ask for your email to start
            the trial; the App shows a notice on your Mac about 3 hours before
            the trial ends, and we email you when it has ended. The follow-up
            emails and how to stop them are described in our{" "}
            <Link href="/legal/privacy#emails">Privacy Policy</Link>.
          </p>
          <p>
            When the trial ends, Pro features stop until you buy a license. We
            may change or end the trial offer for future installs.
          </p>
        </LegalSection>

        <LegalSection id="promotions" title="Promotions and Programs">
          <p>
            <strong>Discount codes.</strong> We sometimes offer discount codes,
            for example in the App, in emails after a trial or an unfinished
            checkout, or to our community. A code gives the discount it states
            on the price shown at checkout. One code can be used per purchase
            and codes can&apos;t be combined. A time-limited offer works only
            until the time stated in it; after that, its link may apply a
            smaller standing discount instead. Codes have no cash value and
            can&apos;t be added to a purchase after it is paid. We may end a
            code that is shared publicly or misused.
          </p>
          <p>
            <strong>Money back for a video.</strong> If you buy a license and
            post a public video of {macwall.name} in real use, we refund 50% of
            what you paid when one video reaches{" "}
            {macwall.reelRefundHalfViews.toLocaleString("en-US")} views and
            100% when it reaches{" "}
            {macwall.reelRefundFullViews.toLocaleString("en-US")} views. The
            post must be disclosed as paid (#ad or the platform&apos;s
            paid-partnership label); views must be organic (no bots or paid
            promotion); and views on different posts or platforms don&apos;t
            add up. To claim, email{" "}
            <a href={`mailto:${macwall.reelRefundEmail}`}>
              {macwall.reelRefundEmail}
            </a>{" "}
            with the video link, a screenshot of the view count and your
            purchase email. We verify the claim and refund to your original
            payment method, usually within 48 hours. A 50% refund keeps your
            license active; a 100% refund is a full refund and deactivates the
            license key. We refund what you actually paid, never more. Full
            rules are on <Link href="/creator">/creator</Link>. We may turn
            down claims that look inflated, and we can end this offer at any
            time.
          </p>
          <p>
            <strong>Affiliate program.</strong> Creators and sites can apply to
            promote {macwall.name} through our affiliate program at{" "}
            <a href={macwallAffiliatePortalURL}>
              {macwallAffiliatePortalURL.replace(/^https?:\/\//, "")}
            </a>
            , run on the Affonso platform. We review every application.
            Approved affiliates earn the commission shown on our{" "}
            <Link href="/affiliate">affiliate page</Link> (currently{" "}
            {AFFILIATE_COMMISSION_PERCENT}% of each Pro sale made through their
            link) for purchases made within the tracking window (currently{" "}
            {AFFONSO_COOKIE_DURATION_DAYS} days after the click). Affiliates
            must disclose the relationship in every post and must not use spam,
            misleading claims, fake reviews or their own link for their own
            purchases. We can withhold commission earned in breach of these
            rules, reverse commission on sales that are refunded or charged
            back, and remove an affiliate from the program. Clicks, commissions
            and payouts are shown in the affiliate dashboard. We can change or
            end the program at any time.
          </p>
        </LegalSection>

        <LegalSection id="annual" title="Legacy Annual Plan and Cancellation">
          <p>
            We no longer sell the annual plan ({usd(annual.usdCents)} a year).
            If you bought it while it was offered, it renews automatically each
            year at the price you signed up for until it is cancelled. To
            cancel, email {support} from the address you paid with, at any
            time. We stop the renewal so you are not charged again, and Pro
            stays on until the end of the year you have already paid for, then
            switches off. Your wallpapers and settings stay on your Mac.
          </p>
        </LegalSection>

        <LegalSection id="refunds" title="Refunds and Disputed Charges">
          <p>
            Every license comes with a {macwall.refundWindowDays}-day
            money-back guarantee, and billing errors are fixed at any time. How
            to ask, what is excluded and how long it takes are in our{" "}
            <Link href="/legal/refund">Refund Policy</Link>. A full refund
            deactivates the license key it paid for.
          </p>
          <p>
            If something is wrong with a charge, emailing {support} is usually
            the fastest way to fix it, and we can refund directly. You can also
            dispute a charge with your bank or card issuer at any time. If a
            payment is reversed, the license it paid for may be deactivated,
            the same as after a full refund.
          </p>
        </LegalSection>

        <LegalSection id="eu-uk" title="EU and UK Consumers">
          <p>
            If you live in the EU, EEA or UK and buy as a consumer, you have a
            legal right to withdraw from your purchase within 14 days without
            giving a reason. We don&apos;t ask you to give up that right at
            checkout, so it applies even after you have downloaded, activated
            or used Pro. To withdraw, email {support} within 14 days of the
            purchase with a clear statement and your purchase email or license
            key. We refund the full amount to your original payment method
            within 14 days of hearing from you, and the license key is
            deactivated. This is in addition to our money-back guarantee and
            to any other rights you have if the App is faulty or not as
            described.
          </p>
        </LegalSection>

        <LegalSection id="content" title="Catalog Content">
          <p>
            <strong>Where it comes from.</strong> The catalog includes
            wallpapers submitted by community creators, each with a rights
            declaration and reviewed by a person before publication, and
            wallpapers {macwall.name} added itself from free and community
            sources. For many wallpapers we added, especially older ones, we
            have no record of the original creator or of a license. We do not
            claim to own catalog wallpapers, and we don&apos;t claim any license
            to a wallpaper beyond what its submitter gave us.
          </p>
          <p>
            <strong>What your license covers.</strong> A {macwall.name} license
            pays for the App&apos;s features and access to the catalog inside
            the App. It gives you no ownership of, and no rights in, any
            wallpaper. You may display catalog wallpapers only through the App,
            on Macs you use, for personal, non-commercial purposes. You may not
            download, extract, screen-record for reuse, copy, redistribute,
            sell or sublicense them, use them in other products, or use them to
            train AI models. Showing {macwall.name} itself in use, such as in a
            video for the program above, is fine.
          </p>
          <p>
            <strong>Removal.</strong> Rights holders can ask us to remove any
            wallpaper through our{" "}
            <Link href="/legal/dmca">DMCA / Copyright</Link> process or by
            emailing {support}. We remove wallpapers when a rights holder asks
            or when we can&apos;t establish the rights to them, and we may
            remove or change any wallpaper at any time. The catalog changes
            over time, and we don&apos;t promise that a particular wallpaper
            will stay available.
          </p>
        </LegalSection>

        <LegalSection id="submissions" title="Community Submissions">
          <p>
            You can submit wallpapers for the public {macwall.name} catalog from
            the App. You may submit a wallpaper only if:
          </p>
          <ul className={legalBulletList}>
            <li>
              you created it yourself and hold the rights needed to publish it;
              or
            </li>
            <li>
              you have permission or a license that allows you to publish and
              distribute it through {macwall.name}.
            </li>
          </ul>
          <p>
            Every submission includes a rights declaration: you choose which of
            these applies, and if it is the second, you name the original
            creator or rights holder, link the source, say what kind of license
            or permission you have and, where needed, link to it. You confirm
            that the declaration, the author name and the origin you give are
            true. Footage from films, TV, games, music videos, stock libraries
            or other artists, and characters, logos or brands you don&apos;t
            have a license for, are not allowed.
          </p>
          <p>
            <strong>Review before publication.</strong> Every submission starts
            as pending and is reviewed by a person before it can appear in the
            catalog. Nothing is published automatically. We may ask you for more
            information, and we may reject or later remove a submission when its
            rights, source, safety, quality or compliance with our policies
            cannot be established.
          </p>
          <p>
            <strong>Ownership and license.</strong> You keep ownership of your
            submission. When you submit a wallpaper for the public catalog, you
            grant us a non-exclusive, worldwide, royalty-free license to host,
            store, reproduce, resize and transcode, display and distribute it
            through {macwall.name} (the App and the Site), including in previews
            used to show the catalog, for as long as it stays in the catalog. We
            show the author name you provide with the wallpaper.
          </p>
          <p>
            <strong>Removal and repeat infringers.</strong> You can ask us to
            remove an approved submission at any time by emailing {support}; we
            take it out of the catalog within a reasonable time. If we receive
            a valid copyright notice about a submission we remove it, and we
            block the Mac that repeatedly submits infringing material from
            submitting again. See our{" "}
            <Link href="/legal/dmca">DMCA / Copyright Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection id="imports" title="Your Own Videos">
          <p>
            Videos you import from your own files stay on your Mac. You are
            responsible for having the rights to use them.
          </p>
        </LegalSection>

        <LegalSection id="ai" title="AI Features">
          <p>
            When you submit a wallpaper, the App can suggest a title and
            category. To do that, our server sends OpenAI one thumbnail image
            from your video (never the video), its file name and any draft
            title, and OpenAI returns a suggestion. We send these requests with
            OpenAI&apos;s response storage turned off, and OpenAI states that
            it does not train its models on data sent through its API by
            default. Suggestions can be wrong or can name a brand, character or
            person in the image: check them before you submit. A suggestion
            never means that you, we or anyone else has the rights to what it
            names.
          </p>
        </LegalSection>

        <LegalSection id="feedback" title="Feedback">
          <p>
            If you send us ideas or suggestions, we may use them to improve{" "}
            {macwall.name} without any obligation to you.
          </p>
        </LegalSection>

        <LegalSection id="trademarks" title="Trademarks and Third-Party Names">
          <p>
            Names, characters, logos and brands that appear in wallpaper titles,
            tags or artwork belong to their owners. {macwall.name} is an
            independent product and is not affiliated with, sponsored by or
            endorsed by any of them, or by Apple, Spotify or{" "}
            {macwall.paymentProcessor}. No license to their trademarks is
            granted to you.
          </p>
        </LegalSection>

        <LegalSection id="acceptable-use" title="Acceptable Use">
          <p>
            You agree not to misuse the Service. The full rules are in our{" "}
            <Link href="/legal/acceptable-use">Acceptable Use Policy</Link>,
            including bans on abuse, circumvention and infringing uploads.
          </p>
        </LegalSection>

        <LegalSection id="third-parties" title="Third-Party Services and Apple">
          <p>
            The App runs on macOS and uses Apple&apos;s wallpaper, Lock Screen
            and related system features, which Apple provides under its own
            terms. Music Sync reads the current track from Apple Music or
            Spotify with your permission and uses outside services to find
            artwork and lyrics, as described in our{" "}
            <Link href="/legal/privacy#music-sync">Privacy Policy</Link>. Our
            Discord community is run under Discord&apos;s terms. We are not
            responsible for third-party services or for macOS changes that
            affect how wallpapers behave.
          </p>
        </LegalSection>

        <LegalSection id="availability" title="Availability and Changes">
          <p>
            The catalog, license checks (Pro checks your license online about
            once a week) and the trial depend on our servers. We work to keep
            them running but don&apos;t promise the Service will be
            uninterrupted or error-free. We may add, change or remove features
            and wallpapers; we will give reasonable notice of significant
            changes to paid features when we can.
          </p>
        </LegalSection>

        <LegalSection id="termination" title="Suspension and Termination">
          <p>
            You can stop using {macwall.name} at any time. We may suspend or
            revoke a license key that was obtained through fraud or a stolen
            payment method, whose payment was refunded or reversed, or that is
            shared beyond its Mac limit, and we may suspend access for serious
            or repeated breaches of these Terms. Where reasonable, we will
            contact you first so you can resolve the issue.
          </p>
        </LegalSection>

        <LegalSection id="sanctions" title="Sanctions, Export and Local Laws">
          <p>
            You may not use or buy {macwall.name} if you are located in, or
            ordinarily resident in, a comprehensively sanctioned country or
            region (currently Cuba, Iran, North Korea, Syria, and the Crimea,
            Donetsk and Luhansk regions of Ukraine), or if you are on, or owned
            or controlled by someone on, a U.S., UK, EU or UN restricted-party
            list. Paid licenses are not offered to people or organizations in
            Russia or Belarus. You are responsible for following the laws that
            apply to you where you use the Service.
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
            IN THE TWELVE (12) MONTHS BEFORE THE CLAIM AND USD $50.
          </p>
          <p>
            Some jurisdictions do not allow certain limitations; in those
            jurisdictions our liability is limited to the fullest extent allowed
            by law. Nothing in these Terms limits liability for fraud, gross
            negligence, willful misconduct, death or personal injury caused by
            negligence, or anything else that cannot be limited by law.
          </p>
        </LegalSection>

        <LegalSection id="indemnification" title="Indemnification">
          <p>
            To the extent the law allows, you agree to defend and indemnify us
            against claims, losses and reasonable legal costs arising from your
            misuse of the App or Site, content you submit or import, or your
            breach of these Terms. This does not apply to consumers where local
            law forbids it.
          </p>
        </LegalSection>

        <LegalSection id="disputes" title="Resolving Problems">
          <p>
            Most problems are solved quickly by email: write to {support} and
            we aim to reply within 1 to 2 business days. This never limits your
            right to dispute a charge with your bank or card issuer. Either of
            us may bring an individual claim in a small-claims court that has
            jurisdiction.
          </p>
        </LegalSection>

        <LegalSection id="governing-law" title="Governing Law">
          <p>
            These Terms are governed by the laws of the State of Delaware, USA,
            without regard to its conflict-of-laws rules. Courts located in
            Delaware have jurisdiction over disputes arising from these Terms,
            except where the law of the country you live in gives you the right
            to bring a claim in your local courts. Nothing in these Terms limits
            consumer rights that cannot be waived under the law that applies to
            you.
          </p>
        </LegalSection>

        <LegalSection id="general" title="General">
          <p>
            These Terms, together with the policies they link to, are the whole
            agreement between you and us about {macwall.name}. If a provision
            is found unenforceable, the rest stays in effect. Not enforcing a
            provision is not a waiver. You may not transfer these Terms or your
            license without our consent; we may transfer them as part of a
            reorganization or sale of the business. You agree that receipts,
            license keys and notices may be sent to you by email. We are not
            responsible for delays or failures caused by events beyond our
            reasonable control, such as outages of hosting or payment providers.
          </p>
        </LegalSection>

        <LegalSection id="changes-terms" title="Changes to These Terms">
          <p>
            We may update these Terms. We will post the new version on{" "}
            <Link href={doc.href}>{doc.href}</Link> with a new effective date,
            and announce material changes on the Site or in the App. Changes
            apply from the effective date and never change the terms of a
            purchase you already made. Continued use after the effective date
            means you accept the revised Terms.
          </p>
        </LegalSection>

        <LegalSection id="contact-terms" title="Contact">
          <p>
            Questions about these Terms: {support}. Last updated{" "}
            {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
