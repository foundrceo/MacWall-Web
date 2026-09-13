import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Full-width marketing canvas. Section rails own the dashed column. */
export function MarketingPageFrame({
  children,
  className,
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  return <div className={cn("marketing-page", className)}>{children}</div>
}
