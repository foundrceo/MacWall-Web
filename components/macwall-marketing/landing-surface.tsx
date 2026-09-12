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
        "min-w-0 rounded-2xl border-0 bg-[#111] shadow-none",
        hover && "transition-colors hover:bg-[#171717]",
        className
      )}
    >
      {children}
    </div>
  )
}
