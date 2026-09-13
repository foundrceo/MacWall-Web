import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function LandingSurface({
  className,
  children,
  hover = true,
}: Readonly<{
  className?: string
  children: ReactNode
  hover?: boolean
}>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-none border-0 bg-transparent shadow-none",
        hover && "transition-colors hover:bg-card/80",
        className
      )}
    >
      {children}
    </div>
  )
}
