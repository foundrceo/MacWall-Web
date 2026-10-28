import {
  legalArticle,
  legalColumn,
  legalH1,
  legalLinkProse,
} from "@/components/legal/legal-classes"
import { LegalOperatorNotice } from "@/components/legal/legal-entity"
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
 */
export function LegalDocumentShell({
  title,
  intro,
  children,
}: Readonly<{
  title: string
  intro: ReactNode
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
        <LegalOperatorNotice />
        {intro}
        {children}
      </div>
    </article>
  )
}
