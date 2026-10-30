import {
  legalArticle,
  legalColumn,
  legalH1,
  legalLinkProse,
} from "@/components/legal/legal-classes"
import { LegalCompanyNotice } from "@/components/legal/legal-entity"
import { LegalSection } from "@/components/legal/legal-section"
import { ReadingProgress } from "@/components/legal/reading-progress"
import { PageMotion } from "@/components/motion/page-motion"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const BODY_ID = "legal-body"

/**
 * Every /legal document, in PostMesh's reading layout: the effective date
 * above a centred title, one column of text with numbered sections, and the
 * right-edge reading progress on large screens. No rails, boxes or sidebar.
 *
 * The company that stands behind the document is named in a closing
 * "Who we are" section, not in the opening lines. Pass `company` to replace
 * its default text (the Terms define the contracting party there).
 */
export function LegalDocumentShell({
  title,
  intro,
  company,
  children,
}: Readonly<{
  title: string
  intro: ReactNode
  company?: ReactNode
  children: ReactNode
}>) {
  return (
    <article className={legalColumn} aria-labelledby="legal-document-title">
      <header className="flex flex-col items-center gap-6 pb-12 text-center sm:pb-16">
        <p className="text-sm text-foreground">
          Effective:{" "}
          <time dateTime={macwall.legalEffectiveDateIso}>
            {macwall.legalEffectiveDate}
          </time>
        </p>
        <h1 id="legal-document-title" className={legalH1}>
          {title}
        </h1>
      </header>
      <ReadingProgress containerId={BODY_ID} />
      <PageMotion />
      <div
        id={BODY_ID}
        data-reveal-root
        className={cn(legalArticle, legalLinkProse)}
      >
        {intro}
        {children}
        <LegalSection id="who-we-are" title="Who We Are">
          {company ?? <LegalCompanyNotice />}
        </LegalSection>
      </div>
    </article>
  )
}
