import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { LegalNav } from "@/components/legal/legal-nav"
import { legalLinkProse } from "@/components/legal/legal-classes"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"
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

  return (
    <>
      <JsonLd payload={jsonLd} />
      <MarketingTitleSection className="text-center" aria-labelledby="legal-hub-title">
        <h1 id="legal-hub-title" className={cn(landingPageH1, "md:text-4xl")}>
          Legal
        </h1>
        <p className={cn(landingPageLead, "mx-auto text-center")}>
          Last updated: {macwall.legalEffectiveDate}
        </p>
      </MarketingTitleSection>
      <MarketingBodySection>
        <div className="grid divide-y divide-dashed divide-border lg:grid-cols-[240px_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
          <aside className="p-6 md:sticky md:top-28 md:self-start lg:p-8">
            <LegalNav />
          </aside>
          <div className="min-w-0">
            <div className={cn("space-y-4 px-6 py-8 text-muted-foreground lg:px-8", legalLinkProse)}>
              <p>
                Policies for the {macwall.name} macOS app and website. Questions
                go to{" "}
                <a href={`mailto:${macwall.supportEmail}`}>
                  {macwall.supportEmail}
                </a>
                .
              </p>
            </div>
            <ul className="m-0 grid list-none divide-y divide-dashed divide-border border-t border-dashed border-border p-0 sm:grid-cols-2 sm:divide-x">
              {LEGAL_DOCUMENTS.map((doc) => (
                <li key={doc.slug} className="min-w-0">
                  <Link
                    href={doc.href}
                    className="block h-full bg-card/50 p-6 transition-colors hover:bg-card/80"
                  >
                    <span className="block text-base font-medium text-foreground">
                      {doc.title}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                      {doc.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingBodySection>
    </>
  )
}
