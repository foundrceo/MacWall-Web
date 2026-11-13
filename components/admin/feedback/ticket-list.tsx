"use client"

import { Button } from "@/components/ui/button"
import {
  Avatar,
  Badge,
  EmptyState,
  SearchInput,
  Segmented,
  Skeleton,
  StatusDot,
} from "@/components/admin/ui"
import { formatRelativeTime } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import {
  customerName,
  inboxPreview,
  isAutoClosedTicket,
  ticketNeedsReply,
} from "./helpers"
import {
  FILTERS,
  SENTIMENT,
  type FeedbackItem,
  type Filter,
  type VisitorTyping,
} from "./types"

/** Inbox pane: search, filter tabs and the conversations that match. */
export function TicketList({
  items,
  loading,
  failed,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
  selectedId,
  onSelect,
  visitorTypingUntil,
}: Readonly<{
  /** Already searched, filtered and sorted. */
  items: FeedbackItem[]
  loading: boolean
  /** The inbox could not be loaded, so "empty" would be a lie. */
  failed: boolean
  search: string
  onSearchChange: (value: string) => void
  filter: Filter
  onFilterChange: (value: Filter) => void
  counts: Record<Filter, number>
  selectedId: string | null
  onSelect: (id: string) => void
  visitorTypingUntil: VisitorTyping
}>) {
  // "Closed" is noise on rows when every row in the list is closed.
  const showClosedBadge = Boolean(search.trim()) || filter !== "closed"

  return (
    <>
      <div className="shrink-0 space-y-2 border-b border-border p-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search name, Chat ID or message"
          label="Search conversations"
          className="sm:w-full"
        />
        <Segmented
          label="Filter conversations"
          size="sm"
          className="w-full"
          value={filter}
          onChange={onFilterChange}
          options={FILTERS.map((item) => ({
            value: item.id,
            label: item.label,
            // The two working queues carry a count; Closed and All are
            // archives, and the header says how many are showing.
            count:
              !loading &&
              !failed &&
              (item.id === "unread" || item.id === "open")
                ? counts[item.id]
                : undefined,
          }))}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <TicketListSkeleton />
        ) : failed ? (
          <EmptyState
            title="Inbox unavailable"
            description="Conversations will appear here once the inbox loads."
          />
        ) : items.length === 0 ? (
          <EmptyList
            search={search}
            filter={filter}
            onShowOpen={() => onFilterChange("open")}
          />
        ) : (
          <ul className="space-y-0.5 p-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <TicketRow
                  item={item}
                  active={item.id === selectedId}
                  typing={item.id in visitorTypingUntil}
                  showClosedBadge={showClosedBadge}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function TicketRow({
  item,
  active,
  typing,
  showClosedBadge,
  onSelect,
}: Readonly<{
  item: FeedbackItem
  active: boolean
  typing: boolean
  showClosedBadge: boolean
  onSelect: (id: string) => void
}>) {
  const name = customerName(item.name)
  const needsReply = ticketNeedsReply(item)
  const last = item.messages.at(-1)

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-lg px-1.5 py-2.5 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-fill-hover" : "hover:bg-fill"
      )}
    >
      <Avatar name={name} className="mt-px" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[13px]",
              needsReply
                ? "font-semibold text-foreground"
                : item.isResolved
                  ? "font-medium text-muted-foreground"
                  : "text-soft font-medium"
            )}
          >
            {name}
          </span>
          {item.sentiment !== "neutral" ? (
            <Badge tone={SENTIMENT[item.sentiment].tone}>
              {SENTIMENT[item.sentiment].label}
            </Badge>
          ) : null}
          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {formatRelativeTime(last?.createdAt ?? item.createdAt)}
          </span>
        </span>
        <span className="mt-0.5 flex h-5 items-center gap-2">
          {typing ? (
            <span className="text-blue min-w-0 flex-1 truncate text-xs font-medium">
              Typing…
            </span>
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-xs",
                needsReply ? "text-soft" : "text-muted-foreground"
              )}
            >
              {inboxPreview(item)}
            </span>
          )}
          {needsReply ? (
            <StatusDot tone="blue" label="Needs a reply" />
          ) : item.isResolved && showClosedBadge ? (
            <Badge>{isAutoClosedTicket(item) ? "Auto-closed" : "Closed"}</Badge>
          ) : null}
        </span>
      </span>
    </button>
  )
}

function EmptyList({
  search,
  filter,
  onShowOpen,
}: Readonly<{ search: string; filter: Filter; onShowOpen: () => void }>) {
  if (search) {
    return (
      <EmptyState
        title="No matches"
        description="Try another name, Chat ID or a word from the conversation."
      />
    )
  }
  if (filter === "unread") {
    return (
      <EmptyState
        title="Nothing needs a reply"
        description="Open tickets waiting on the customer are under Open."
        action={
          <Button variant="outline" size="sm" onClick={onShowOpen}>
            View open conversations
          </Button>
        }
      />
    )
  }
  return (
    <EmptyState
      title={
        filter === "open"
          ? "No open conversations"
          : filter === "closed"
            ? "No closed conversations"
            : "No conversations yet"
      }
      description="New chats from the website and the app show up here live."
    />
  )
}

function TicketListSkeleton() {
  return (
    <div role="status" aria-label="Loading conversations" className="p-1.5">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-start gap-2.5 px-1.5 py-2.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <Skeleton
                className={cn("h-3.5", index % 3 === 0 ? "w-2/5" : "w-1/2")}
              />
              <Skeleton className="ml-auto h-3 w-9 shrink-0" />
            </div>
            <Skeleton
              className={cn("mt-2 h-3", index % 2 === 0 ? "w-4/5" : "w-3/5")}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
