import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  proseActionRow,
  proseGhostBtn,
} from "@/lib/marketing-prose-classes"
import type { ReactNode } from "react"

export function ProseActionRow({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn(proseActionRow, className)}>{children}</div>
}

export function ProseSecondaryLink({
  href,
  children,
}: Readonly<{ href: string; children: ReactNode }>) {
  return (
    <Link href={href} className={cn(proseGhostBtn, "prose-ghost-btn")}>
      {children}
    </Link>
  )
}
