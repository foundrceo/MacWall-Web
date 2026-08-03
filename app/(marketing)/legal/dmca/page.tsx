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
              href={`mailto:${macwall.supportEmail}?subject=${encodeURIComponent("DMCA Notice — MacWall")}`}
            >
              {macwall.supportEmail}
            </a>{" "}
            with subject line <strong>DMCA Notice — MacWall</strong>. Include:
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
              We review complete notices promptly and may remove or disable
              access to the material.
            </li>
            <li>
              Where appropriate, we notify the uploader and may suspend repeat
              infringers.
            </li>
            <li>Incomplete or abusive notices may be rejected.</li>
          </ul>
        </LegalSection>

        <LegalSection id="counter" title="Counter-Notice">
          <p>
            If you believe material was removed by mistake, email{" "}
            <a
              href={`mailto:${macwall.supportEmail}?subject=${encodeURIComponent("DMCA Counter-Notice — MacWall")}`}
            >
              {macwall.supportEmail}
            </a>{" "}
            with subject <strong>DMCA Counter-Notice — MacWall</strong>,
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
            distribute the content through the Service. Do not upload ripped
            films, games, TV, music videos, or brand assets without permission.
            See also <Link href="/legal/acceptable-use">Acceptable Use</Link>.
          </p>
        </LegalSection>

        <LegalSection id="misuse" title="Misuse of the Process">
          <p>
            Knowingly false DMCA notices or counter-notices may create liability
            under 17 U.S.C. § 512(f) and similar laws. Consult a lawyer if you
            are unsure.
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
