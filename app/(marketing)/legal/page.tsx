import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalNav } from "@/components/legal/legal-nav"
import { legalLinkProse } from "@/components/legal/legal-classes"
import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import { LEGAL_DOCUMENTS, LEGAL_HUB_HREF } from "@/lib/legal/documents"
import { legalHubMetadata } from "@/lib/legal/metadata"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import {
  proseHero,
  proseHeroIntro,
  proseHeroTitle,
} from "@/lib/marketing-prose-classes"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { cn } from "@/lib/utils"

export const metadata: Metadata = legalHubMetadata()

const PAGE_DESCRIPTION = `${macwall.name} legal center — terms, privacy, cookies, refunds, DMCA, GDPR, CCPA, security, and more.`

export default function LegalHubPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: LEGAL_HUB_HREF,
    pageTitle: "Legal",
    headline: `${macwall.name} Legal`,
    description: PAGE_DESCRIPTION,
    dateModifiedIso: macwall.legalEffectiveDateIso,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <MarketingProseShell
        width="wide"
        mainId="main-content"
        labelledBy="legal-hub-title"
        showBottomCta={false}
      >
        <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="md:sticky md:top-28 md:self-start">
            <LegalNav />
          </aside>

          <div className="min-w-0">
            <header className={proseHero}>
              <p className="mb-3 text-sm text-muted-foreground">
                {macwall.legalCompanyName} · Updated{" "}
                {macwall.legalEffectiveDate}
              </p>
              <h1 id="legal-hub-title" className={proseHeroTitle}>
                Legal
              </h1>
              <div className={cn(proseHeroIntro, "space-y-4", legalLinkProse)}>
                <p>
                  Policies for the {macwall.name} macOS app and website.
                  Questions go to{" "}
                  <a href={`mailto:${macwall.supportEmail}`}>
                    {macwall.supportEmail}
                  </a>
                  .
                </p>
              </div>
            </header>

            <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2">
              {LEGAL_DOCUMENTS.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={doc.href}
                    className="block h-full rounded-xl border border-border/70 bg-background/40 p-5 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.03]"
                  >
                    <span className="block text-base font-semibold text-foreground">
                      {doc.title}
                    </span>
                    <span className="mt-2 block text-[15px] leading-relaxed text-muted-foreground">
                      {doc.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingProseShell>
    </>
  )
}
