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

const doc = legalDocumentBySlug("dmca")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalDmcaPage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} DMCA / Copyright Policy`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} DMCA / Copyright Policy`}
        intro={
          <p>
            {macwall.name} respects intellectual property rights and expects the
            same from users. This policy explains how to report alleged
            copyright infringement and how counter-notices work. Designated
            contact:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
        }
      >
        <LegalSection id="overview" title="Overview">
          <p>
            We respond to valid notices under the U.S. Digital Millennium
            Copyright Act (DMCA) and similar laws. Community uploads and catalog
            items may be removed when a complete notice identifies infringing
            material.
          </p>
        </LegalSection>

        <LegalSection id="notice" title="Filing a Copyright Notice">
          <p>
            Email{" "}
            <a
              href={`mailto:${macwall.supportEmail}?subject=${encodeURIComponent("DMCA Notice: MacWall")}`}
            >
              {macwall.supportEmail}
            </a>{" "}
            with subject line <strong>DMCA Notice: MacWall</strong>. Include:
          </p>
          <ul className={legalBulletList}>
            <li>
              Your full legal name, mailing address if available, telephone
              number, and email address.
            </li>
            <li>
              Identification of the copyrighted work claimed to be infringed (or
              a representative list).
            </li>
            <li>
              Identification of the allegedly infringing material, including a
              URL or enough detail for us to locate it in the App or Site.
            </li>
            <li>
              A statement that you have a good-faith belief the use is not
              authorized by the owner, its agent, or the law.
            </li>
            <li>
              A statement under penalty of perjury that the notice is accurate
              and that you are the owner or authorized to act for the owner.
            </li>
            <li>Your physical or electronic signature.</li>
          </ul>
        </LegalSection>

        <LegalSection id="response" title="Our Response">
          <ul className={legalBulletList}>
            <li>
              We review complete notices promptly. When a notice is valid we
              remove the wallpaper from the App and the Site, whether it came
              from a community submission or was added by us.
            </li>
            <li>Incomplete or abusive notices may be rejected.</li>
          </ul>
          <p>
            This process exists to fix mistakes quickly. It does not make it
            acceptable to upload material without the rights to it: every
            submission must already be the uploader&apos;s own work or covered
            by a license or permission before it is submitted.
          </p>
        </LegalSection>

        <LegalSection id="repeat-infringers" title="Repeat Infringers">
          <p>
            We keep a record of every removal. When an uploader has repeatedly
            submitted infringing material, or has clearly done so on purpose, we
            block the device they submit from: it can no longer send
            submissions, and its other pending submissions are rejected. Because{" "}
            {macwall.name} has no user accounts, blocks apply to the device that
            submitted the material.
          </p>
        </LegalSection>

        <LegalSection id="counter" title="Counter-Notice">
          <p>
            If you believe material was removed by mistake, email{" "}
            <a
              href={`mailto:${macwall.supportEmail}?subject=${encodeURIComponent("DMCA Counter-Notice: MacWall")}`}
            >
              {macwall.supportEmail}
            </a>{" "}
            with subject <strong>DMCA Counter-Notice: MacWall</strong>,
            including your contact details, identification of the material, a
            good-faith statement under penalty of perjury that removal was a
            mistake or misidentification, consent to relevant court
            jurisdiction, and your signature.
          </p>
        </LegalSection>

        <LegalSection id="submitters" title="Submitter Responsibility">
          <p>
            If you submit wallpapers to {macwall.name}, you represent that you
            own the rights or have a license that allows us to host and
            distribute the content through the Service. See also{" "}
            <Link href="/legal/acceptable-use">Acceptable Use</Link>.
          </p>
          <ul className={legalBulletList}>
            <li>
              Do not upload footage from films, TV shows, music videos, video
              games, stock libraries or other artists without written permission
              from the rights holder.
            </li>
            <li>
              Do not use copyrighted characters, logos, brand assets or
              trademarks without a license to do so.
            </li>
            <li>
              Keep a record of any license you rely on for as long as the
              wallpaper stays on {macwall.name}, and share it with us if we ask.
            </li>
            <li>
              If we receive a valid notice about your submission, we remove it
              and may stop accepting uploads from you.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="misuse" title="Misuse of the Process">
          <p>
            Knowingly false DMCA notices or counter-notices may create liability
            under 17 U.S.C. § 512(f) and similar laws. Consult a lawyer if you
            are unsure.
          </p>
        </LegalSection>

        <LegalSection id="agent" title="Designated Copyright Agent">
          <p>
            Copyright Agent, {macwall.legalCompanyName}
            <br />
            {macwall.legalMailingAddress}
            <br />
            Email:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>{" "}
            (subject line &ldquo;DMCA Notice&rdquo;)
          </p>
          <p>
            Email is the fastest route. We review notices promptly and usually
            act within a few business days.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Copyright agent / notices:{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            . © {year} {macwall.name}. Last updated {macwall.legalEffectiveDate}
            .
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
