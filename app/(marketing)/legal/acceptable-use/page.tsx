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

const doc = legalDocumentBySlug("acceptable-use")!

export const metadata: Metadata = legalPageMetadata(doc)

export default function LegalAcceptableUsePage() {
  const year = new Date().getFullYear()
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: doc.href,
    pageTitle: doc.title,
    headline: `${macwall.name} Acceptable Use Policy`,
    description: doc.description,
    dateModifiedIso: macwall.legalEffectiveDateIso,
    legalHub: true,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <LegalDocumentShell
        title={`${macwall.name} Acceptable Use Policy`}
        intro={
          <p>
            This Acceptable Use Policy explains how you may use the{" "}
            {macwall.name} app, website, catalog, and community submission
            features. It sits alongside our{" "}
            <Link href="/legal/terms">Terms of Service</Link> and{" "}
            <Link href="/legal/dmca">DMCA Policy</Link>.
          </p>
        }
      >
        <LegalSection id="allowed" title="Allowed Use">
          <ul className={legalBulletList}>
            <li>
              Install and use the App on Macs you control within your license
              limits.
            </li>
            <li>
              Browse and set catalog wallpapers as the App permits for personal
              or internal use.
            </li>
            <li>
              Import your own video files when you have the rights to use them.
            </li>
            <li>
              Submit original or properly licensed wallpapers through the
              community submit flow for review.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="prohibited" title="Prohibited Use">
          <ul className={legalBulletList}>
            <li>
              Probe, scrape, disrupt, or overload our systems or those of our
              vendors.
            </li>
            <li>
              Circumvent licensing, device limits, paywalls, or security
              controls.
            </li>
            <li>
              Redistribute catalog media outside the App, or sell MacWall
              content as your own product.
            </li>
            <li>
              Upload or import content you do not have rights to use, including
              ripped films, games, TV, or trademarked brand assets without
              permission.
            </li>
            <li>
              Upload illegal, hateful, harassing, pornographic/NSFW, or malware
              content.
            </li>
            <li>
              Share license keys beyond the Mac limit for your plan, or use
              stolen payment methods.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="enforcement" title="Enforcement">
          <p>
            We may reject submissions, remove content, suspend licenses, or
            block access when this policy is violated. Repeated abuse may lead
            to permanent bans. Report issues to{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            © {year} {macwall.legalCompanyName}. Last updated{" "}
            {macwall.legalEffectiveDate}.
          </p>
        </LegalSection>
      </LegalDocumentShell>
    </>
  )
}
