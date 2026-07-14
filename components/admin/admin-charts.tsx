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

const APPLE = {
  blue: "#0071e3",
  green: "#34c759",
  orange: "#ff9500",
  pink: "#ff2d55",
  purple: "#af52de",
  teal: "#5ac8fa",
  yellow: "#ffcc00",
  gray: "#8e8e93",
  indigo: "#5856d6",
  fill: "#f5f5f7",
  grid: "#ebebed",
  muted: "#86868b",
  text: "#1d1d1f",
} as const

const CATEGORY_COLORS = [
  APPLE.blue,
  APPLE.green,
  APPLE.orange,
  APPLE.purple,
  APPLE.pink,
  APPLE.teal,
  APPLE.yellow,
  APPLE.gray,
  APPLE.indigo,
]

const chartShell = "h-[280px] w-full aspect-auto"

function ChartEmpty({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-2xl bg-[#f5f5f7]">
      <p className="text-[14px] text-[#86868b]">{message}</p>
    </div>
  )
}

function formatDayLabel(day: string) {
  const date = new Date(`${day}T12:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function lastNDays<T extends { day: string }>(rows: T[], days: number) {
  const sorted = [...rows].sort((a, b) => a.day.localeCompare(b.day))
  return sorted.slice(-days)
}

type EventCountKey =
  | "page_view"
  | "download_click"
  | "download_redirect"
  | "pricing_click"
  | "cta_click"
  | "purchase_complete"

type DailySeriesRow = {
  day: string
  label: string
} & Partial<Record<EventCountKey, number>>

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

function buildDailySeries(
  rows: Array<{ day: string; event_name: string; count: number }>,
  days = 14
) {
  const byDay = new Map<string, DailySeriesRow>()

  for (const row of rows) {
    const bucket = byDay.get(row.day) ?? {
      day: row.day,
      label: formatDayLabel(row.day),
    }
    if (isEventCountKey(row.event_name)) {
      bucket[row.event_name] = (bucket[row.event_name] ?? 0) + row.count
    }
    byDay.set(row.day, bucket)
  }

  return lastNDays([...byDay.values()], days)
}

function buildDownloadSeries(
  rows: Array<{ day: string; event_name: string; count: number }>,
  days = 14
) {
  const byDay = new Map<
    string,
    { day: string; label: string; clicks: number; redirects: number }
  >()

  for (const row of rows) {
    const existing = byDay.get(row.day) ?? {
      day: row.day,
      label: formatDayLabel(row.day),
      clicks: 0,
      redirects: 0,
    }
    if (row.event_name === "download_click") {
      existing.clicks += row.count
    } else if (row.event_name === "download_redirect") {
      existing.redirects += row.count
    }
    byDay.set(row.day, existing)
  }

  return lastNDays([...byDay.values()], days)
}

const dailyActivityConfig = {
  page_view: { label: "Page views", color: APPLE.blue },
  download_click: { label: "Download clicks", color: APPLE.green },
  download_redirect: { label: "Redirects", color: APPLE.teal },
  pricing_click: { label: "Pricing clicks", color: APPLE.orange },
  cta_click: { label: "CTA clicks", color: APPLE.purple },
  purchase_complete: { label: "Purchases", color: APPLE.pink },
} satisfies ChartConfig

export function DailyActivityChart({
  rows,
  days = 14,
}: Readonly<{
  rows: Array<{ day: string; event_name: string; count: number }>
  days?: number
}>) {
  const data = buildDailySeries(rows, days)
  const seriesKeys = EVENT_COUNT_KEYS.filter((key) =>
    data.some((row) => (row[key] ?? 0) > 0)
  )

  if (data.length === 0 || seriesKeys.length === 0) {
    return <ChartEmpty message="No activity in this range." />
  }

  return (
    <ChartContainer config={dailyActivityConfig} className={chartShell}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {seriesKeys.map((key) => (
            <linearGradient
              key={key}
              id={`fill-${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.02}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          vertical={false}
          stroke={APPLE.grid}
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ stroke: APPLE.grid, strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-0"
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {seriesKeys.map((key) => (
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

const downloadActivityConfig = {
  clicks: { label: "Download clicks", color: APPLE.green },
  redirects: { label: "Installer redirects", color: APPLE.blue },
} satisfies ChartConfig

export function DownloadActivityChart({
  rows,
  days = 14,
}: Readonly<{
  rows: Array<{ day: string; event_name: string; count: number }>
  days?: number
}>) {
  const data = buildDownloadSeries(rows, days)

  if (
    data.length === 0 ||
    data.every((row) => row.clicks === 0 && row.redirects === 0)
  ) {
    return <ChartEmpty message="No download activity in this range." />
  }

  return (
    <ChartContainer config={downloadActivityConfig} className={chartShell}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={APPLE.grid}
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ fill: APPLE.fill }}
          content={
            <ChartTooltipContent
              className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-0"
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="clicks"
          fill="var(--color-clicks)"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="redirects"
          fill="var(--color-redirects)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}

export function HorizontalBarChart({
  rows,
  formatLabel,
  maxBars = 8,
  color = APPLE.blue,
}: Readonly<{
  rows: Array<{ label: string; value: number }>
  formatLabel?: (label: string) => string
  maxBars?: number
  color?: string
}>) {
  const visible = rows
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars)
    .map((row) => ({
      label: formatLabel ? formatLabel(row.label) : row.label,
      value: row.value,
    }))

  if (visible.length === 0) {
    return <ChartEmpty message="No data for this period." />
  }

  const config = {
    value: { label: "Count", color },
  } satisfies ChartConfig

  const height = Math.max(220, visible.length * 44)

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height }}
    >
      <BarChart
        data={visible}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke={APPLE.grid}
          strokeDasharray="4 4"
        />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={132}
          tick={{ fill: APPLE.muted, fontSize: 12 }}
        />
        <ChartTooltip
          cursor={{ fill: APPLE.fill }}
          content={
            <ChartTooltipContent
              className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-0"
              hideLabel
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[0, 8, 8, 0]}
          barSize={22}
        />
      </BarChart>
    </ChartContainer>
  )
}

export function RingGauge({
  value,
  max = 100,
  label,
  sublabel,
  color = APPLE.blue,
  className,
}: Readonly<{
  value: number
  max?: number
  label: string
  sublabel?: string
  color?: string
  className?: string
}>) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const data = [{ name: label, value: pct, fill: color }]

  const config = {
    value: { label, color },
  } satisfies ChartConfig

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <ChartContainer
        config={config}
        className="mx-auto aspect-auto h-[180px] w-[180px]"
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={-270}
          innerRadius={62}
          outerRadius={86}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="fill-[#f5f5f7]"
          />
          <RadialBar dataKey="value" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                  return null
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
                      className="fill-[#1d1d1f] text-3xl font-semibold"
                    >
                      {Math.round(pct)}%
                    </tspan>
                  </text>
                )
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <div className="text-center">
        <p className="text-[14px] font-medium text-[#1d1d1f]">{label}</p>
        {sublabel ? (
          <p className="mt-0.5 text-[12px] text-[#86868b]">{sublabel}</p>
        ) : null}
      </div>
    </div>
  )
}

export function StatRing({
  value,
  max,
  label,
  sublabel,
  color = APPLE.blue,
}: Readonly<{
  value: number
  max?: number
  label: string
  sublabel?: string
  color?: string
}>) {
  const ringMax = max && max > 0 ? max : Math.max(value, 1)
  const pct = Math.min(100, (value / ringMax) * 100)
  const data = [{ name: label, value: pct, fill: color }]

  const config = {
    value: { label, color },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col items-center gap-3">
      <ChartContainer
        config={config}
        className="mx-auto aspect-auto h-[180px] w-[180px]"
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={-270}
          innerRadius={62}
          outerRadius={86}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="fill-[#f5f5f7]"
          />
          <RadialBar dataKey="value" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                  return null
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 4}
                      className="fill-[#1d1d1f] text-2xl font-semibold"
                    >
                      {value.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 16}
                      className="fill-[#86868b] text-[11px]"
                    >
                      of {ringMax.toLocaleString()}
                    </tspan>
                  </text>
                )
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <div className="text-center">
        <p className="text-[14px] font-medium text-[#1d1d1f]">{label}</p>
        {sublabel ? (
          <p className="mt-0.5 text-[12px] text-[#86868b]">{sublabel}</p>
        ) : null}
      </div>
    </div>
  )
}

export function CategoryDonut({
  rows,
}: Readonly<{
  rows: Array<{ label: string; value: number }>
}>) {
  const sorted = rows.slice().sort((a, b) => b.value - a.value)
  const total = sorted.reduce((sum, row) => sum + row.value, 0)

  if (total === 0) {
    return <ChartEmpty message="No catalog data." />
  }

  const config = Object.fromEntries(
    sorted.map((row, index) => [
      row.label,
      {
        label: row.label,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      },
    ])
  ) satisfies ChartConfig

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
      <ChartContainer
        config={config}
        className="mx-auto aspect-auto h-[240px] w-[240px]"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-0"
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
            outerRadius={92}
            paddingAngle={2}
            strokeWidth={0}
          >
            {sorted.map((row, index) => (
              <Cell
                key={row.label}
                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                  return null
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 2}
                      className="fill-[#1d1d1f] text-2xl font-semibold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 18}
                      className="fill-[#86868b] text-[11px]"
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

      <div className="min-w-0 flex-1 space-y-2">
        {sorted.map((row, index) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#f5f5f7] px-3.5 py-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }}
              />
              <span className="truncate text-[14px] text-[#1d1d1f]">
                {row.label}
              </span>
            </span>
            <span className="shrink-0 text-[14px] font-medium text-[#1d1d1f] tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventsSummaryChart({
  rows,
}: Readonly<{ rows: Array<{ label: string; value: number }> }>) {
  const data = rows
    .slice()
    .sort((a, b) => b.value - a.value)
    .map((row) => ({ label: row.label.replaceAll("_", " "), value: row.value }))

  if (data.length === 0) {
    return <ChartEmpty message="No events in this range." />
  }

  const config = {
    value: { label: "Events", color: APPLE.blue },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className={chartShell}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={APPLE.grid}
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ fill: APPLE.fill }}
          content={
            <ChartTooltipContent
              className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-0"
              hideLabel
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

export function TopPagesChart({
  rows,
}: Readonly<{ rows: Array<{ path: string; count: number }> }>) {
  return (
    <HorizontalBarChart
      rows={rows.map((row) => ({ label: row.path, value: row.count }))}
      maxBars={8}
      color={APPLE.indigo}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Shopify-style sales comparison chart
 * Solid line + gradient fill for current period, dotted line for previous.
 * ------------------------------------------------------------------------- */

type DailySalesRow = { day: string; sales: number; revenue: number }

function isoDay(date: Date): string {
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
    const found = byDay.get(day)
    out.push(found ?? { day, sales: 0, revenue: 0 })
  }
  return out
}

const salesComparisonConfig = {
  current: { label: "This period", color: "#0091ff" },
  previous: { label: "Previous period", color: "#9ecdf5" },
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
    label: formatDayLabel(row.day),
    current: metric === "revenue" ? row.revenue : row.sales,
    previous:
      metric === "revenue"
        ? (prevSeries[index]?.revenue ?? 0)
        : (prevSeries[index]?.sales ?? 0),
  }))

  const hasAny = data.some((row) => row.current > 0 || row.previous > 0)
  if (!hasAny) {
    return <ChartEmpty message="No sales in this range yet." />
  }

  const prefix = metric === "revenue" ? "$" : ""

  return (
    <ChartContainer config={salesComparisonConfig} className={chartShell}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-sales-current" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0091ff" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#0091ff" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke={APPLE.grid}
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          tick={{ fill: APPLE.muted, fontSize: 11 }}
          tickFormatter={(value: number) =>
            `${prefix}${value.toLocaleString()}`
          }
        />
        <ChartTooltip
          cursor={{ stroke: APPLE.grid, strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-0"
              indicator="dot"
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[#86868b]">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    {salesComparisonConfig[
                      name as keyof typeof salesComparisonConfig
                    ]?.label ?? name}
                  </span>
                  <span className="font-medium text-[#1d1d1f] tabular-nums">
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
          isAnimationActive
        />
        <Area
          type="natural"
          dataKey="current"
          stroke="#0091ff"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="url(#fill-sales-current)"
          dot={false}
          activeDot={{
            r: 4.5,
            fill: "#fff",
            stroke: "#0091ff",
            strokeWidth: 2.5,
          }}
          isAnimationActive
        />
      </AreaChart>
    </ChartContainer>
  )
}

/* ---------------------------------------------------------------------------
 * Conversion funnel — gradient step bars with stage-to-stage rates
 * ------------------------------------------------------------------------- */

export function ConversionFunnelChart({
  steps,
}: Readonly<{
  steps: Array<{ label: string; value: number; hint?: string }>
}>) {
  const peak = Math.max(1, ...steps.map((step) => step.value))

  return (
    <div className="space-y-3.5">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1].value : null
        const stepRate =
          prev && prev > 0 ? Math.round((step.value / prev) * 1000) / 10 : null
        return (
          <div key={step.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-[#86868b]">
                {step.label}
                {step.hint ? (
                  <span className="ml-1.5 text-[11px] text-[#86868b]/70">
                    {step.hint}
                  </span>
                ) : null}
              </span>
              <span className="text-[14px] font-medium text-[#1d1d1f] tabular-nums">
                {step.value.toLocaleString()}
                {stepRate != null ? (
                  <span className="ml-2 text-[11px] font-normal text-[#86868b]">
                    {stepRate}% of prev
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#f5f5f7]">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#0071e3] to-[#34c759] transition-all duration-500"
                style={{
                  width: `${Math.max(1.5, (step.value / peak) * 100)}%`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
