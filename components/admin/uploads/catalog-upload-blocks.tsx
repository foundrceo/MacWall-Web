"use client"

/**
 * Layout blocks shared by the two publishing tools (bulk catalog upload and
 * static images): a numbered step, the drop zone and the sticky action bar.
 * No upload logic lives here.
 */

import { useId, type DragEvent, type ReactNode } from "react"

import { Spinner, StatusDot, type Tone } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

function StepNumber({ step }: Readonly<{ step: number }>) {
  return (
    <span
      aria-hidden
      className="border-line-strong text-soft mt-px grid size-5 shrink-0 place-items-center rounded-full border text-[11px] leading-none font-medium tabular-nums"
    >
      {step}
    </span>
  )
}

/** One numbered stage of an upload flow, with its content below the heading. */
export function UploadStep({
  step,
  title,
  description,
  actions,
  children,
}: Readonly<{
  step: number
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}>) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <StepNumber step={step} />
          <div className="min-w-0">
            <h2
              id={headingId}
              className="text-[13px] font-medium text-foreground"
            >
              <span className="sr-only">Step {step}: </span>
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 max-w-2xl text-[13px] text-pretty text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/**
 * Dashed drop target that is also the "choose files" button. `disabled` only
 * blocks the click: the drag handlers always run, so a file dropped at the
 * wrong moment is swallowed here instead of navigating the tab away.
 */
export function UploadDropZone({
  icon,
  title,
  activeTitle,
  description,
  active,
  disabled = false,
  busy = false,
  compact = false,
  onChoose,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
}: Readonly<{
  icon: ReactNode
  title: ReactNode
  /** Shown while files are held over the zone. */
  activeTitle: string
  /** Accepted formats and limits. */
  description: ReactNode
  active: boolean
  disabled?: boolean
  busy?: boolean
  /** Shorter, once something is already staged. */
  compact?: boolean
  onChoose: () => void
  onDragEnter: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragLeave: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
}>) {
  return (
    <button
      type="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) onChoose()
      }}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        // Children ignore the pointer so dragging across them does not fire
        // enter/leave pairs.
        "flex w-full items-center rounded-[14px] border border-dashed px-5 text-center transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [&>*]:pointer-events-none",
        compact
          ? "min-h-24 flex-col justify-center gap-3 py-5 sm:flex-row sm:justify-start sm:text-left"
          : "min-h-56 flex-col justify-center gap-4 py-10",
        active
          ? "border-blue bg-blue/8"
          : "border-line-strong hover:bg-fill/60 bg-card",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-fill flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border [&_svg]:size-[18px]",
          active ? "text-blue" : "text-muted-foreground"
        )}
      >
        {busy ? <Spinner className="size-[18px]" /> : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-foreground">
          {active ? activeTitle : title}
        </span>
        <span className="mt-1 block text-[13px] text-pretty text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  )
}

/** Underlined word inside a drop zone title that hints at the click. */
export function BrowseHint({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="decoration-line-strong underline underline-offset-[3px]">
      {children}
    </span>
  )
}

export type UploadCount = {
  label: string
  value: string
  /** Adds a status dot; the label still carries the meaning. */
  tone?: Tone
}

/**
 * The last step: counts on the left, the one primary button on the right and
 * run progress underneath. Sticks to the bottom of the scrolling page so the
 * button stays in reach under a long list.
 */
export function UploadActionBar({
  step,
  title,
  counts,
  note,
  action,
  children,
}: Readonly<{
  step: number
  title: string
  counts: readonly UploadCount[]
  /** One line under the counts, e.g. what happens after the upload. */
  note?: ReactNode
  action: ReactNode
  /** Progress for the current or last run. */
  children?: ReactNode
}>) {
  const headingId = useId()
  return (
    <section
      aria-labelledby={headingId}
      className="border-line-strong bg-raised sticky bottom-3 z-20 rounded-[14px] border shadow-xl shadow-black/50"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <StepNumber step={step} />
          <div className="min-w-0">
            <h2
              id={headingId}
              className="text-[13px] font-medium text-foreground"
            >
              <span className="sr-only">Step {step}: </span>
              {title}
            </h2>
            {counts.length ? (
              <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {counts.map((count) => (
                  <div key={count.label} className="flex items-center gap-1.5">
                    {count.tone ? <StatusDot tone={count.tone} /> : null}
                    <dt className="text-muted-foreground">{count.label}</dt>
                    <dd className="font-medium text-foreground tabular-nums">
                      {count.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {note ? (
              <p className="mt-1 max-w-xl text-xs text-pretty text-muted-foreground">
                {note}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          {action}
        </div>
      </div>
      {children ? (
        <div className="border-t border-border px-4 py-3">{children}</div>
      ) : null}
    </section>
  )
}

/** Mean progress of a run, 0-100, for the overall meter. */
export function overallPercent(values: readonly number[]) {
  if (!values.length) return 0
  const sum = values.reduce((total, value) => total + value, 0)
  return Math.min(100, Math.max(0, Math.round(sum / values.length)))
}
