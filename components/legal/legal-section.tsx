import type { ReactNode } from "react"
import {
  legalLinkProse,
  legalSectionBody,
  legalTextPrimary,
} from "@/components/legal/legal-classes"
import { proseH2 } from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"

export {
  legalBulletList,
  legalSectionBody,
} from "@/components/legal/legal-classes"

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
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2
        id={id}
        className={cn(
          proseH2,
          "scroll-mt-[calc(3.25rem+3.5rem+1rem)] sm:scroll-mt-[calc(2.25rem+3.5rem+1rem)] md:scroll-mt-28",
          legalTextPrimary
        )}
      >
        {title}
      </h2>
      <div className={cn(legalSectionBody, legalLinkProse, className)}>
        {children}
      </div>
    </section>
  )
}
