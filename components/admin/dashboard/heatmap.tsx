"use client"

/**
 * Activity by weekday and hour: a plain grid, brighter means busier. Rows grow
 * to the height of the panel when it is a flex column (`fillPanel`).
 */

import type { HourlyHeatmapCell } from "@/lib/analytics/admin-metrics"
import { cn } from "@/lib/utils"

import { InlineEmpty } from "./blocks"
import { formatCount } from "./format"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

/** Five steps of one hue; the empty step is the panel's own fill. */
const LEVELS = [
  "bg-fill",
  "bg-blue/25",
  "bg-blue/45",
  "bg-blue/70",
  "bg-blue",
] as const

function levelOf(cell: HourlyHeatmapCell | undefined): number {
  if (!cell || cell.count <= 0) return 0
  if (cell.intensity < 0.25) return 1
  if (cell.intensity < 0.5) return 2
  if (cell.intensity < 0.75) return 3
  return 4
}

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`
}

/** The busiest weekday and hour, or null when nothing was tracked. */
export function busiestCell(
  cells: readonly HourlyHeatmapCell[]
): HourlyHeatmapCell | null {
  let peak: HourlyHeatmapCell | null = null
  for (const cell of cells) {
    if (cell.count > 0 && (!peak || cell.count > peak.count)) peak = cell
  }
  return peak
}

export function HourHeatmap({
  cells,
}: Readonly<{ cells: readonly HourlyHeatmapCell[] }>) {
  const peak = busiestCell(cells)
  if (!peak) {
    return (
      <InlineEmpty className="min-h-[240px] flex-1">
        No activity in this range.
      </InlineEmpty>
    )
  }

  const byKey = new Map(
    cells.map((cell) => [`${cell.dayIndex}:${cell.hour}`, cell])
  )

  return (
    <div className="flex flex-1 flex-col overflow-x-auto">
      <div className="flex min-w-[420px] flex-1 flex-col">
        <div
          role="img"
          aria-label={`Tracked events by weekday and hour in UTC. Busiest: ${peak.dayOfWeek} at ${hourLabel(peak.hour)} with ${formatCount(peak.count)} events.`}
          className="grid flex-1 grid-cols-[2rem_repeat(24,minmax(0,1fr))] grid-rows-[auto_repeat(7,minmax(1.25rem,1fr))] gap-[3px]"
        >
          <span aria-hidden />
          {HOURS.filter((hour) => hour % 3 === 0).map((hour) => (
            <span
              key={hour}
              aria-hidden
              className="col-span-3 pb-1 text-[11px] leading-none text-muted-foreground tabular-nums"
            >
              {String(hour).padStart(2, "0")}
            </span>
          ))}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="contents">
              <span
                aria-hidden
                className="flex items-center text-[11px] text-muted-foreground"
              >
                {day}
              </span>
              {HOURS.map((hour) => {
                const cell = byKey.get(`${dayIndex}:${hour}`)
                return (
                  <span
                    key={hour}
                    aria-hidden
                    title={`${day} ${hourLabel(hour)} UTC · ${formatCount(cell?.count ?? 0)} events`}
                    className={cn("rounded-[3px]", LEVELS[levelOf(cell)])}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
          Less
          {LEVELS.map((level) => (
            <span
              key={level}
              aria-hidden
              className={cn("size-2.5 rounded-[3px]", level)}
            />
          ))}
          More
        </p>
      </div>
    </div>
  )
}
