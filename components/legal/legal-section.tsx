import type { ReactNode } from "react"
import { legalSectionBody, legalTextPrimary } from "@/components/legal/legal-classes"
import { cn } from "@/lib/utils"

export { legalBulletList, legalSectionBody } from "@/components/legal/legal-classes"

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
    <section aria-labelledby={id}>
      <h2
        id={id}
        className={cn(
          "scroll-mt-[calc(52px+1.5rem)] md:scroll-mt-[calc(52px+2rem)]",
          "text-2xl font-semibold tracking-tight md:text-[28px] md:leading-snug",
          legalTextPrimary
        )}
      >
        {title}
      </h2>
      <div className={cn(legalSectionBody, className)}>{children}</div>
    </section>
  )
}
