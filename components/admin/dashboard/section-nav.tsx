"use client"

/** Jump links for the dashboard's sections; sticks to the top while scrolling. */

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

/** Ids match the `DashboardSection` each section renders. */
const SECTIONS = [
  { id: "sales", label: "Sales" },
  { id: "recovery", label: "Recovery" },
  { id: "promotions", label: "Promotions" },
  { id: "traffic", label: "Traffic" },
  { id: "live", label: "Right now" },
  { id: "licenses", label: "Licenses" },
  { id: "support", label: "Support" },
  { id: "catalog", label: "Catalog" },
  { id: "services", label: "Services" },
] as const

export function SectionNav() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const visible = new Set<string>()
    // A section is current while it crosses a band under the sticky bar.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        setActive(SECTIONS.find(({ id }) => visible.has(id))?.id ?? null)
      },
      { rootMargin: "-72px 0px -65% 0px" }
    )
    for (const { id } of SECTIONS) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-0 z-10 -mx-4 border-b border-border bg-background px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="-mx-1 flex [scrollbar-width:none] gap-0.5 overflow-x-auto px-1 py-2 [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map(({ id, label }) => {
          const current = active === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "inline-flex h-7 items-center rounded-md px-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current
                    ? "bg-fill-hover text-foreground"
                    : "hover:bg-fill text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
