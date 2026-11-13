"use client"

/** Support conversations: what is waiting and how people feel. */

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { Panel, Stat, StatGroup } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"

import { DashboardSection, PartBar } from "./blocks"
import { formatPercent, percentOf } from "./format"
import type { SectionProps } from "./types"

export function SupportSection({ snapshot }: SectionProps) {
  const feedback = snapshot.data.feedbackTotals
  const countOf = (sentiment: string) =>
    feedback.sentiments.find((row) => row.sentiment === sentiment)?.count ?? 0
  const positive = countOf("like")
  const neutral = countOf("neutral")
  const negative = countOf("dislike")
  const unrated = Math.max(0, feedback.total - positive - neutral - negative)

  return (
    <DashboardSection
      id="support"
      title="Support"
      description="Live support and in-app feedback, all time (the latest 2,000 conversations)."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/feedback">
            Open live support
            <ArrowUpRight aria-hidden data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <StatGroup columns={4}>
        <Stat
          label="Awaiting reply"
          value={feedback.needsReply}
          hint="Open and waiting on you"
        />
        <Stat label="Open" value={feedback.open} hint="Not resolved yet" />
        <Stat
          label="Resolved"
          value={feedback.resolved}
          hint={`${formatPercent(percentOf(feedback.resolved, feedback.total))} of all conversations`}
        />
        <Stat
          label="Conversations"
          value={feedback.total}
          hint="Chats and feedback submissions"
        />
      </StatGroup>

      <Panel className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <PartBar
          className="p-4"
          title="Sentiment"
          figure={`${formatPercent(percentOf(positive, feedback.total))} positive`}
          parts={[
            { label: "Positive", value: positive, tone: "green" },
            { label: "Neutral", value: neutral, tone: "blue" },
            { label: "Issue or bug", value: negative, tone: "red" },
            { label: "Not rated", value: unrated, tone: "neutral" },
          ]}
          empty="No feedback recorded yet."
        />
        <PartBar
          className="p-4"
          title="Resolution"
          figure={`${formatPercent(percentOf(feedback.resolved, feedback.total))} resolved`}
          parts={[
            { label: "Resolved", value: feedback.resolved, tone: "green" },
            { label: "Open", value: feedback.open, tone: "amber" },
          ]}
          empty="No conversations yet."
        />
      </Panel>
    </DashboardSection>
  )
}
