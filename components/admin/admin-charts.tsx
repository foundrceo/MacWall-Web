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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  violet: "#8b7cf7",
  red: "#f04438",
  cyan: "#22d3ee",
  pink: "#ee46bc",
  slate: "#8b8b93",
  grid: "var(--admin-border)",
  cursor: "var(--admin-fill)",
  muted: "var(--admin-muted)",
  fg: "var(--admin-fg)",
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
  "rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[13px] text-[var(--admin-fg)] shadow-[var(--admin-shadow-pop)] ring-0"

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
  const sorted = [...rows].sort((a, b) => a.day.localeCompare(b.day))
  if (days <= 0 || days >= 3650) return sorted
  return sorted.slice(-days)
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
            className="fill-[var(--admin-fill)]"
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
              className="fill-[var(--admin-fg)] text-[28px] font-semibold"
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
              className="fill-[var(--admin-fg)] text-[22px] font-semibold"
            >
              {value.toLocaleString()}
            </tspan>
            <tspan x={cx} y={cy + 15} className="fill-[var(--admin-muted)] text-[11px]">
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
                      className="fill-[var(--admin-fg)] text-[22px] font-semibold"
                    >
                      {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={cx}
                      y={cy + 16}
                      className="fill-[var(--admin-muted)] text-[11px]"
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

/* Daily sales bar chart ----------------------------------------------------- */

const dailySalesBarConfig = {
  sales: { label: "Sales Count", color: C.blue },
} satisfies ChartConfig

export function DailySalesBarChart({
  daily,
  days = 14,
}: Readonly<{
  daily: Array<{ day: string; sales: number; revenue: number }>
  days?: number
}>) {
  const data = lastNDays(
    daily.map((r) => ({
      day: r.day,
      label: formatDayTick(r.day),
      sales: r.sales,
      revenue: r.revenue,
    })),
    days
  )

  if (data.length === 0 || !data.some((d) => d.sales > 0)) {
    return <ChartEmpty message="No sales recorded in this period." />
  }

  return (
    <ChartContainer config={dailySalesBarConfig} className={CHART_HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={20}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={axisTick}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ fill: C.cursor }}
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value, _, item) => (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--admin-muted)]">Sales:</span>
                  <span className="font-semibold text-[var(--admin-fg)] tabular-nums">
                    {value} (${item.payload.revenue.toFixed(2)})
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="sales"
          fill={C.blue}
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ChartContainer>
  )
}

/* Day of week radar chart --------------------------------------------------- */

const radarConfig = {
  sales: { label: "Sales Volume", color: C.violet },
} satisfies ChartConfig

export function DayOfWeekRadarChart({
  rows,
}: Readonly<{
  rows: Array<{ dayName: string; sales: number; revenue: number }>
}>) {
  if (!rows || rows.length === 0 || !rows.some((r) => r.sales > 0)) {
    return <ChartEmpty message="No day-of-week sales volume yet." />
  }

  return (
    <ChartContainer config={radarConfig} className="aspect-auto h-[260px] w-full">
      <RadarChart data={rows}>
        <PolarGrid stroke={C.grid} />
        <PolarAngleAxis dataKey="dayName" tick={{ fill: C.muted, fontSize: 11 }} />
        <PolarRadiusAxis angle={30} stroke={C.grid} tick={{ fill: C.muted, fontSize: 10 }} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value, _, item) => (
                <div className="flex items-center justify-between gap-3">
                  <span>{item.payload.dayName}:</span>
                  <span className="font-semibold text-[var(--admin-fg)]">
                    {value} sales (${Number(item.payload.revenue).toFixed(2)})
                  </span>
                </div>
              )}
            />
          }
        />
        <Radar
          name="Sales"
          dataKey="sales"
          stroke={C.violet}
          fill={C.violet}
          fillOpacity={0.4}
        />
      </RadarChart>
    </ChartContainer>
  )
}

/* License plan distribution pie chart --------------------------------------- */

const planConfig = {
  pro: { label: "Pro ($7.99)", color: C.blue },
  pro_plus: { label: "Pro Plus ($12.99)", color: C.violet },
  annual: { label: "Annual ($4.99)", color: C.cyan },
} satisfies ChartConfig

export function LicensePlanPieChart({
  rows,
}: Readonly<{
  rows: Array<{ plan: string; label: string; count: number; color: string }>
}>) {
  const total = rows.reduce((acc, r) => acc + r.count, 0)
  if (total === 0) {
    return <ChartEmpty message="No active plans to display." />
  }

  return (
    <ChartContainer config={planConfig} className="aspect-auto h-[260px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value, name) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--admin-muted)]">{name}:</span>
                  <span className="font-semibold text-[var(--admin-fg)]">
                    {value} ({Math.round((Number(value) / total) * 100)}%)
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={rows}
          dataKey="count"
          nameKey="label"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={3}
        >
          {rows.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || SERIES_COLORS[index % SERIES_COLORS.length]} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-[var(--admin-fg)] text-xl font-bold"
                    >
                      {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 18}
                      className="fill-[var(--admin-muted)] text-[11px]"
                    >
                      Licenses
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}

/* License status donut chart ------------------------------------------------ */

export function LicenseStatusDonut({
  rows,
}: Readonly<{
  rows: Array<{ status: string; label: string; count: number; color: string }>
}>) {
  const total = rows.reduce((acc, r) => acc + r.count, 0)
  if (total === 0) {
    return <ChartEmpty message="No licenses recorded." />
  }

  const config = rows.reduce((acc, r) => {
    acc[r.status] = { label: r.label, color: r.color }
    return acc
  }, {} as ChartConfig)

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value, name) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--admin-muted)]">{name}:</span>
                  <span className="font-semibold text-[var(--admin-fg)]">
                    {value} ({Math.round((Number(value) / total) * 100)}%)
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={rows}
          dataKey="count"
          nameKey="label"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
        >
          {rows.map((entry, index) => (
            <Cell key={`status-cell-${index}`} fill={entry.color} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-[var(--admin-fg)] text-lg font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-[var(--admin-muted)] text-[10px]"
                    >
                      Total
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}

/* Device activations area chart --------------------------------------------- */

const deviceConfig = {
  devices: { label: "Devices Activated", color: C.green },
} satisfies ChartConfig

export function DeviceActivationsAreaChart({
  daily,
  days = 14,
}: Readonly<{
  daily: Array<{ day: string; count: number }>
  days?: number
}>) {
  const data = lastNDays(
    daily.map((r) => ({
      day: r.day,
      label: formatDayTick(r.day),
      devices: r.count,
    })),
    days
  )

  if (data.length === 0) {
    return <ChartEmpty message="No device activations in this period." />
  }

  return (
    <ChartContainer config={deviceConfig} className={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-devices" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.green} stopOpacity={0.28} />
            <stop offset="100%" stopColor={C.green} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={20}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={axisTick}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: C.grid, strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value) => (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--admin-muted)]">Devices:</span>
                  <span className="font-semibold text-[var(--admin-fg)] tabular-nums">
                    {value} Macs
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          type="natural"
          dataKey="devices"
          stroke={C.green}
          strokeWidth={2}
          fill="url(#fill-devices)"
          activeDot={{ r: 4, fill: "#fff", stroke: C.green, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

/* Promo code usage bar chart ------------------------------------------------ */

const promoConfig = {
  count: { label: "Redemptions", color: C.amber },
} satisfies ChartConfig

export function PromoCodeBarChart({
  rows,
}: Readonly<{
  rows: Array<{ code: string; count: number; label: string }>
}>) {
  if (!rows || rows.length === 0) {
    return <ChartEmpty message="No promo code redemptions recorded." />
  }

  return (
    <ChartContainer config={promoConfig} className={CHART_HEIGHT}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="code"
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          width={70}
        />
        <ChartTooltip
          cursor={{ fill: C.cursor }}
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value, _, item) => (
                <div className="flex items-center justify-between gap-3">
                  <span>{item.payload.label}:</span>
                  <span className="font-semibold text-[var(--admin-fg)]">{value} uses</span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="count" fill={C.amber} radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  )
}

/* 7-Day x 24-Hour Activity Heatmap Grid ------------------------------------- */

export function HourlyActivityHeatmapGrid({
  rows,
}: Readonly<{
  rows: Array<{
    dayOfWeek: string
    dayIndex: number
    hour: number
    count: number
    intensity: number
  }>
}>) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  if (!rows || rows.length === 0) {
    return <ChartEmpty message="No hourly activity data." />
  }

  const getCell = (d: number, h: number) => {
    return rows.find((r) => r.dayIndex === d && r.hour === h)
  }

  return (
    <div className="space-y-2 overflow-x-auto py-2">
      <div className="min-w-[620px]">
        {/* Hour Header */}
        <div className="flex items-center text-[10px] text-[var(--admin-muted)] mb-1 pl-10">
          {hours.filter((h) => h % 3 === 0).map((h) => (
            <span key={h} className="w-[12.5%] text-left">
              {h === 0 ? "12 AM" : h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
            </span>
          ))}
        </div>

        {/* Rows by Day */}
        <div className="space-y-1">
          {days.map((dayName, dIdx) => (
            <div key={dayName} className="flex items-center gap-1.5">
              <span className="w-8 text-[11px] font-medium text-[var(--admin-muted)]">
                {dayName}
              </span>
              <div className="grid flex-1 grid-cols-24 gap-1">
                {hours.map((h) => {
                  const cell = getCell(dIdx, h)
                  const count = cell?.count ?? 0
                  const intensity = cell?.intensity ?? 0
                  return (
                    <div
                      key={h}
                      title={`${dayName} ${h}:00 - ${count} events`}
                      className="group relative h-4.5 rounded-xs transition-transform hover:scale-125"
                      style={{
                        backgroundColor:
                          intensity === 0
                            ? "var(--admin-fill)"
                            : intensity < 0.25
                              ? "rgba(0, 113, 227, 0.25)"
                              : intensity < 0.5
                                ? "rgba(0, 113, 227, 0.50)"
                                : intensity < 0.75
                                  ? "rgba(0, 113, 227, 0.75)"
                                  : "rgba(0, 113, 227, 1)",
                      }}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-[var(--admin-muted)]">
          <span>Less active</span>
          <div className="flex gap-1">
            <span className="size-3 rounded-xs bg-[var(--admin-fill)]" />
            <span className="size-3 rounded-xs bg-[rgba(0,113,227,0.25)]" />
            <span className="size-3 rounded-xs bg-[rgba(0,113,227,0.50)]" />
            <span className="size-3 rounded-xs bg-[rgba(0,113,227,0.75)]" />
            <span className="size-3 rounded-xs bg-[rgba(0,113,227,1)]" />
          </div>
          <span>Peak active</span>
        </div>
      </div>
    </div>
  )
}

/* Support Feedback Sentiment Pie Chart -------------------------------------- */

const feedbackConfig = {
  like: { label: "Positive", color: C.green },
  neutral: { label: "Neutral", color: C.amber },
  dislike: { label: "Issues / Bug", color: C.red },
} satisfies ChartConfig

export function FeedbackSentimentPieChart({
  sentiments,
}: Readonly<{
  sentiments: Array<{ label: string; sentiment: string; count: number; color: string }>
}>) {
  const total = sentiments.reduce((acc, s) => acc + s.count, 0)
  if (total === 0) {
    return <ChartEmpty message="No feedback recorded yet." />
  }

  return (
    <ChartContainer config={feedbackConfig} className="aspect-auto h-[260px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              className={TOOLTIP_CLASS}
              formatter={(value, name) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--admin-muted)]">{name}:</span>
                  <span className="font-semibold text-[var(--admin-fg)]">
                    {value} ({Math.round((Number(value) / total) * 100)}%)
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={sentiments}
          dataKey="count"
          nameKey="label"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
        >
          {sentiments.map((entry, index) => (
            <Cell key={`feedback-${index}`} fill={entry.color} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-[var(--admin-fg)] text-lg font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-[var(--admin-muted)] text-[10px]"
                    >
                      Tickets
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}

