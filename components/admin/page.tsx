"use client"

import { useEffect, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const widths = {
  /** Reading and dashboard pages. */
  default: "max-w-[1240px]",
  /** Wide tables and media grids. */
  wide: "max-w-[1560px]",
} as const

/**
 * Every admin screen renders inside one of these. It owns the page title,
 * the description and the actions next to them.
 *
 * - default: a scrolling page with a centred column.
 * - `fill`: the page fills the viewport under a compact header and manages its
 *   own scrolling (inboxes, split views, editors).
 */
export function AdminPage({
  title,
  description,
  actions,
  fill = false,
  width = "default",
  children,
}: Readonly<{
  title: string
  description?: ReactNode
  actions?: ReactNode
  fill?: boolean
  width?: keyof typeof widths
  children: ReactNode
}>) {
  useEffect(() => {
    document.title = `${title} · MacWall Admin`
  }, [title])

  if (fill) {
    return (
      <div className="flex h-full min-h-0 animate-in flex-col duration-200 fade-in-0 motion-reduce:animate-none">
        <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="shrink-0 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="hidden min-w-0 truncate text-[13px] text-muted-foreground sm:block">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mx-auto w-full animate-in px-4 pt-6 pb-16 duration-200 fade-in-0 motion-reduce:animate-none sm:px-6 lg:px-8 lg:pt-8",
        widths[width]
      )}
    >
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      <div className="mt-6">{children}</div>
    </div>
  )
}
