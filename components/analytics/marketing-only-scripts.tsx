"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Skip ad/affiliate pixels on admin, legal, and docs — they burn third-party
 * requests and inflate analytics without conversion value.
 */
function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false
  if (pathname.startsWith("/admin")) return false
  if (pathname.startsWith("/legal")) return false
  if (pathname.startsWith("/docs")) return false
  if (pathname.startsWith("/learn")) return false
  if (pathname.startsWith("/api")) return false
  return true
}

export function MarketingOnlyScripts({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname()
  if (!isMarketingPath(pathname)) return null
  return <>{children}</>
}
