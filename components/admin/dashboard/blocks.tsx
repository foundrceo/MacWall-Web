"use client"

/**
 * Plain-HTML data blocks for the dashboard: ranked bars, funnel steps and
 * part-to-whole bars. They are lists with real text, so long labels truncate
 * cleanly and screen readers get the numbers. Time series live in charts.tsx.
 */

import { useState, type ReactNode } from "react"

import {
  SectionHeading,
  StatusDot,
  toneSolid,
  type Tone,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { formatCount, formatPercent, percentOf } from "./format"

/**
 * One titled group of the dashboard. The id is the anchor the section
 * navigation jumps to.
 */
export function DashboardSection({
  id,
  title,
  description,
  actions,
  children,
}: Readonly<{
  id: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}>) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-16 space-y-4"
    >
      <SectionHeading
        title={<span id={`${id}-title`}>{title}</span>}
        description={description}
        actions={actions}
      />
      {children}
    </section>
  )
}

/** Quiet message where a chart or list would be. */
export function InlineEmpty({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <p
      className={cn(
        "flex min-h-24 items-center justify-center px-4 text-center text-[13px] text-pretty text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}

/** The one number that sums a panel up; sits in `PanelHeader` actions. */
export function PanelFigure({
  value,
  label,
}: Readonly<{ value: ReactNode; label?: ReactNode }>) {
  return (
    <p className="flex items-baseline gap-1.5 text-[13px] whitespace-nowrap">
      <span className="font-medium text-foreground tabular-nums">{value}</span>
      {label ? <span className="text-muted-foreground">{label}</span> : null}
    </p>
  )
}

/* -------------------------------------------------------------------------- */
/* Ranked bars                                                                */
/* -------------------------------------------------------------------------- */

export type RankedRow = {
  key: string
  label: string
  value: number
  /** Small trailing note or badge, before the value. */
  detail?: ReactNode
}

/**
 * Top-N list, largest first. The bar behind each row is its size against the
 * biggest row; the share column is its part of the total.
 */
export function RankedList({
  rows,
  total,
  limit = 8,
  empty,
  showShare = true,
  formatValue = formatCount,
  label,
}: Readonly<{
  rows: readonly RankedRow[]
  /** Denominator for the share column; defaults to the sum of `rows`. */
  total?: number
  limit?: number
  empty: string
  showShare?: boolean
  formatValue?: (value: number) => string
  /** Accessible name of the list. */
  label: string
}>) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...rows].sort((a, b) => b.value - a.value)

  if (sorted.length === 0 || sorted.every((row) => row.value <= 0)) {
    return <InlineEmpty>{empty}</InlineEmpty>
  }

  const visible = expanded ? sorted : sorted.slice(0, limit)
  const peak = Math.max(sorted[0].value, 1)
  const sum = total ?? sorted.reduce((acc, row) => acc + row.value, 0)

  return (
    <div>
      <ol aria-label={label} className="space-y-1">
        {visible.map((row) => (
          <li
            key={row.key}
            className="relative flex h-8 items-center gap-3 px-2.5 text-[13px]"
          >
            <span
              aria-hidden
              className="bg-blue/12 absolute inset-y-0 left-0 rounded-md"
              style={{ width: `${Math.max(1, (row.value / peak) * 100)}%` }}
            />
            <span
              className="relative min-w-0 flex-1 truncate text-foreground"
              title={row.label}
            >
              {row.label}
            </span>
            {row.detail ? (
              <span className="relative shrink-0">{row.detail}</span>
            ) : null}
            <span className="relative shrink-0 font-medium text-foreground tabular-nums">
              {formatValue(row.value)}
            </span>
            {showShare ? (
              <span className="relative w-11 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {formatPercent(percentOf(row.value, sum))}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {sorted.length > limit ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="mt-2 text-muted-foreground"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show fewer" : `Show all ${sorted.length}`}
        </Button>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Funnel                                                                     */
/* -------------------------------------------------------------------------- */

export type FunnelStep = {
  label: string
  value: number
  /** Secondary count next to the label, e.g. "1,204 views". */
  hint?: string
  /** Right-hand note, e.g. "42% of previous". Omit on the first step. */
  note?: string
}

/** Steps in order, each bar sized against the largest step. */
export function Funnel({
  steps,
  empty,
  label,
}: Readonly<{ steps: readonly FunnelStep[]; empty: string; label: string }>) {
  if (steps.length === 0 || steps.every((step) => step.value <= 0)) {
    return <InlineEmpty>{empty}</InlineEmpty>
  }
  const peak = Math.max(1, ...steps.map((step) => step.value))
  const hasNotes = steps.some((step) => step.note)

  return (
    <ol aria-label={label} className="space-y-1.5">
      {steps.map((step, index) => (
        <li
          key={step.label}
          className="relative flex h-10 items-center gap-3 px-2.5 text-[13px]"
        >
          <span
            aria-hidden
            className="bg-blue/12 absolute inset-y-0 left-0 rounded-md"
            style={{ width: `${Math.max(1, (step.value / peak) * 100)}%` }}
          />
          <span className="relative w-4 shrink-0 text-xs text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <span className="relative min-w-0 flex-1 truncate text-foreground">
            {step.label}
            {step.hint ? (
              <span className="ml-2 text-xs text-muted-foreground">
                {step.hint}
              </span>
            ) : null}
          </span>
          <span className="relative shrink-0 font-medium text-foreground tabular-nums">
            {formatCount(step.value)}
          </span>
          {hasNotes ? (
            <span className="relative w-14 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {step.note ?? ""}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

/* -------------------------------------------------------------------------- */
/* Part to whole                                                              */
/* -------------------------------------------------------------------------- */

export type Part = { label: string; value: number; tone: Tone }

/** One stacked bar and its legend, for a whole split into at most five parts. */
export function PartBar({
  title,
  parts,
  figure,
  empty,
  className,
}: Readonly<{
  title: string
  parts: readonly Part[]
  /** Takeaway on the right of the title, e.g. "86% positive". */
  figure?: ReactNode
  empty: string
  className?: string
}>) {
  const total = parts.reduce((sum, part) => sum + part.value, 0)

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-[13px] font-medium text-foreground">{title}</h4>
        {figure && total > 0 ? (
          <p className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {figure}
          </p>
        ) : null}
      </div>
      {total > 0 ? (
        <>
          <div
            aria-hidden
            className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full"
          >
            {parts.map((part) =>
              part.value > 0 ? (
                <span
                  key={part.label}
                  className={cn("h-full rounded-full", toneSolid[part.tone])}
                  style={{ flexGrow: part.value, flexBasis: 0 }}
                />
              ) : null
            )}
          </div>
          <dl className="mt-3 space-y-1.5 text-[13px]">
            {parts.map((part) => (
              <div key={part.label} className="flex items-center gap-2">
                <StatusDot tone={part.tone} className="size-1.5" />
                <dt className="text-soft min-w-0 flex-1 truncate">
                  {part.label}
                </dt>
                <dd className="font-medium text-foreground tabular-nums">
                  {formatCount(part.value)}
                </dd>
                <dd className="w-11 text-right text-xs text-muted-foreground tabular-nums">
                  {formatPercent(percentOf(part.value, total))}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="mt-3 text-[13px] text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Chart legend                                                               */
/* -------------------------------------------------------------------------- */

export type LegendItem = {
  label: string
  /** A CSS colour: `var(--chart-1)` and friends. */
  color: string
  dashed?: boolean
}

/** Series key for a chart; only needed when there is more than one series. */
export function Legend({
  items,
  className,
}: Readonly<{ items: readonly LegendItem[]; className?: string }>) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              "w-4 shrink-0 border-t-2",
              item.dashed && "border-dashed opacity-60"
            )}
            style={{ borderColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
