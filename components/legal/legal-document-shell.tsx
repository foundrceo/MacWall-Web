import { LegalNav } from "@/components/legal/legal-nav"
import { legalArticle, legalLinkProse } from "@/components/legal/legal-classes"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1 } from "@/components/macwall-marketing/landing-type"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function LegalDocumentShell({
  title,
  intro,
  children,
}: Readonly<{
  title: string
  intro: ReactNode
  children: ReactNode
}>) {
  const titleId = "legal-document-title"

  return (
    <>
      <MarketingTitleSection className="text-center" aria-labelledby={titleId}>
        <h1 id={titleId} className={cn(landingPageH1, "md:text-4xl")}>
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {macwall.legalEffectiveDate}
        </p>
      </MarketingTitleSection>

      <MarketingBodySection>
        <div className="grid divide-y divide-dashed divide-border lg:grid-cols-[240px_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
          <aside className="p-6 md:sticky md:top-28 md:self-start lg:p-8">
            <LegalNav />
          </aside>
          <div className="min-w-0 px-6 py-8 lg:px-8 lg:py-10">
            <div className={cn("mb-8 space-y-4 text-muted-foreground", legalLinkProse)}>
              {intro}
            </div>
            <article className={cn(legalArticle, legalLinkProse)}>{children}</article>
          </div>
        </div>
      </MarketingBodySection>
    </>
  )
}
