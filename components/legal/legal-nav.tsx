"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LEGAL_DOCUMENTS, LEGAL_HUB_HREF } from "@/lib/legal/documents"
import { cn } from "@/lib/utils"

export function LegalNav({
  className,
}: Readonly<{
  className?: string
}>) {
  const pathname = usePathname()

  return (
    <nav aria-label="Legal policies" className={cn("space-y-1", className)}>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Legal
      </p>
      <Link
        href={LEGAL_HUB_HREF}
        className={cn(
          "block rounded-md px-2.5 py-1.5 text-[15px] transition-colors",
          pathname === LEGAL_HUB_HREF
            ? "bg-foreground/8 font-medium text-foreground"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        )}
      >
        Overview
      </Link>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {LEGAL_DOCUMENTS.map((doc) => {
          const active = pathname === doc.href
          return (
            <li key={doc.slug}>
              <Link
                href={doc.href}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-[15px] transition-colors",
                  active
                    ? "bg-foreground/8 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {doc.shortTitle}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
