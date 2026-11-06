"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Renders its (server-rendered) children except on the listed pathnames.
 * The one client piece of the marketing page end: it reads the pathname,
 * which the layout can't, without turning the footer into client code.
 */
export function HideOnPaths({
  paths,
  children,
}: Readonly<{ paths: readonly string[]; children: ReactNode }>) {
  const pathname = usePathname()
  return paths.includes(pathname) ? null : children
}
