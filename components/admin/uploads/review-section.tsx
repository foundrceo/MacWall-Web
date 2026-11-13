import type { ReactNode } from "react"

/**
 * A titled block inside the submission detail. Blocks stack in a column and
 * are split by hairlines, never boxed.
 */
export function DetailSection({
  title,
  aside,
  children,
}: Readonly<{
  title: string
  /** Sits opposite the title, e.g. a status badge. */
  aside?: ReactNode
  children: ReactNode
}>) {
  return (
    <section className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex min-h-5 items-center justify-between gap-3">
        <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}
