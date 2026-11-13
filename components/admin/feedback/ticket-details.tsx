"use client"

import { Check, Copy, FileText } from "lucide-react"
import type { ReactNode } from "react"

import {
  Avatar,
  Badge,
  DataList,
  Skeleton,
  type DataListItem,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import {
  customerEmail,
  customerName,
  deviceSpecs,
  isAutoClosedTicket,
  originalIssuePreview,
  threadMessages,
  ticketNeedsReply,
} from "./helpers"
import { SENTIMENT, type FeedbackItem, type Filter } from "./types"

export type CopyHandler = (field: string, value: string) => void

/**
 * Everything known about the selected ticket's customer and device. Sits in
 * the right rail on wide screens and in a sheet below that.
 */
export function TicketDetails({
  ticket,
  chatId,
  counts,
  copiedField,
  onCopy,
  loading,
}: Readonly<{
  ticket: FeedbackItem | null
  /** First load, before any ticket is known. */
  loading: boolean
  chatId: string | null
  counts: Record<Filter, number>
  copiedField: string | null
  onCopy: CopyHandler
}>) {
  if (!ticket && loading) {
    return (
      <div
        role="status"
        aria-label="Loading inbox totals"
        className="space-y-4 px-4 py-4"
      >
        <Skeleton className="h-3 w-12" />
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
    )
  }

  if (!ticket) {
    return (
      <Section title="Inbox">
        <DataList
          items={[
            { label: "Needs a reply", value: counts.unread },
            { label: "Open", value: counts.open },
            { label: "Closed", value: counts.closed },
            { label: "All conversations", value: counts.all },
          ].map((row) => ({
            label: row.label,
            value: <span className="tabular-nums">{row.value}</span>,
          }))}
        />
      </Section>
    )
  }

  const name = customerName(ticket.name)
  const email = customerEmail(ticket.name)
  const needsReply = ticketNeedsReply(ticket)

  const conversation: DataListItem[] = [
    {
      label: "Status",
      value: ticket.isResolved ? (
        <Badge>
          {isAutoClosedTicket(ticket) ? "Closed automatically" : "Closed"}
        </Badge>
      ) : needsReply ? (
        <Badge tone="blue" dot>
          Needs a reply
        </Badge>
      ) : (
        <Badge tone="green" dot>
          Waiting on customer
        </Badge>
      ),
    },
    {
      label: "Feedback",
      value: (
        <Badge tone={SENTIMENT[ticket.sentiment].tone}>
          {SENTIMENT[ticket.sentiment].label}
        </Badge>
      ),
    },
    {
      label: "Chat ID",
      value: chatId ? (
        <CopyValue
          field="rail-chatId"
          value={chatId}
          label="Copy Chat ID"
          copied={copiedField === "rail-chatId"}
          onCopy={onCopy}
        />
      ) : (
        <span className="font-normal text-muted-foreground">None</span>
      ),
    },
    {
      label: "Ticket",
      value: (
        <CopyValue
          field="rail-ticketId"
          value={ticket.id}
          display={`${ticket.id.slice(0, 8)}…`}
          label="Copy ticket ID"
          copied={copiedField === "rail-ticketId"}
          onCopy={onCopy}
        />
      ),
    },
    {
      label: "Messages",
      value: (
        <span className="tabular-nums">{threadMessages(ticket).length}</span>
      ),
    },
    {
      label: "Opened",
      value: (
        <span title={new Date(ticket.createdAt).toLocaleString()}>
          {formatRelativeTime(ticket.createdAt)}
        </span>
      ),
    },
  ]

  const device: DataListItem[] = deviceSpecs(ticket).map((spec) => ({
    label: spec.label,
    value: <span title={spec.value}>{spec.value}</span>,
  }))
  if (ticket.deviceId) {
    device.push({
      label: "Device ID",
      value: (
        <CopyValue
          field="rail-deviceId"
          value={ticket.deviceId}
          label="Copy device ID"
          copied={copiedField === "rail-deviceId"}
          onCopy={onCopy}
        />
      ),
    })
  }

  return (
    <div className="divide-y divide-border">
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">
            {name}
          </p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="block truncate rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {email}
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">No email given</p>
          )}
        </div>
      </div>

      <Section title="Conversation">
        <DataList items={conversation} />
      </Section>

      <Section title="Device and app">
        <DataList items={device} />
      </Section>

      <Section title="Diagnostics">
        {ticket.diagnosticsUrl ? (
          <>
            <Button asChild variant="outline" size="sm">
              <a
                href={ticket.diagnosticsUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <FileText aria-hidden className="size-3.5" />
                Open report
              </a>
            </Button>
            <p className="mt-2 text-xs text-pretty text-muted-foreground">
              Device snapshot, settings, extension state, app and extension
              logs, and the user’s action trail.
              {ticket.diagnosticsUpdatedAt
                ? ` Updated ${new Date(ticket.diagnosticsUpdatedAt).toLocaleString()}.`
                : null}
            </p>
          </>
        ) : (
          <p className="text-xs text-pretty text-muted-foreground">
            No report attached. Tickets from MacWall 3.9+ include one
            automatically; ask the user to choose “Send diagnostics again” from
            the chat menu.
          </p>
        )}
      </Section>

      <Section title="Original message">
        <p className="text-soft text-xs leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap">
          {originalIssuePreview(ticket)}
        </p>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="px-4 py-4">
      <h3 className="mb-2.5 text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

/** A monospace value that copies itself on click. */
function CopyValue({
  field,
  value,
  display,
  label,
  copied,
  onCopy,
}: Readonly<{
  field: string
  value: string
  /** Shortened text to show; the full value is what gets copied. */
  display?: string
  label: string
  copied: boolean
  onCopy: CopyHandler
}>) {
  const Icon = copied ? Check : Copy
  return (
    <button
      type="button"
      onClick={() => onCopy(field, value)}
      aria-label={copied ? `Copied ${value}` : `${label}: ${value}`}
      title={copied ? "Copied" : label}
      className="group/copy text-soft inline-flex max-w-full items-center gap-1.5 rounded-sm align-bottom font-mono text-xs font-normal tabular-nums transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="truncate">{display ?? value}</span>
      <Icon
        aria-hidden
        className={cn(
          "size-3 shrink-0",
          copied
            ? "text-green"
            : "text-muted-foreground group-hover/copy:text-foreground"
        )}
      />
    </button>
  )
}
