"use client"

/** Top of the dashboard: the four numbers that matter and sales over time. */

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import {
  Notice,
  Panel,
  PanelBody,
  PanelHeader,
  Segmented,
  Stat,
  StatGroup,
  StatusDot,
} from "@/components/admin/ui"
import { formatUsd } from "@/lib/admin/format"

import { Legend } from "./blocks"
import { TrendChart } from "./charts"
import {
  formatCompactUsd,
  formatCount,
  formatPercent,
  plural,
  stripeProblem,
} from "./format"
import { buildEventTrend, buildSalesTrend, sparkOf } from "./series"
import type { SectionProps } from "./types"

type Metric = "revenue" | "orders"

const METRICS: readonly { value: Metric; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "orders", label: "Orders" },
]

export function OverviewSection({ snapshot }: SectionProps) {
  const [metric, setMetric] = useState<Metric>("revenue")
  const { data } = snapshot
  const { sales, conversionFunnel: funnel, downloadFunnel } = data
  const allTime = data.rangeDays === 0
  const fromStripe = sales.source === "stripe"

  const trend = buildSalesTrend(snapshot)
  const downloads = buildEventTrend(snapshot, data.downloadDaily)
  const unit = trend.granularity === "month" ? "month" : "day"

  const revenueDelta =
    !allTime && sales.prevGrossRevenue > 0
      ? ((sales.grossRevenue - sales.prevGrossRevenue) /
          sales.prevGrossRevenue) *
        100
      : null
  const ordersDelta =
    !allTime && sales.prevSales > 0 ? sales.salesChangePercent : null

  const series =
    metric === "revenue"
      ? [
          { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
          {
            key: "prevRevenue",
            label: "Previous",
            color: "var(--chart-1)",
            dashed: true,
            noteKey: "prevDay",
          },
        ]
      : [
          { key: "orders", label: "Orders", color: "var(--chart-1)" },
          {
            key: "prevOrders",
            label: "Previous",
            color: "var(--chart-1)",
            dashed: true,
            noteKey: "prevDay",
          },
        ]
  const visibleSeries = trend.hasPrevious ? series : series.slice(0, 1)

  let source = "Estimated from license list prices"
  if (fromStripe) {
    source = allTime
      ? "Stripe payments, all time"
      : `Stripe payments, last ${data.rangeDays} days against the ${data.rangeDays} before`
  }

  return (
    <section aria-label="Overview" className="space-y-4">
      {fromStripe ? null : (
        <Notice tone="warning" title="Revenue is an estimate">
          {stripeProblem(data.stripeLive.error)} Sales below are counted from
          active licenses at list price until Stripe is back.
        </Notice>
      )}

      <StatGroup columns={4}>
        <Stat
          label="Revenue"
          value={formatUsd(sales.grossRevenue)}
          delta={revenueDelta}
          hint={
            allTime
              ? `${formatUsd(sales.netRevenue)} net`
              : `vs ${formatUsd(sales.prevGrossRevenue)}`
          }
          spark={sparkOf(trend.points, "revenue")}
        />
        <Stat
          label="Orders"
          value={formatCount(sales.sales)}
          delta={ordersDelta}
          hint={
            allTime
              ? "All time"
              : `vs ${sales.prevSales.toLocaleString("en-US")}`
          }
          spark={sparkOf(trend.points, "orders")}
        />
        <Stat
          label="Visitor to sale"
          value={formatPercent(funnel.visitorToSaleRate)}
          hint={`${funnel.sales.toLocaleString("en-US")} of ${plural(funnel.uniqueVisitors, "visitor")}`}
        />
        <Stat
          label="Download clicks"
          value={formatCount(downloadFunnel.clicks)}
          hint={`${formatPercent(downloadFunnel.completionRate)} reach the installer`}
          spark={sparkOf(downloads.points, "download_click")}
        />
      </StatGroup>

      <Attention
        needsReply={data.feedbackTotals.needsReply}
        pendingUploads={data.communityUploads.pending}
      />

      <Panel>
        <PanelHeader
          title={`${metric === "revenue" ? "Revenue" : "Orders"} per ${unit}`}
          description={source}
          actions={
            <Segmented
              size="sm"
              label="Chart metric"
              value={metric}
              onChange={setMetric}
              options={METRICS}
            />
          }
        />
        <PanelBody>
          {trend.hasPrevious && (sales.sales > 0 || sales.prevSales > 0) ? (
            <Legend
              className="mb-3"
              items={[
                {
                  label: allTime ? "All time" : `Last ${data.rangeDays} days`,
                  color: "var(--chart-1)",
                },
                {
                  label: `Previous ${data.rangeDays} days`,
                  color: "var(--chart-1)",
                  dashed: true,
                },
              ]}
            />
          ) : null}
          <TrendChart
            data={trend.points}
            series={visibleSeries}
            label={`${metric === "revenue" ? "Revenue" : "Orders"} per ${unit}${trend.hasPrevious ? ", compared with the previous period" : ""}`}
            empty="No sales in this range yet."
            formatValue={
              metric === "revenue"
                ? formatUsd
                : (value) => plural(value, "order")
            }
            formatAxis={metric === "revenue" ? formatCompactUsd : undefined}
            allowDecimals={metric === "revenue"}
          />
        </PanelBody>
      </Panel>
    </section>
  )
}

/** Work waiting on the owner, linked to the screen that clears it. */
function Attention({
  needsReply,
  pendingUploads,
}: Readonly<{ needsReply: number; pendingUploads: number }>) {
  const items = [
    {
      href: "/admin/feedback",
      count: needsReply,
      text:
        needsReply === 1
          ? "conversation needs a reply"
          : "conversations need a reply",
    },
    {
      href: "/admin/uploads",
      count: pendingUploads,
      text: pendingUploads === 1 ? "upload to review" : "uploads to review",
    },
  ].filter((item) => item.count > 0)

  if (items.length === 0) return null

  return (
    <ul aria-label="Needs attention" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group text-soft hover:bg-fill inline-flex h-8 items-center gap-2 rounded-[9px] border border-border bg-card px-3 text-[13px] transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <StatusDot tone="amber" />
            <span>
              <span className="font-medium text-foreground tabular-nums">
                {item.count.toLocaleString("en-US")}
              </span>{" "}
              {item.text}
            </span>
            <ArrowUpRight
              aria-hidden
              className="text-faint size-3.5 transition-colors duration-150 group-hover:text-foreground"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
