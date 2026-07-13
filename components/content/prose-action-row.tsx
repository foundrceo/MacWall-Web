import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

export function ProseActionRow({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div className={cn("MacWallProseActionRow", className)}>{children}</div>
  )
}

export function ProseSecondaryLink({
  href,
  children,
}: Readonly<{ href: string; children: ReactNode }>) {
  return (
    <Link href={href} className="MacWallProseGhostBtn">
      {children}
    </Link>
  )
}
