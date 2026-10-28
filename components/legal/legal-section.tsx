import type { ReactNode } from "react"
import { legalH2, legalSectionBody } from "@/components/legal/legal-classes"
import { cn } from "@/lib/utils"

export {
  legalBulletList,
  legalSectionBody,
} from "@/components/legal/legal-classes"

/** A numbered section; the number comes from the CSS counter in the article. */
export function LegalSection({
  id,
  title,
  children,
  className,
}: Readonly<{
  id: string
  title: ReactNode
  children: ReactNode
  /** Override inner wrapper (e.g. pass legalBulletList for list-first sections) */
  className?: string
}>) {
  return (
    <section aria-labelledby={id} className="contents">
      <h2 id={id} className={legalH2}>
        {title}
      </h2>
      <div className={cn(legalSectionBody, className)}>{children}</div>
    </section>
  )
}
