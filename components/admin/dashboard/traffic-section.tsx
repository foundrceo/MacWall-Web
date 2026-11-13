"use client"

/** Website traffic and downloads from first-party event tracking. */

import { useState } from "react"

import {
  Panel,
  PanelBody,
  PanelHeader,
  Stat,
  StatGroup,
} from "@/components/admin/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DashboardSection, Legend, PanelFigure, RankedList } from "./blocks"
import { fillPanel, TrendChart } from "./charts"
import {
  countryName,
  downloadLocationLabel,
  eventLabel,
  formatCount,
  formatPercent,
  plural,
  pricingLocationLabel,
} from "./format"
import { busiestCell, HourHeatmap, hourLabel } from "./heatmap"
import { buildEventTrend, valuesOf } from "./series"
import type { SectionProps } from "./types"

export function TrafficSection({ snapshot }: SectionProps) {
  const [event, setEvent] = useState("page_view")
  const { data } = snapshot
  const { downloadFunnel, conversionFunnel: funnel } = data
  const sessions = data.sessionEngagement
  const unit = data.rangeDays === 0 ? "all time" : `last ${data.rangeDays} days`

  const countOf = (name: string) =>
    data.eventCounts.find((row) => row.event_name === name)?.count ?? 0
  const pageViews = countOf("page_view")
  const pricingClicks = countOf("pricing_click")

  const events = buildEventTrend(snapshot, data.dailyCounts)
  const activeEvent = events.events.includes(event) ? event : events.events[0]
  const activeTotal = activeEvent
    ? valuesOf(events.points, activeEvent).reduce(
        (sum, value) => sum + value,
        0
      )
    : 0
  const per = events.granularity === "month" ? "month" : "day"

  const downloads = buildEventTrend(snapshot, data.downloadDaily)
  const peak = busiestCell(data.hourlyHeatmap)

  return (
    <DashboardSection
      id="traffic"
      title="Traffic and downloads"
      description={`First-party events from the marketing site, ${unit}. Days and hours are in UTC.`}
    >
      <StatGroup columns={4}>
        <Stat
          label="Page views"
          value={pageViews}
          hint={plural(funnel.uniqueVisitors, "unique visitor")}
        />
        <Stat
          label="Pages per visit"
          value={sessions.avgPagesPerSession}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          hint={`${plural(sessions.totalSessions, "session")} · ${formatPercent(sessions.singlePageSessionRate)} single-page`}
        />
        <Stat
          label="Installer redirects"
          value={downloadFunnel.redirects}
          hint={`From ${plural(funnel.uniqueInstallSessions, "unique session")}`}
        />
        <Stat
          label="Pricing clicks"
          value={pricingClicks}
          hint={`Against ${plural(downloadFunnel.clicks, "download click")}`}
        />
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel className={fillPanel.panel}>
          <PanelHeader
            title={`Events per ${per}`}
            description={
              activeEvent
                ? `${formatCount(activeTotal)} ${eventLabel(activeEvent).toLowerCase()} in total`
                : "One tracked event at a time"
            }
            actions={
              events.events.length > 1 && activeEvent ? (
                <Select value={activeEvent} onValueChange={setEvent}>
                  <SelectTrigger
                    size="sm"
                    aria-label="Event to chart"
                    className="rounded-lg"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end" className="rounded-xl">
                    {events.events.map((name) => (
                      <SelectItem
                        key={name}
                        value={name}
                        className="rounded-lg text-[13px]"
                      >
                        {eventLabel(name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null
            }
          />
          <PanelBody className={fillPanel.body}>
            <TrendChart
              data={events.points}
              series={
                activeEvent
                  ? [
                      {
                        key: activeEvent,
                        label: eventLabel(activeEvent),
                        color: "var(--chart-1)",
                      },
                    ]
                  : []
              }
              label={`${activeEvent ? eventLabel(activeEvent) : "Events"} per ${per}`}
              empty="No events tracked in this range."
              fill
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="All tracked events"
            description={`Totals, ${unit}`}
          />
          <PanelBody>
            <RankedList
              label="Tracked events by count"
              rows={data.eventCounts.map((row) => ({
                key: row.event_name,
                label: eventLabel(row.event_name),
                value: row.count,
              }))}
              limit={10}
              showShare={false}
              empty="No events tracked in this range."
            />
          </PanelBody>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className={fillPanel.panel}>
          <PanelHeader
            title={`Downloads per ${downloads.granularity === "month" ? "month" : "day"}`}
            description="Button clicks against installer downloads started"
            actions={
              downloadFunnel.clicks > 0 ? (
                <PanelFigure
                  value={formatPercent(downloadFunnel.completionRate)}
                  label="reach the installer"
                />
              ) : null
            }
          />
          <PanelBody className={fillPanel.body}>
            {downloadFunnel.clicks + downloadFunnel.redirects > 0 ? (
              <Legend
                className="mb-3"
                items={[
                  { label: "Download clicks", color: "var(--chart-1)" },
                  { label: "Installer redirects", color: "var(--chart-2)" },
                ]}
              />
            ) : null}
            <TrendChart
              data={downloads.points}
              series={[
                {
                  key: "download_click",
                  label: "Download clicks",
                  color: "var(--chart-1)",
                },
                {
                  key: "download_redirect",
                  label: "Installer redirects",
                  color: "var(--chart-2)",
                },
              ]}
              label="Download clicks and installer redirects over time"
              empty="No download activity in this range."
              fill
            />
          </PanelBody>
        </Panel>

        <Panel className={fillPanel.panel}>
          <PanelHeader
            title="Activity by hour"
            description="All tracked events by weekday and hour"
            actions={
              peak ? (
                <PanelFigure
                  value={`${peak.dayOfWeek} ${hourLabel(peak.hour)}`}
                  label="is busiest"
                />
              ) : null
            }
          />
          <PanelBody className={fillPanel.body}>
            <HourHeatmap cells={data.hourlyHeatmap} />
          </PanelBody>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Top pages"
            description="Page views and share of all views"
          />
          <PanelBody>
            <RankedList
              label="Pages by views"
              rows={data.topPages.map((row) => ({
                key: row.path,
                label: row.path,
                value: row.count,
              }))}
              total={pageViews}
              empty="No page views in this range."
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Visitors by country"
            description="Page views where the country is known"
          />
          <PanelBody>
            <RankedList
              label="Countries by page views"
              rows={data.visitorsByCountry.map((row) => ({
                key: row.country,
                label: countryName(row.country),
                value: row.count,
              }))}
              total={pageViews}
              empty="No country data in this range."
            />
          </PanelBody>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Download clicks by button"
            description="Where on the site the download was started"
          />
          <PanelBody>
            <RankedList
              label="Download clicks by button"
              rows={data.downloadClicksByLocation.map((row) => ({
                key: row.location,
                label: downloadLocationLabel(row.location),
                value: row.count,
              }))}
              total={downloadFunnel.clicks}
              empty="No download clicks in this range."
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Pricing clicks by button"
            description="Where visitors went on to pricing or checkout"
          />
          <PanelBody>
            <RankedList
              label="Pricing clicks by button"
              rows={data.pricingClicksByLocation.map((row) => ({
                key: row.location,
                label: pricingLocationLabel(row.location),
                value: row.count,
              }))}
              total={pricingClicks}
              empty="No pricing clicks in this range."
            />
          </PanelBody>
        </Panel>
      </div>
    </DashboardSection>
  )
}
