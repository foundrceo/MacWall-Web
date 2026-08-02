import Link from "next/link"
import { proseH2 } from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"

export type HubLinkItem = {
  href: string
  label: string
  description: string
}

/** Grouped index list shared by the /docs and /learn hubs. */
export function HubLinkList({
  title,
  items,
}: Readonly<{ title: string; items: readonly HubLinkItem[] }>) {
  if (items.length === 0) return null

  const headingId = `hub-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

  return (
    <section aria-labelledby={headingId} className="mt-12 first:mt-0">
      <h2 id={headingId} className={cn(proseH2, "mb-5")}>
        {title}
      </h2>
      <ul className="divide-y divide-border border-t border-border">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group block rounded-lg px-1 py-5 no-underline outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="block text-[17px] font-semibold text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors group-hover:decoration-foreground/60 md:text-[19px]">
                {item.label}
              </span>
              <span className="mt-1.5 block text-[16px] leading-[1.55] text-foreground/70">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
