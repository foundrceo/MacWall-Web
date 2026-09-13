import type { HTMLAttributes, ReactNode } from "react"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { cn } from "@/lib/utils"

/** Inner marketing pages: dashed column with SaasCN inner pad. */
export function MarketingRail({
  children,
  className,
  innerClassName,
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode
  innerClassName?: string
}) {
  return (
    <MarketingSection
      className={cn("p-4 lg:p-6", className)}
      innerClassName={innerClassName}
      {...props}
    >
      {children}
    </MarketingSection>
  )
}
