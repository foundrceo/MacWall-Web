"use client"

import {
  ArrowLeft,
  CircleCheck,
  Copy,
  MessageSquare,
  MoreHorizontal,
  PanelRight,
  RefreshCw,
  RotateCcw,
} from "lucide-react"

import {
  Avatar,
  Badge,
  EmptyState,
  IconButton,
  Spinner,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRelativeTime } from "@/lib/admin/format"

import { Composer } from "./composer"
import { customerName, isAutoClosedTicket, threadMessages } from "./helpers"
import { Thread, ThreadSkeleton } from "./thread"
import { SENTIMENT, type FeedbackItem, type TimelineItem } from "./types"
import type { ReplyComposer } from "./use-reply-composer"
import type { ThreadScroll } from "./use-thread-scroll"

/** Middle pane: who the ticket is from, the transcript and the reply box. */
export function Conversation({
  ticket,
  loading,
  chatId,
  timeline,
  visitorTyping,
  pending,
  scroll,
  composer,
  onBack,
  onToggleResolved,
  onOpenDetails,
  onCopy,
  onRefresh,
}: Readonly<{
  ticket: FeedbackItem | null
  /** First load, before any ticket is known. */
  loading: boolean
  chatId: string | null
  timeline: TimelineItem[]
  visitorTyping: boolean
  /** A resolve/reopen request for this ticket is in flight. */
  pending: boolean
  scroll: ThreadScroll
  composer: ReplyComposer
  onBack: () => void
  onToggleResolved: (ticket: FeedbackItem) => void
  onOpenDetails: () => void
  /** Copies and confirms with a toast (the menu closes on select). */
  onCopy: (field: string, value: string, what: string) => void
  onRefresh: () => void
}>) {
  if (!ticket) {
    if (loading) return <ThreadSkeleton />
    return (
      <EmptyState
        className="flex-1"
        icon={<MessageSquare />}
        title="Select a conversation"
        description="Pick a ticket from the inbox to read the thread and reply. New messages arrive live."
      />
    )
  }

  const name = customerName(ticket.name)
  const messageCount = threadMessages(ticket).length
  const ToggleIcon = ticket.isResolved ? RotateCcw : CircleCheck
  const toggleLabel = ticket.isResolved ? "Reopen" : "Resolve"

  return (
    <>
      <header className="@container flex min-h-14 shrink-0 items-center gap-2.5 border-b border-border px-3 py-2 sm:px-4">
        <IconButton
          label="Back to inbox"
          className="-ml-1 lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden />
        </IconButton>
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[13px] font-semibold text-foreground">
              {name}
            </h2>
            {ticket.sentiment !== "neutral" ? (
              <Badge
                tone={SENTIMENT[ticket.sentiment].tone}
                className="hidden @[32rem]:inline-flex"
              >
                {SENTIMENT[ticket.sentiment].label}
              </Badge>
            ) : null}
            {ticket.isResolved ? (
              <Badge>
                {isAutoClosedTicket(ticket) ? "Auto-closed" : "Closed"}
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {chatId ? (
              <>
                <span className="font-mono tabular-nums">{chatId}</span>
                {" · "}
              </>
            ) : null}
            Opened {formatRelativeTime(ticket.createdAt)} · {messageCount}{" "}
            message{messageCount === 1 ? "" : "s"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="px-2 @[23rem]:px-3"
          disabled={pending}
          aria-label={`${toggleLabel} conversation`}
          onClick={() => onToggleResolved(ticket)}
        >
          {pending ? (
            <Spinner className="size-3.5" />
          ) : (
            <ToggleIcon aria-hidden className="size-3.5" />
          )}
          <span className="hidden @[23rem]:inline">{toggleLabel}</span>
        </Button>
        <IconButton
          label="Customer details"
          className="xl:hidden"
          onClick={onOpenDetails}
        >
          <PanelRight aria-hidden />
        </IconButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="More conversation actions"
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => onToggleResolved(ticket)}
            >
              <ToggleIcon aria-hidden />
              {ticket.isResolved ? "Reopen conversation" : "Mark as resolved"}
            </DropdownMenuItem>
            {chatId ? (
              <DropdownMenuItem
                onSelect={() => onCopy("chatId", chatId, "Chat ID")}
              >
                <Copy aria-hidden />
                Copy Chat ID
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              disabled={!ticket.deviceId}
              onSelect={() => {
                if (!ticket.deviceId) return
                onCopy("deviceId", ticket.deviceId, "Device ID")
              }}
            >
              <Copy aria-hidden />
              Copy device ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onRefresh}>
              <RefreshCw aria-hidden />
              Refresh thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Thread
        timeline={timeline}
        customer={name}
        visitorTyping={visitorTyping}
        scroll={scroll}
      />

      <Composer ticket={ticket} composer={composer} />
    </>
  )
}
