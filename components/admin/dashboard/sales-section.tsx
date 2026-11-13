"use client"

/** Sales: net and all-time figures, the purchase funnel and who bought. */

import {
  Badge,
  Panel,
  PanelBody,
  PanelHeader,
  Stat,
  StatGroup,
} from "@/components/admin/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRelativeTime, formatUsd } from "@/lib/admin/format"

import {
  DashboardSection,
  Funnel,
  InlineEmpty,
  PanelFigure,
  RankedList,
  type FunnelStep,
} from "./blocks"
import { fillPanel, WeekdayBars } from "./charts"
import {
  countryName,
  formatCount,
  formatPercent,
  percentOf,
  planLabel,
  plural,
} from "./format"
import type { AnalyticsResponse, SectionProps } from "./types"

export function SalesSection({ snapshot }: SectionProps) {
  const { data } = snapshot
  const { sales, conversionFunnel: funnel, licenseAnalytics } = data
  const allTime = data.rangeDays === 0
  const fromStripe = sales.source === "stripe"

  const steps = funnelSteps(funnel)
  const busiest = [...data.dayOfWeekSales].sort((a, b) => b.sales - a.sales)[0]

  return (
    <DashboardSection
      id="sales"
      title="Sales"
      description={
        fromStripe
          ? "What customers paid through Stripe Checkout, after promo codes."
          : "Stripe is unavailable, so amounts are license list prices."
      }
    >
      <StatGroup columns={4}>
        <Stat
          label="Net revenue"
          value={formatUsd(sales.netRevenue)}
          hint={
            sales.usedStripeFees
              ? "After Stripe fees"
              : `After est. ${sales.feePercentAssumed}% + ${formatUsd(sales.feeFixedAssumed)} fees`
          }
        />
        <Stat
          label="Net per order"
          value={formatUsd(sales.netPerSale)}
          hint={`${formatUsd(sales.pricePerSale)} average order`}
        />
        <Stat
          label="Previous period"
          value={allTime ? "—" : formatUsd(sales.prevGrossRevenue)}
          hint={
            allTime
              ? "No earlier period for all time"
              : `${plural(sales.prevSales, "order")} in the ${data.rangeDays} days before`
          }
        />
        <Stat
          label="All-time revenue"
          value={formatUsd(sales.allTimeGrossRevenue)}
          hint={`${plural(sales.allTimeSales, "order")} · ${formatUsd(sales.allTimeNetRevenue)} net`}
        />
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Visit to purchase"
            description="Each step as a share of the one before"
            actions={
              <PanelFigure
                value={formatPercent(funnel.visitorToSaleRate)}
                label="visitor to sale"
              />
            }
          />
          <PanelBody>
            <Funnel
              label="Visit to purchase funnel"
              steps={steps}
              empty="No visits or purchases in this range."
            />
          </PanelBody>
        </Panel>

        <Panel className={fillPanel.panel}>
          <PanelHeader
            title="Orders by weekday"
            description="All time, days in UTC"
            actions={
              busiest && busiest.sales > 0 ? (
                <PanelFigure value={busiest.dayName} label="is busiest" />
              ) : null
            }
          />
          <PanelBody className={fillPanel.body}>
            <WeekdayBars
              rows={data.dayOfWeekSales}
              label="Orders by weekday, all time"
              empty="No orders yet."
              fill
            />
          </PanelBody>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Latest purchases"
            description="Most recent Stripe checkouts, newest first"
          />
          <PurchasesTable
            charges={sales.recentCharges}
            fromStripe={fromStripe}
          />
        </Panel>

        <Panel>
          <PanelHeader
            title="Buyers by country"
            description="Active paid licenses, all time"
            actions={
              licenseAnalytics.buyerCountries.length > 0 ? (
                <PanelFigure
                  value={formatCount(licenseAnalytics.buyerCountries.length)}
                  label={
                    licenseAnalytics.buyerCountries.length === 1
                      ? "country"
                      : "countries"
                  }
                />
              ) : null
            }
          />
          <PanelBody>
            <RankedList
              label="Buyers by country"
              rows={licenseAnalytics.buyerCountries.map((row) => ({
                key: row.country,
                label: countryName(row.country),
                value: row.count,
              }))}
              total={licenseAnalytics.activeLicenses}
              empty="No country recorded on paid licenses yet."
            />
          </PanelBody>
        </Panel>
      </div>
    </DashboardSection>
  )
}

function funnelSteps(
  funnel: AnalyticsResponse["conversionFunnel"]
): FunnelStep[] {
  const raw = [
    {
      label: "Unique visitors",
      value: funnel.uniqueVisitors,
      hint: `${formatCount(funnel.pageViews)} views`,
    },
    {
      label: "Download clicks",
      value: funnel.downloadClicks,
      hint: `${formatCount(funnel.uniqueDownloadClickSessions)} sessions`,
    },
    { label: "Installer redirects", value: funnel.installerRedirects },
    { label: "Macs activated", value: funnel.activatedDevices },
    { label: "Purchases", value: funnel.sales },
  ]
  return raw.map((step, index) => {
    const previous = index > 0 ? raw[index - 1].value : 0
    return {
      ...step,
      note:
        index > 0 && previous > 0
          ? formatPercent(percentOf(step.value, previous))
          : undefined,
    }
  })
}

function PurchasesTable({
  charges,
  fromStripe,
}: Readonly<{
  charges: AnalyticsResponse["sales"]["recentCharges"]
  fromStripe: boolean
}>) {
  if (charges.length === 0) {
    return (
      <InlineEmpty className="min-h-40">
        {fromStripe
          ? "No purchases yet."
          : "Individual purchases are listed once Stripe is reachable."}
      </InlineEmpty>
    )
  }

  const head = "h-9 text-xs font-medium text-muted-foreground"

  return (
    <Table className="text-[13px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={`${head} pl-4`}>Plan</TableHead>
          <TableHead className={`${head} text-right`}>Paid</TableHead>
          <TableHead className={`${head} text-right`}>Net</TableHead>
          <TableHead className={head}>Promo</TableHead>
          <TableHead className={head}>Country</TableHead>
          <TableHead className={`${head} pr-4 text-right`}>When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {charges.map((charge, index) => (
          <TableRow
            key={`${charge.sent_at}-${index}`}
            className="hover:bg-fill/60 h-10"
          >
            <TableCell className="pl-4">
              <Badge>{planLabel(charge.planSlug)}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium text-foreground tabular-nums">
              {formatUsd(charge.amountUsd)}
            </TableCell>
            <TableCell className="text-soft text-right tabular-nums">
              {formatUsd(charge.netUsd)}
            </TableCell>
            <TableCell className="text-soft">
              {charge.promoCode ?? <Dash />}
            </TableCell>
            <TableCell className="text-soft max-w-36 truncate">
              {charge.country ? countryName(charge.country) : <Dash />}
            </TableCell>
            <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
              {formatRelativeTime(charge.sent_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Dash() {
  return (
    <span className="text-faint">
      <span aria-hidden>—</span>
      <span className="sr-only">None</span>
    </span>
  )
}
