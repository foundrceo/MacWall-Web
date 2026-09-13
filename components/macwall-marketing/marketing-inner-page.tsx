import type { HTMLAttributes, ReactNode } from "react"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { cn } from "@/lib/utils"

/** Title band used on SaasCN inner pages (`p-4 lg:p-6`). */
export function MarketingTitleSection({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <MarketingSection className={cn("p-4 lg:p-6", className)} {...props}>
      {children}
    </MarketingSection>
  )
}

/** Stretch body under the title band. */
export function MarketingBodySection({
  children,
  className,
  sectionClassName,
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode
  sectionClassName?: string
}) {
  return (
    <MarketingSection
      className={cn("h-full", className)}
      sectionClassName={cn("flex flex-1", sectionClassName)}
      {...props}
    >
      {children}
    </MarketingSection>
  )
}
