"use client"

/**
 * Live support: inbox, conversation and customer details in one full-height
 * view. Data and behaviour live in the hooks next to this file; this file
 * only lays the panes out.
 */

import { RefreshCw } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { AdminPage } from "@/components/admin/page"
import { IconButton, Notice, StatusDot } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { Conversation } from "./conversation"
import {
  buildTimeline,
  chatIdForItem,
  countInbox,
  filterInbox,
  threadMessages,
} from "./helpers"
import { TicketDetails } from "./ticket-details"
import { TicketList } from "./ticket-list"
import type { Filter } from "./types"
import { FeedbackStream, useFeedbackInbox } from "./use-feedback-inbox"
import { useReplyComposer } from "./use-reply-composer"
import { useThreadScroll } from "./use-thread-scroll"

/**
 * The stream closes itself every few minutes and reconnects within seconds,
 * so only a drop that lasts this long is worth interrupting the admin for.
 */
const DROPPED_AFTER_MS = 6_000

export function FeedbackView() {
  const [filter, setFilter] = useState<Filter>("open")
  const [search, setSearch] = useState("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [stalledSince, setStalledSince] = useState<number | null>(null)

  const inbox = useFeedbackInbox()
  const {
    items,
    totals,
    loading,
    refreshing,
    error,
    live,
    offlineSince,
    selected,
    selectedId,
    setSelectedId,
    load,
  } = inbox

  const scroll = useThreadScroll({
    selectedId,
    messageCount: selected ? threadMessages(selected).length : 0,
    visitorTyping: inbox.selectedVisitorTyping,
  })

  const composer = useReplyComposer({
    selected,
    selectedId,
    setItems: inbox.setItems,
    sendingRef: inbox.sendingRef,
    load,
    onSendStart: scroll.pinToBottom,
  })
  const { setComposerError } = composer

  const visibleItems = useMemo(
    () => filterInbox(items, search, filter),
    [items, search, filter]
  )
  const inboxCounts = useMemo(() => countInbox(items), [items])
  const timeline = useMemo(
    () => (selected ? buildTimeline(threadMessages(selected)) : []),
    [selected]
  )
  const selectedChatId = selected ? chatIdForItem(selected) : null

  useEffect(() => {
    if (!copiedField) return
    const timer = window.setTimeout(() => setCopiedField(null), 1600)
    return () => window.clearTimeout(timer)
  }, [copiedField])

  const copyValue = useCallback(
    async (field: string, value: string) => {
      try {
        await navigator.clipboard.writeText(value)
        setCopiedField(field)
        return true
      } catch {
        setComposerError("Couldn’t copy to clipboard")
        return false
      }
    },
    [setComposerError]
  )

  useEffect(() => {
    if (offlineSince === null) return
    const timer = window.setTimeout(
      () => setStalledSince(offlineSince),
      DROPPED_AFTER_MS
    )
    return () => window.clearTimeout(timer)
  }, [offlineSince])
  const dropped = offlineSince !== null && stalledSince === offlineSince

  const firstLoad = loading && items.length === 0
  /** The inbox never loaded, so there are no counts to show. */
  const unavailable = Boolean(error?.retry) && items.length === 0
  const details = unavailable ? null : (
    <TicketDetails
      ticket={selected}
      loading={firstLoad}
      chatId={selectedChatId}
      counts={inboxCounts}
      copiedField={copiedField}
      onCopy={(field, value) => void copyValue(field, value)}
    />
  )

  return (
    <AdminPage
      title="Live support"
      fill
      actions={
        <>
          <span
            role="status"
            className="text-soft flex items-center gap-2 text-xs"
          >
            <StatusDot
              tone={live ? "green" : dropped ? "amber" : "neutral"}
              pulse={live}
            />
            {live ? "Live" : dropped ? "Offline" : "Connecting…"}
          </span>
          {firstLoad || unavailable ? null : (
            <span className="hidden border-l border-border pl-3 text-xs text-muted-foreground tabular-nums sm:inline">
              {visibleItems.length} conversation
              {visibleItems.length === 1 ? "" : "s"}
              {" · "}
              {totals?.unresolved ?? 0} open
            </span>
          )}
          <IconButton
            label="Refresh"
            side="bottom"
            disabled={refreshing}
            onClick={() => void load(true)}
          >
            <RefreshCw
              aria-hidden
              className={cn(
                refreshing && "animate-spin motion-reduce:animate-none"
              )}
            />
          </IconButton>
        </>
      }
    >
      <FeedbackStream key={inbox.streamEpoch} onEvent={inbox.onStreamEvent} />

      {error || dropped ? (
        <div className="shrink-0 space-y-2 border-b border-border px-3 py-2.5 sm:px-4">
          {error ? (
            <Notice
              tone="error"
              title={
                error.retry
                  ? "Couldn’t load conversations"
                  : "Couldn’t update the ticket"
              }
              action={
                error.retry ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void load()}
                  >
                    Retry
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={inbox.dismissError}
                  >
                    Dismiss
                  </Button>
                )
              }
            >
              {error.message}
            </Notice>
          ) : null}
          {dropped ? (
            <Notice
              tone="warning"
              title="Live updates are paused"
              action={
                <Button variant="outline" size="sm" onClick={inbox.reconnect}>
                  Reconnect
                </Button>
              }
            >
              Reconnecting automatically. Until then the inbox checks for new
              messages every 45 seconds.
            </Notice>
          ) : null}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <section
          aria-label="Inbox"
          className={cn(
            "min-h-0 w-full flex-col lg:w-80 lg:shrink-0 lg:border-r lg:border-border",
            selected ? "hidden lg:flex" : "flex"
          )}
        >
          <TicketList
            items={visibleItems}
            loading={firstLoad}
            failed={unavailable}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            counts={inboxCounts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            visitorTypingUntil={inbox.visitorTypingUntil}
          />
        </section>

        <section
          aria-label="Conversation"
          className={cn(
            "min-h-0 min-w-0 flex-1 flex-col",
            selected ? "flex" : "hidden lg:flex"
          )}
        >
          <Conversation
            ticket={selected}
            loading={firstLoad}
            chatId={selectedChatId}
            timeline={timeline}
            visitorTyping={inbox.selectedVisitorTyping}
            pending={selected !== null && inbox.pendingId === selected.id}
            scroll={scroll}
            composer={composer}
            onBack={() => setSelectedId(null)}
            onToggleResolved={(ticket) => void inbox.toggleResolved(ticket)}
            onOpenDetails={() => setDetailsOpen(true)}
            onCopy={(field, value, what) =>
              void copyValue(field, value).then((ok) => {
                if (ok) toast.success(`${what} copied`)
              })
            }
            onRefresh={() => void load(true)}
          />
        </section>

        <aside
          aria-label="Customer details"
          className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-border xl:block"
        >
          {details}
        </aside>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-[320px]! max-w-[calc(100vw-2rem)]! gap-0 overflow-y-auto border-border bg-background p-0">
          <SheetHeader className="flex h-14 shrink-0 flex-row items-center border-b border-border px-4 py-0">
            <SheetTitle className="text-[13px] font-semibold">
              Customer details
            </SheetTitle>
            <SheetDescription className="sr-only">
              Contact, device and diagnostics for this conversation.
            </SheetDescription>
          </SheetHeader>
          {details}
        </SheetContent>
      </Sheet>
    </AdminPage>
  )
}
