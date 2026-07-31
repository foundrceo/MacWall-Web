"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

/* Shared visual language ---------------------------------------------------- */

const C = {
  blue: "#0071e3",
  green: "#17b26a",
  amber: "#f79009",
  violet: "#7a5af8",
  red: "#f04438",
  cyan: "#06aed4",
  pink: "#ee46bc",
  slate: "#98a2b3",
  grid: "#e4e7ec",
  cursor: "#f2f4f7",
  muted: "#667085",
  fg: "#101828",
} as const

const SERIES_COLORS = [
  C.blue,
  C.green,
  C.amber,
  C.violet,
  C.pink,
  C.cyan,
  C.red,
  C.slate,
]

const CHART_HEIGHT = "aspect-auto h-[260px] w-full"
const TOOLTIP_CLASS =
  "rounded-lg border border-[#e4e7ec] bg-white text-[13px] shadow-[0_8px_24px_-6px_rgba(16,24,40,0.12)] ring-0"

const axisTick = { fill: C.muted, fontSize: 11 } as const

function ChartEmpty({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-canvas)]">
      <p className="text-[13px] text-[var(--admin-muted)]">{message}</p>
    </div>
  )
}

function formatDayTick(day: string) {
  const date = new Date(`${day}T12:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function compact(value: number) {
  return value >= 10_000
    ? `${Math.round(value / 1000)}k`
    : value.toLocaleString()
}

function lastNDays<T extends { day: string }>(rows: T[], days: number) {
  return [...rows].sort((a, b) => a.day.localeCompare(b.day)).slice(-days)
}

/* Daily activity ------------------------------------------------------------ */

type EventCountKey =
  | "page_view"
  | "download_click"
  | "download_redirect"
  | "pricing_click"
  | "cta_click"
  | "purchase_complete"

type DailySeriesRow = { day: string; label: string } & Partial<
  Record<EventCountKey, number>
>

const EVENT_COUNT_KEYS: EventCountKey[] = [
  "page_view",
  "download_click",
  "download_redirect",
  "pricing_click",
  "cta_click",
  "purchase_complete",
]

function isEventCountKey(name: string): name is EventCountKey {
  return (EVENT_COUNT_KEYS as string[]).includes(name)
}

const dailyActivityConfig = {
  page_view: { label: "Page views", color: C.blue },
  download_click: { label: "Download clicks", color: C.green },
  download_redirect: { label: "Redirects", color: C.cyan },
  pricing_click: { label: "Pricing clicks", color: C.amber },
  cta_click: { label: "CTA clicks", color: C.violet },
  purchase_complete: { label: "Purchases", color: C.pink },
} satisfies ChartConfig

export function DailyActivityChart({
  rows,
  days = 14,
}: Readonly<{
  rows: Array<{ day: string; event_name: string; count: number }>
  days?: number
}>) {
  const byDay = new Map<string, DailySeriesRow>()
  for (const row of rows) {
    const bucket = byDay.get(row.day) ?? {
      day: row.day,
      label: formatDayTick(row.day),
    }
    if (isEventCountKey(row.event_name)) {
      bucket[row.event_name] = (bucket[row.event_name] ?? 0) + row.count
    }
    byDay.set(row.day, bucket)
  }
  const data = lastNDays([...byDay.values()], days)
  const keys = EVENT_COUNT_KEYS.filter((key) =>
    data.some((row) => (row[key] ?? 0) > 0)
  )

  if (data.length === 0 || keys.length === 0) {
    return <ChartEmpty message="No activity in this range." />
  }

  return (
    <ChartContainer config={dailyActivityConfig} className={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {keys.map((key) => (
            <linearGradient
              key={key}
              id={`fill-${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.28}
              />
              <stop
                offset="100%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.02}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={24}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={42}
          tick={axisTick}
          tickFormatter={compact}
        />
        <ChartTooltip
          cursor={{ stroke: C.grid, strokeWidth: 1 }}
          content={
            <ChartTooltipContent className={TOOLTIP_CLASS} indicator="dot" />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {keys.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId="events"
            stroke={`var(--color-${key})`}
            fill={`url(#fill-${key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}

/* Download activity --------------------------------------------------------- */

const downloadActivityConfig = {
  clicks: { label: "Download clicks", color: C.green },
  redirects: { label: "Installer redirects", color: C.blue },
} satisfies ChartConfig

export function DownloadActivityChart({
  rows,
  days = 14,
}: Readonly<{
  rows: Array<{ day: string; event_name: string; count: number }>
  days?: number
}>) {
  const byDay = new Map<
    string,
    { day: string; label: string; clicks: number; redirects: number }
  >()
  for (const row of rows) {
    const bucket = byDay.get(row.day) ?? {
      day: row.day,
      label: formatDayTick(row.day),
      clicks: 0,
      redirects: 0,
    }
    if (row.event_name === "download_click") bucket.clicks += row.count
    else if (row.event_name === "download_redirect")
      bucket.redirects += row.count
    byDay.set(row.day, bucket)
  }
  const data = lastNDays([...byDay.values()], days)

  if (
    data.length === 0 ||
    data.every((r) => r.clicks === 0 && r.redirects === 0)
  ) {
    return <ChartEmpty message="No download activity in this range." />
  }

  return (
    <ChartContainer config={downloadActivityConfig} className={CHART_HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={24}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={42}
          tick={axisTick}
          tickFormatter={compact}
        />
        <ChartTooltip
          cursor={{ fill: C.cursor }}
          content={
            <ChartTooltipContent className={TOOLTIP_CLASS} indicator="dot" />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="clicks"
          fill="var(--color-clicks)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="redirects"
          fill="var(--color-redirects)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ChartContainer>
  )
}

/* Ranked list — replaces the old horizontal bar chart with a denser,
 * easier-to-scan progress list. */

export function RankedBarList({
  rows,
  formatLabel,
  max = 8,
  color = C.blue,
  emptyMessage = "No data for this period.",
}: Readonly<{
  rows: Array<{ label: string; value: number }>
  formatLabel?: (label: string) => string
  max?: number
  color?: string
  emptyMessage?: string
}>) {
  const visible = rows
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, max)

  if (visible.length === 0) return <ChartEmpty message={emptyMessage} />

  const peak = Math.max(...visible.map((row) => row.value), 1)

  return (
    <ul className="space-y-2.5">
      {visible.map((row) => (
        <li key={row.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[13px] text-[var(--admin-fg-soft)]">
              {formatLabel ? formatLabel(row.label) : row.label}
            </span>
            <span className="shrink-0 text-[13px] font-semibold text-[var(--admin-fg)] tabular-nums">
              {row.value.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-fill)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.max(2, (row.value / peak) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function TopPagesList({
  rows,
}: Readonly<{ rows: Array<{ path: string; count: number }> }>) {
  return (
    <RankedBarList
      rows={rows.map((row) => ({ label: row.path, value: row.count }))}
      color={C.violet}
      emptyMessage="No page views in this range."
    />
  )
}

export function EventsSummaryList({
  rows,
}: Readonly<{ rows: Array<{ label: string; value: number }> }>) {
  return (
    <RankedBarList
      rows={rows.map((row) => ({
        label: row.label.replaceAll("_", " "),
        value: row.value,
      }))}
      max={10}
      emptyMessage="No events in this range."
    />
  )
}

/* Radial gauges -------------------------------------------------------------- */

function Gauge({
  percent,
  color,
  center,
  caption,
}: Readonly<{
  percent: number
  color: string
  center: (cx: number, cy: number) => React.ReactElement
  caption?: string
}>) {
  const config = { value: { label: "value", color } } satisfies ChartConfig

  return (
    <div className="flex flex-col items-center">
      <ChartContainer
        config={config}
        className="mx-auto aspect-auto h-[168px] w-[168px]"
      >
        <RadialBarChart
          data={[{ name: "value", value: percent, fill: color }]}
          startAngle={90}
          endAngle={-270}
          innerRadius={62}
          outerRadius={82}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="fill-[#f2f4f7]"
          />
          <RadialBar dataKey="value" background cornerRadius={9} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                  return null
                return center(viewBox.cx ?? 0, viewBox.cy ?? 0)
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      {caption ? (
        <p className="-mt-1 text-xs text-[var(--admin-muted)]">{caption}</p>
      ) : null}
    </div>
  )
}

export function RingGauge({
  value,
  max = 100,
  caption,
  color = C.blue,
  className,
}: Readonly<{
  value: number
  max?: number
  caption?: string
  color?: string
  className?: string
}>) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className={cn("flex justify-center", className)}>
      <Gauge
        percent={pct}
        color={color}
        caption={caption}
        center={(cx, cy) => (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
            <tspan
              x={cx}
              y={cy}
              className="fill-[#101828] text-[28px] font-semibold"
            >
              {Math.round(pct)}%
            </tspan>
          </text>
        )}
      />
    </div>
  )
}

export function StatRing({
  value,
  max,
  caption,
  color = C.blue,
}: Readonly<{
  value: number
  max?: number
  caption?: string
  color?: string
}>) {
  const ringMax = max && max > 0 ? max : Math.max(value, 1)
  return (
    <div className="flex justify-center">
      <Gauge
        percent={Math.min(100, (value / ringMax) * 100)}
        color={color}
        caption={caption}
        center={(cx, cy) => (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
            <tspan
              x={cx}
              y={cy - 5}
              className="fill-[#101828] text-[22px] font-semibold"
            >
              {value.toLocaleString()}
            </tspan>
            <tspan x={cx} y={cy + 15} className="fill-[#667085] text-[11px]">
              of {ringMax.toLocaleString()}
            </tspan>
          </text>
        )}
      />
    </div>
  )
}

/* Category donut ------------------------------------------------------------- */

export function CategoryDonut({
  rows,
}: Readonly<{ rows: Array<{ label: string; value: number }> }>) {
  const sorted = rows.slice().sort((a, b) => b.value - a.value)
  const total = sorted.reduce((sum, row) => sum + row.value, 0)

  if (total === 0) return <ChartEmpty message="No catalog data." />

  const config = Object.fromEntries(
    sorted.map((row, index) => [
      row.label,
      { label: row.label, color: SERIES_COLORS[index % SERIES_COLORS.length] },
    ])
  ) satisfies ChartConfig

  return (
    <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-6">
      <ChartContainer
        config={config}
        className="aspect-auto h-[196px] w-[196px] shrink-0"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                className={TOOLTIP_CLASS}
                hideLabel
                nameKey="label"
              />
            }
          />
          <Pie
            data={sorted}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={86}
            paddingAngle={2}
            strokeWidth={0}
          >
            {sorted.map((row, index) => (
              <Cell
                key={row.label}
                fill={SERIES_COLORS[index % SERIES_COLORS.length]}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                  return null
                const cx = viewBox.cx ?? 0
                const cy = viewBox.cy ?? 0
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={cx}
                      y={cy - 4}
                      className="fill-[#101828] text-[22px] font-semibold"
                    >
                      {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={cx}
                      y={cy + 16}
                      className="fill-[#667085] text-[11px]"
                    >
                      wallpapers
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="grid min-w-0 flex-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {sorted.map((row, index) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
                }}
              />
              <span className="truncate text-[13px] text-[var(--admin-fg-soft)]">
                {row.label}
              </span>
            </span>
            <span className="shrink-0 text-[13px] font-medium text-[var(--admin-fg)] tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Sales comparison ----------------------------------------------------------- */

type DailySalesRow = { day: string; sales: number; revenue: number }

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function zeroFilledRange(
  rows: DailySalesRow[],
  endExclusive: Date,
  days: number
): DailySalesRow[] {
  const byDay = new Map(rows.map((row) => [row.day, row]))
  const out: DailySalesRow[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(endExclusive)
    date.setUTCDate(date.getUTCDate() - 1 - i)
    const day = isoDay(date)
    out.push(byDay.get(day) ?? { day, sales: 0, revenue: 0 })
  }
  return out
}

const salesConfig = {
  current: { label: "This period", color: C.blue },
  previous: { label: "Previous period", color: "#b2ddff" },
} satisfies ChartConfig

export function SalesComparisonChart({
  daily,
  prevDaily,
  days,
  metric = "revenue",
}: Readonly<{
  daily: DailySalesRow[]
  prevDaily: DailySalesRow[]
  days: number
  metric?: "revenue" | "sales"
}>) {
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const periodStart = new Date()
  periodStart.setUTCDate(periodStart.getUTCDate() - days + 1)

  const currentSeries = zeroFilledRange(daily, tomorrow, days)
  const prevSeries = zeroFilledRange(prevDaily, periodStart, days)

  const data = currentSeries.map((row, index) => ({
    label: formatDayTick(row.day),
    current: metric === "revenue" ? row.revenue : row.sales,
    previous:
      metric === "revenue"
        ? (prevSeries[index]?.revenue ?? 0)
        : (prevSeries[index]?.sales ?? 0),
  }))

  if (!data.some((row) => row.current > 0 || row.previous > 0)) {
    return <ChartEmpty message="No sales in this range yet." />
  }

  const prefix = metric === "revenue" ? "$" : ""

  return (
    <ChartContainer config={salesConfig} className={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-sales-current" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity={0.22} />
            <stop offset="100%" stopColor={C.blue} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={28}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={48}
          tick={axisTick}
          tickFormatter={(value: number) => `${prefix}${compact(value)}`}
        />
        <ChartTooltip
          cursor={{ stroke: C.grid, strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              indicator="dot"
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="flex items-center gap-1.5 text-[var(--admin-muted)]">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {salesConfig[name as keyof typeof salesConfig]?.label ??
                      name}
                  </span>
                  <span className="font-semibold text-[var(--admin-fg)] tabular-nums">
                    {prefix}
                    {Number(value).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="natural"
          dataKey="previous"
          stroke="#a9d3f7"
          strokeWidth={2}
          strokeDasharray="2 6"
          strokeLinecap="round"
          fill="none"
          dot={false}
        />
        <Area
          type="natural"
          dataKey="current"
          stroke={C.blue}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="url(#fill-sales-current)"
          dot={false}
          activeDot={{ r: 4, fill: "#fff", stroke: C.blue, strokeWidth: 2.5 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

/* Conversion funnel ---------------------------------------------------------- */

export function ConversionFunnelChart({
  steps,
}: Readonly<{
  steps: Array<{ label: string; value: number; hint?: string }>
}>) {
  const peak = Math.max(1, ...steps.map((step) => step.value))

  return (
    <ol className="space-y-3.5">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1].value : null
        const rate =
          prev && prev > 0 ? Math.round((step.value / prev) * 1000) / 10 : null
        return (
          <li key={step.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13px] text-[var(--admin-fg-soft)]">
                {step.label}
                {step.hint ? (
                  <span className="ml-1.5 text-[11px] text-[var(--admin-muted)]">
                    {step.hint}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-[var(--admin-fg)] tabular-nums">
                {step.value.toLocaleString()}
                {rate != null ? (
                  <span className="ml-2 text-[11px] font-normal text-[var(--admin-muted)]">
                    {rate}%
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-fill)]">
              <div
                className="h-full rounded-full bg-[var(--admin-blue)] transition-[width] duration-500"
                style={{ width: `${Math.max(2, (step.value / peak) * 100)}%` }}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
