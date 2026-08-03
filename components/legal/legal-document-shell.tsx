import { LegalNav } from "@/components/legal/legal-nav"
import { legalArticle, legalLinkProse } from "@/components/legal/legal-classes"
import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import { macwall } from "@/lib/macwall-site"
import {
  proseArticle,
  proseDivider,
  proseHero,
  proseHeroIntro,
  proseHeroTitle,
} from "@/lib/marketing-prose-classes"
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
    <MarketingProseShell
      width="wide"
      mainId="main-content"
      labelledBy={titleId}
      showBottomCta={false}
    >
      <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-28 md:self-start">
          <LegalNav />
        </aside>

        <div className="min-w-0">
          <header className={proseHero}>
            <p className="mb-3 text-sm text-muted-foreground">
              {macwall.legalCompanyName} · Updated {macwall.legalEffectiveDate}
            </p>
            <h1 id={titleId} className={proseHeroTitle}>
              {title}
            </h1>
            <div className={cn(proseHeroIntro, "space-y-4", legalLinkProse)}>
              {intro}
            </div>
          </header>

          <div className={proseDivider} role="presentation" />

          <article className={cn(proseArticle, legalArticle, legalLinkProse)}>
            {children}
          </article>
        </div>
      </div>
    </MarketingProseShell>
  )
}
