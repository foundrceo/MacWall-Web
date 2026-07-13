import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import {
  legalLinkProse,
  legalTextSecondary,
} from "@/components/legal/legal-classes"
import { macwall } from "@/lib/macwall-site"
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
    >
      <header className="MacWallProseHero">
        <h1 id={titleId} className="MacWallProseHeroTitle">
          {heading}
        </h1>
        <div
          className={cn(
            "MacWallProseHeroIntro mx-auto max-w-[640px] text-left sm:text-center",
            legalTextSecondary,
            legalLinkProse
          )}
        >
          {intro}
        </div>
      </header>

      <div className="MacWallProseDivider" role="presentation" />

      <article
        className={cn(
          "MacWallProseArticle MacWallProseArticle--legal",
          legalLinkProse
        )}
      >
        {children}
      </article>
    </MarketingProseShell>
  )
}
