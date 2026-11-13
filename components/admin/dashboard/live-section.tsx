"use client"

/** Who is on the site right now and what they just did. */

import {
  Badge,
  Panel,
  PanelBody,
  PanelHeader,
  Stat,
  StatGroup,
} from "@/components/admin/ui"

import {
  DashboardSection,
  InlineEmpty,
  PanelFigure,
  RankedList,
} from "./blocks"
import {
  countryName,
  eventLabel,
  eventNoun,
  formatAgo,
  formatCount,
  plural,
  pricingLocationLabel,
} from "./format"
import type { AnalyticsResponse, SectionProps } from "./types"

export function LiveSection({ snapshot }: SectionProps) {
  const live = snapshot.data.liveActivity

  return (
    <DashboardSection
      id="live"
      title="Right now"
      description="Sessions and events from the last 24 hours, whatever range is selected. Refresh to update."
    >
      <StatGroup columns={4}>
        <Stat
          label="Active now"
          value={live.activeUsers5m}
          hint="Sessions in the last 5 minutes"
        />
        <Stat
          label="Last 15 minutes"
          value={live.activeUsers15m}
          hint="Active sessions"
        />
        <Stat
          label="Last hour"
          value={live.activeUsers1h}
          hint={`${plural(live.eventsLastHour, "event")} tracked`}
        />
        <Stat
          label="Last 24 hours"
          value={live.activeUsers24h}
          hint="Active sessions"
        />
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="What visitors are doing"
            description="Events in the last hour, by type"
            actions={
              live.eventsLastHour > 0 ? (
                <PanelFigure
                  value={formatCount(live.eventsLastHour)}
                  label={live.eventsLastHour === 1 ? "event" : "events"}
                />
              ) : null
            }
          />
          <PanelBody>
            <RankedList
              label="Events in the last hour by type"
              rows={live.currentActions.map((row) => ({
                key: row.action,
                label: eventLabel(row.action),
                value: row.count,
              }))}
              total={live.eventsLastHour}
              empty="Nothing in the last hour."
            />
          </PanelBody>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader
            title="Latest events"
            description="Most recent first, last hour"
          />
          <LiveFeed feed={live.recentLiveFeed} />
        </Panel>
      </div>
    </DashboardSection>
  )
}

function LiveFeed({
  feed,
}: Readonly<{ feed: AnalyticsResponse["liveActivity"]["recentLiveFeed"] }>) {
  if (feed.length === 0) {
    return (
      <InlineEmpty className="min-h-40">Nothing in the last hour.</InlineEmpty>
    )
  }

  return (
    <ol className="divide-y divide-border">
      {feed.map((item, index) => {
        const where =
          item.path ??
          (item.location ? pricingLocationLabel(item.location) : null)
        return (
          <li
            key={`${item.eventName}-${item.agoSeconds}-${index}`}
            className="flex h-10 items-center gap-3 px-4 text-[13px]"
          >
            <span className="shrink-0 font-medium text-foreground">
              {eventNoun(item.eventName)}
            </span>
            <span
              className="min-w-0 flex-1 truncate text-muted-foreground"
              title={where ?? undefined}
            >
              {where}
            </span>
            {item.country ? (
              <Badge>
                <span title={countryName(item.country)}>{item.country}</span>
              </Badge>
            ) : null}
            <span className="w-14 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {formatAgo(item.agoSeconds)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
