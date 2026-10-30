import type { Metadata } from "next"
import Link from "next/link"
import { PageMotion } from "@/components/motion/page-motion"
import { JsonLd } from "@/components/seo/json-ld"
import {
  legalBulletList,
  legalColumn,
  legalH1,
  legalLinkProse,
} from "@/components/legal/legal-classes"
import { LEGAL_DOCUMENTS, LEGAL_HUB_HREF } from "@/lib/legal/documents"
import { legalHubMetadata } from "@/lib/legal/metadata"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { cn } from "@/lib/utils"

export const metadata: Metadata = legalHubMetadata()

const PAGE_DESCRIPTION = `${macwall.name} legal center: terms, privacy, cookies, refunds, DMCA, GDPR, CCPA, security, and more.`

export default function LegalHubPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: LEGAL_HUB_HREF,
    pageTitle: "Legal",
    headline: `${macwall.name} Legal`,
    description: PAGE_DESCRIPTION,
    dateModifiedIso: macwall.legalEffectiveDateIso,
  })

  // Grouped like PostMesh's "Terms & policies": agreements, then policies, then rights.
  const groups: { title: string; slugs: string[] }[] = [
    { title: "Legal", slugs: ["terms", "privacy", "refund"] },
    {
      title: "Policies",
      slugs: ["acceptable-use", "cookies", "dmca", "security", "subprocessors"],
    },
    { title: "Your privacy rights", slugs: ["gdpr", "ccpa"] },
  ]

  return (
    <>
      <JsonLd payload={jsonLd} />
      <PageMotion />
      <article className={legalColumn} aria-labelledby="legal-hub-title">
        <header className="flex flex-col items-center gap-6 pb-12 text-center sm:pb-16">
          <p className="text-sm text-foreground">
            Effective:{" "}
            <time dateTime={macwall.legalEffectiveDateIso}>
              {macwall.legalEffectiveDate}
            </time>
          </p>
          <h1 id="legal-hub-title" className={legalH1}>
            Terms &amp; policies
          </h1>
        </header>
        <div
          data-reveal-root
          className={cn(
            "flex flex-col gap-6 text-base leading-7 text-ink-2 sm:text-[17px] sm:leading-[1.75]",
            legalLinkProse
          )}
        >
          {groups.map((group, i) => (
            <section
              key={group.title}
              aria-labelledby={`legal-group-${i}`}
              className="contents"
            >
              <h2
                id={`legal-group-${i}`}
                className={cn(
                  "font-display text-2xl leading-8 font-normal tracking-tight text-foreground",
                  i > 0 && "mt-10"
                )}
              >
                {group.title}
              </h2>
              <ul className={legalBulletList}>
                {group.slugs
                  .map((slug) =>
                    LEGAL_DOCUMENTS.find((doc) => doc.slug === slug)
                  )
                  .filter((doc) => doc !== undefined)
                  .map((doc) => (
                    <li key={doc.slug}>
                      <Link href={doc.href}>{doc.title}</Link>:{" "}
                      {doc.description}
                    </li>
                  ))}
              </ul>
            </section>
          ))}

          <h2
            id="company"
            className="mt-10 scroll-mt-24 font-display text-2xl leading-8 font-normal tracking-tight text-foreground"
          >
            Who we are
          </h2>
          <p>
            The company that sells {macwall.name} and stands behind these
            policies is named in our{" "}
            <Link href="/legal/terms#who-we-are">Terms of Service</Link>.
            Payments are processed by {macwall.paymentProcessor}.
          </p>
          <p>
            Questions about these terms or policies? Email{" "}
            <a href={`mailto:${macwall.supportEmail}`}>
              {macwall.supportEmail}
            </a>
            .
          </p>
        </div>
      </article>
    </>
  )
}
