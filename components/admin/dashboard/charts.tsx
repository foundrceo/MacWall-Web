"use client"

/**
 * The dashboard's two recharts forms: a line/area chart for anything over
 * time and vertical bars for the seven weekdays. Everything else is a list
 * (see blocks.tsx) or the hour grid (heatmap.tsx).
 */

import type { ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatUsd } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import { InlineEmpty } from "./blocks"
import { formatCompact, formatCount } from "./format"

const GRID = "var(--ad-line)"
const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" } as const
const CHART_BOX = "aspect-auto h-[240px] w-full"

/**
 * `fill` charts take the height their panel has left, so two panels in a row
 * end level. The panel and its body must be flex columns (see `fillPanel`).
 */
export const fillPanel = {
  panel: "flex flex-col",
  body: "flex flex-1 flex-col",
} as const

function ChartFrame({
  fill,
  children,
}: Readonly<{ fill: boolean; children: (className: string) => ReactNode }>) {
  if (!fill) return children(CHART_BOX)
  return (
    <div className="relative min-h-[240px] flex-1">
      {children("absolute inset-0 aspect-auto h-full w-full")}
    </div>
  )
}

/** Same surface as menus and popovers. */
const TOOLTIP_CLASS =
  "min-w-40 gap-2 rounded-[10px] border border-line-strong bg-popover px-3 py-2 text-xs shadow-lg ring-0"

function TooltipRow({
  color,
  dashed = false,
  label,
  value,
}: Readonly<{
  color?: string
  dashed?: boolean
  label: ReactNode
  value: ReactNode
}>) {
  return (
    <div className="flex w-full items-center gap-2">
      {color ? (
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-[2px]",
            dashed && "opacity-50"
          )}
          style={{ backgroundColor: color }}
        />
      ) : null}
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto pl-4 font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Time series                                                                */
/* -------------------------------------------------------------------------- */

export type TrendSeries = {
  /** Key of the value on each point. */
  key: string
  label: string
  /** `var(--chart-1)` … `var(--chart-5)`. */
  color: string
  /** Comparison series: dashed and dimmed, never filled. */
  dashed?: boolean
  /** Key of a per-point note shown after the label in the tooltip. */
  noteKey?: string
}

export type TrendPoint = {
  key: string
  /** Axis tick. */
  label: string
  /** Tooltip heading. */
  title: string
  [series: string]: string | number
}

/**
 * Values over time. One series is drawn as a line over a flat tint; with
 * several, lines only, so they stay comparable.
 */
export function TrendChart({
  data,
  series,
  label,
  empty,
  formatValue = formatCount,
  formatAxis = formatCompact,
  allowDecimals = false,
  fill = false,
}: Readonly<{
  data: readonly TrendPoint[]
  series: readonly TrendSeries[]
  /** Accessible summary of what the chart shows. */
  label: string
  empty: string
  formatValue?: (value: number) => string
  formatAxis?: (value: number) => string
  allowDecimals?: boolean
  fill?: boolean
}>) {
  const hasValues = data.some((point) =>
    series.some((entry) => Number(point[entry.key]) > 0)
  )
  if (!hasValues) {
    return (
      <InlineEmpty className={fill ? "min-h-[240px] flex-1" : "h-[240px]"}>
        {empty}
      </InlineEmpty>
    )
  }

  const config: ChartConfig = Object.fromEntries(
    series.map((entry) => [
      entry.key,
      { label: entry.label, color: entry.color },
    ])
  )
  const solidCount = series.filter((entry) => !entry.dashed).length

  return (
    <ChartFrame fill={fill}>
      {(className) => (
        <ChartContainer
          config={config}
          className={className}
          role="img"
          aria-label={label}
        >
          <AreaChart
            data={data as TrendPoint[]}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={AXIS_TICK}
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={4}
              allowDecimals={allowDecimals}
              tick={AXIS_TICK}
              tickFormatter={formatAxis}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--ad-line-strong)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  className={TOOLTIP_CLASS}
                  labelClassName="text-foreground"
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as TrendPoint | undefined)?.title ??
                    ""
                  }
                  formatter={(value, name, item) => {
                    const entry = series.find(
                      (candidate) => candidate.key === String(item.dataKey)
                    )
                    const note = entry?.noteKey
                      ? (item.payload as TrendPoint | undefined)?.[
                          entry.noteKey
                        ]
                      : undefined
                    return (
                      <TooltipRow
                        color={entry?.color}
                        dashed={entry?.dashed}
                        label={
                          <>
                            {entry?.label ?? name}
                            {note ? ` · ${note}` : null}
                          </>
                        }
                        value={formatValue(Number(value))}
                      />
                    )
                  }}
                />
              }
            />
            {series.map((entry) => (
              <Area
                key={entry.key}
                type="linear"
                dataKey={entry.key}
                name={entry.label}
                stroke={entry.color}
                strokeWidth={entry.dashed ? 1.5 : 1.75}
                strokeOpacity={entry.dashed ? 0.55 : 1}
                strokeDasharray={entry.dashed ? "4 4" : undefined}
                fill={entry.color}
                fillOpacity={!entry.dashed && solidCount === 1 ? 0.08 : 0}
                dot={false}
                activeDot={
                  entry.dashed
                    ? false
                    : { r: 3, strokeWidth: 0, fill: entry.color }
                }
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}

/* -------------------------------------------------------------------------- */
/* Weekdays                                                                   */
/* -------------------------------------------------------------------------- */

export type WeekdayRow = { dayName: string; sales: number; revenue: number }

/** Orders per weekday, Monday first. */
export function WeekdayBars({
  rows,
  label,
  empty,
  fill = false,
}: Readonly<{
  rows: readonly WeekdayRow[]
  label: string
  empty: string
  fill?: boolean
}>) {
  if (!rows.some((row) => row.sales > 0)) {
    return (
      <InlineEmpty className={fill ? "min-h-[240px] flex-1" : "h-[240px]"}>
        {empty}
      </InlineEmpty>
    )
  }

  const config: ChartConfig = {
    sales: { label: "Orders", color: "var(--chart-1)" },
  }

  return (
    <ChartFrame fill={fill}>
      {(className) => (
        <ChartContainer
          config={config}
          className={className}
          role="img"
          aria-label={label}
        >
          <BarChart
            data={rows as WeekdayRow[]}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="dayName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={AXIS_TICK}
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={4}
              allowDecimals={false}
              tick={AXIS_TICK}
              tickFormatter={formatCompact}
            />
            <ChartTooltip
              cursor={{ fill: "var(--ad-fill)" }}
              content={
                <ChartTooltipContent
                  className={TOOLTIP_CLASS}
                  labelClassName="text-foreground"
                  formatter={(value, _name, item) => (
                    <div className="grid w-full gap-1.5">
                      <TooltipRow
                        label="Orders"
                        value={formatCount(Number(value))}
                      />
                      <TooltipRow
                        label="Revenue"
                        value={formatUsd(
                          (item.payload as WeekdayRow | undefined)?.revenue ?? 0
                        )}
                      />
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="sales"
              name="Orders"
              fill="var(--chart-1)"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}
