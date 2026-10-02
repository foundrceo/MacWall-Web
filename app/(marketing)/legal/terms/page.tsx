import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LEGAL_COMPANY_HREF } from "@/components/legal/legal-entity"
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
        <LegalSection id="who-we-are" title="Who We Are">
          <p>
            {macwall.name} is owned and operated by {macwall.legalCompanyName},{" "}
            {macwall.legalCompanyDescriptor} (Delaware file number{" "}
            {macwall.legalCompanyFileNumber}). {macwall.name} is a trade name
            and product of {macwall.legalCompanyName}; it is not a separate
            legal entity. These Terms are an agreement between you and{" "}
            {macwall.legalCompanyName}.
          </p>
          <p>
            When you buy {macwall.name} Pro, the seller is{" "}
            {macwall.legalCompanyName}. Payments are processed by{" "}
            {macwall.paymentProcessor}, so your card statement may show{" "}
            {macwall.paymentProcessor}&apos;s name. Company details, including
            our registered office, are listed under{" "}
            <Link href={LEGAL_COMPANY_HREF}>company information</Link>.
          </p>
        </LegalSection>

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
            old (or the minimum age in your region). If you are under the age of
            majority where you live, a parent or guardian must agree to these
            Terms for you. If you accept these Terms for an organization, you
            confirm you have authority to bind that organization.
          </p>
        </LegalSection>

        <LegalSection id="license" title="License to the App">
          <p>
            Subject to these Terms, we grant you a personal, non-exclusive,
            non-transferable, revocable license to download and run the App on
            Mac computers you control for personal or internal business use. The
            App, the Site, their code, design and our logos are owned by{" "}
            {macwall.legalCompanyName} or its licensors; no other rights are
            granted.
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
            <li>
              Copy, sell, resell, lease, sublicense or distribute the App or a
              license key;
            </li>
            <li>
              Bypass license checks or device limits, or share a license key
              with people outside its Mac limit;
            </li>
            <li>Use the App to violate law or others&apos; rights.</li>
          </ul>
        </LegalSection>

        <LegalSection id="pro" title="Pro Licenses and Payment">
          <p>
            {macwall.name} Pro is sold through our payment processor,{" "}
            <a href={macwall.paymentProcessorUrl}>{macwall.paymentProcessor}</a>
            . Checkout, receipts, refunds, and taxes may also be governed by{" "}
            {macwall.paymentProcessor}&apos;s policies. Each license covers the
            number of personal Macs shown for the pack you buy (Pro covers{" "}
            {macwall.maxLicensedMacs}; larger packs cover more). Device limits
            are enforced per license key.
          </p>
          <p>
            You agree to provide accurate information and not to share keys
            beyond the Mac limit for the plan you purchased.
          </p>
          <p>
            Every license comes with a {macwall.refundWindowDays}-day money-back
            guarantee: email us within {macwall.refundWindowDays} days of
            purchase for a full refund. See the{" "}
            <Link href="/legal/refund">Refund Policy</Link>. The creator Reel
            program on <Link href="/creator">/creator</Link> is a separate
            promotional offer with its own conditions.
          </p>
        </LegalSection>

        <LegalSection id="prices" title="Prices, Taxes and Checkout">
          <p>
            Prices are shown before you pay and are one-time charges: there is
            no subscription and nothing renews automatically. Prices may vary by
            region and may change for future purchases; a change never affects a
            license you already bought.
          </p>
          <p>
            Sales tax, VAT or GST, where they apply, are calculated and
            collected at checkout by {macwall.paymentProcessor} and shown before
            you confirm. Promotional codes apply only as stated and cannot be
            combined unless the offer says so.
          </p>
          <p>
            Your license key is delivered by email immediately after payment and
            is also shown on the activation page. If it does not arrive, email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            from the address you paid with.
          </p>
        </LegalSection>

        <LegalSection id="content" title="Content and the Catalog">
          <p>
            {macwall.name} does not claim ownership of the wallpapers in its
            catalog. Community wallpapers belong to their creators or rights
            holders, who license them to us when they submit them. Some older
            wallpapers were added by {macwall.name} before our current rights
            process and have no recorded source; we are reviewing them and
            remove any whose rights we cannot establish.
          </p>
          <p>
            Your use of catalog wallpapers is limited to what the App permits:
            setting them on Macs you use. Do not scrape, redistribute, or
            commercially exploit catalog wallpapers outside the App. A Pro
            license pays for the App&apos;s features; it does not give you any
            rights in the wallpapers themselves.
          </p>
          <p>
            For files you import, you are responsible for having the rights to
            use them on your devices. Community submissions must comply with our{" "}
            <Link href="/legal/acceptable-use">Acceptable Use</Link> and{" "}
            <Link href="/legal/dmca">DMCA</Link> policies.
          </p>
        </LegalSection>

        <LegalSection id="free-trial" title="Free Trial">
          <p>
            New installs of the App may include a free Pro trial for a limited
            time (currently 24 hours). The trial is free: no payment details are
            collected for it and nothing is charged when it ends. When the trial
            ends, Pro features stop until you buy a license. One trial per Mac;
            we may change or end trial offers at any time.
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
            or permission you have and, where needed, link to it. You also
            confirm that the author name and origin you give are accurate. Do
            not give a misleading author name or origin.
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
            submission; submitting it does not transfer copyright or any other
            ownership to us. When you submit a wallpaper for the public catalog,
            you grant {macwall.legalCompanyName} a non-exclusive, worldwide,
            royalty-free license to host, store, reproduce, resize and
            transcode, display and distribute it through {macwall.name} (the App
            and the Site), including in previews used to show the catalog. We
            show the author name you provide with the wallpaper.
          </p>
          <p>
            <strong>Removal.</strong> You can ask us to remove an approved
            submission at any time by emailing {macwall.supportEmail}; we take
            it out of the catalog within a reasonable time. If we receive a
            valid copyright notice about a submission we remove it, and we stop
            accepting submissions from people who repeatedly upload infringing
            material. See our{" "}
            <Link href="/legal/dmca">DMCA / Copyright Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection id="feedback" title="Feedback">
          <p>
            If you send us ideas or suggestions, we may use them to improve{" "}
            {macwall.name} without any obligation to you.
          </p>
        </LegalSection>

        <LegalSection
          id="trademarks"
          title="Trademarks and Third-Party Content"
        >
          <p>
            Names, characters, logos and brands that appear in wallpaper titles,
            tags or artwork belong to their respective owners. {macwall.name} is
            an independent product and is not affiliated with, sponsored by or
            endorsed by any of them, and no license to their trademarks is
            granted to you.
          </p>
          <p>
            If you own rights in something shown in the catalog and want it
            removed, send a notice under our{" "}
            <Link href="/legal/dmca">DMCA / Copyright</Link> policy or email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . We review every notice and remove infringing material promptly.
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
            by law. Nothing in these Terms limits liability for fraud, gross
            negligence, willful misconduct, death or personal injury caused by
            negligence, or anything else that cannot be limited by law.
          </p>
        </LegalSection>

        <LegalSection id="indemnification" title="Indemnification">
          <p>
            To the extent the law allows, you agree to defend and indemnify{" "}
            {macwall.legalCompanyName} against claims, losses and reasonable
            legal costs arising from your misuse of the App or Site, content you
            submit or import, or your breach of these Terms. This does not apply
            to consumers where local law forbids it.
          </p>
        </LegalSection>

        <LegalSection id="disputes" title="Resolving Problems">
          <p>
            Most problems are solved quickly by email. If something is wrong
            with your purchase or a charge, we encourage you to contact{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            first; we aim to reply within 1 to 2 business days. This does not
            limit any right you have to dispute a charge with your bank or card
            issuer. Either of us may bring an individual claim in a small-claims
            court that has jurisdiction.
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

        <LegalSection id="termination" title="Suspension and Termination">
          <p>
            You can stop using {macwall.name} at any time. We may suspend or
            revoke a license key that was obtained through fraud, a stolen
            payment method, a reversed or charged-back payment, or that is
            shared beyond its Mac limit, and we may suspend access for serious
            or repeated breaches of these Terms. Where reasonable, we will
            contact you first so you can resolve the issue.
          </p>
        </LegalSection>

        <LegalSection id="general" title="General">
          <p>
            These Terms, together with the policies they link to, are the whole
            agreement between you and {macwall.legalCompanyName} about{" "}
            {macwall.name}. If a provision is found unenforceable, the rest
            stays in effect. Not enforcing a provision is not a waiver. You may
            not transfer these Terms or your license without our consent; we may
            transfer them as part of a reorganization or sale of the business.
            Nothing in these Terms limits rights you have under consumer laws
            that cannot be waived by contract.
          </p>
          <p>
            <strong>Updates:</strong> we release updates to fix problems and add
            features; some features may require a current version of the App or
            macOS. &ldquo;Lifetime updates&rdquo; and &ldquo;free updates
            forever&rdquo; mean every update to the App that we release, for as
            long as we develop and distribute it, at no extra charge to your
            license. <strong>Electronic communications:</strong> you agree that
            receipts, license keys and notices may be sent to you by email.{" "}
            <strong>Events outside our control:</strong> we are not responsible
            for delays or failures caused by events beyond our reasonable
            control, such as outages of hosting or payment providers.{" "}
            <strong>Export and sanctions:</strong> you may not use or buy{" "}
            {macwall.name} where U.S. export or sanctions laws prohibit it.
          </p>
        </LegalSection>

        <LegalSection id="changes-terms" title="Changes to These Terms">
          <p>
            We may update these Terms. We will post the new version on{" "}
            <Link href={doc.href}>{doc.href}</Link> with an updated effective
            date, and announce material changes on the Site or in the App.
            Continued use after the effective date means you accept the revised
            Terms. Your use of {macwall.name} is also covered by our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
            <Link href="/legal/cookies">Cookie Policy</Link>.
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
