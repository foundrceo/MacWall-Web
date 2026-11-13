/** Turns the API's per-day rows into zero-filled series for the charts. */

import type { TrendPoint } from "./charts"
import {
  buildTimeline,
  formatDayShort,
  shiftDay,
  sumByBucket,
  type Granularity,
} from "./format"
import type { Snapshot } from "./types"

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export type SalesTrend = {
  granularity: Granularity
  /** Each point has `revenue`, `orders`, `prevRevenue`, `prevOrders`, `prevDay`. */
  points: TrendPoint[]
  /** False for all time, where there is no earlier period to compare with. */
  hasPrevious: boolean
}

/**
 * Sales per day for the range, with the same day one period earlier next to
 * it. Days are UTC, like the API's buckets.
 */
export function buildSalesTrend({ data, fetchedAt }: Snapshot): SalesTrend {
  const { sales, rangeDays } = data
  const timeline = buildTimeline({
    rangeDays,
    since: data.since,
    fetchedAt,
    days: sales.daily.map((row) => row.day),
  })
  const revenue = sumByBucket(
    timeline,
    sales.daily,
    (row) => row.day,
    (row) => row.revenue
  )
  const orders = sumByBucket(
    timeline,
    sales.daily,
    (row) => row.day,
    (row) => row.sales
  )

  const hasPrevious = rangeDays > 0 && timeline.granularity === "day"
  const previous = new Map(sales.prevDaily.map((row) => [row.day, row]))

  const points = timeline.buckets.map((bucket, index) => {
    const point: TrendPoint = {
      key: bucket.key,
      label: bucket.label,
      title: bucket.title,
      revenue: round2(revenue[index]),
      orders: orders[index],
    }
    if (hasPrevious) {
      const prevDay = shiftDay(bucket.key, -rangeDays)
      const row = previous.get(prevDay)
      point.prevRevenue = row?.revenue ?? 0
      point.prevOrders = row?.sales ?? 0
      point.prevDay = formatDayShort(prevDay)
    }
    return point
  })

  return { granularity: timeline.granularity, points, hasPrevious }
}

export type EventTrend = {
  granularity: Granularity
  /** Each point has one numeric key per event name. */
  points: TrendPoint[]
  /** Event names that have data, most frequent first. */
  events: string[]
}

/** Tracked events per day, one key per event name. */
export function buildEventTrend(
  { data, fetchedAt }: Snapshot,
  rows: ReadonlyArray<{ day: string; event_name: string; count: number }>
): EventTrend {
  const timeline = buildTimeline({
    rangeDays: data.rangeDays,
    since: data.since,
    fetchedAt,
    days: rows.map((row) => row.day),
  })

  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.event_name, (totals.get(row.event_name) ?? 0) + row.count)
  }
  const events = [...totals.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const points: TrendPoint[] = timeline.buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    title: bucket.title,
  }))
  for (const name of events) {
    const values = sumByBucket(
      timeline,
      rows.filter((row) => row.event_name === name),
      (row) => row.day,
      (row) => row.count
    )
    values.forEach((value, index) => {
      points[index][name] = value
    })
  }

  return { granularity: timeline.granularity, points, events }
}

/** One numeric series out of trend points. */
export function valuesOf(points: readonly TrendPoint[], key: string): number[] {
  return points.map((point) => Number(point[key] ?? 0))
}

/** The same series for a sparkline, or nothing when it would be a flat zero. */
export function sparkOf(
  points: readonly TrendPoint[],
  key: string
): number[] | undefined {
  const values = valuesOf(points, key)
  return values.some((value) => value > 0) ? values : undefined
}
