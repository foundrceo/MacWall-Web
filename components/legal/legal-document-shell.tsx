import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import {
  legalArticle,
  legalLinkProse,
} from "@/components/legal/legal-classes"
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
  variant,
  intro,
  children,
}: Readonly<{
  variant: "privacy" | "terms"
  intro: ReactNode
  children: ReactNode
}>) {
  const heading =
    variant === "privacy"
      ? `${macwall.name} Privacy Policy`
      : `${macwall.name} Terms of Use`

  const titleId = "legal-document-title"

  return (
    <MarketingProseShell
      width="article"
      mainId="legal-document-main"
      labelledBy={titleId}
      showBottomCta={false}
    >
      <header className={proseHero}>
        <h1 id={titleId} className={proseHeroTitle}>
          {heading}
        </h1>
        <div className={cn(proseHeroIntro, "space-y-4", legalLinkProse)}>
          {intro}
        </div>
      </header>

      <div className={proseDivider} role="presentation" />

      <article className={cn(proseArticle, legalArticle, legalLinkProse)}>
        {children}
      </article>
    </MarketingProseShell>
  )
}
