"use client"

/**
 * Live Support — the entire support console lives in this file: inbox list,
 * conversation thread, composer and the customer detail rail. It is laid out
 * as one full-height three-pane app rather than a stack of floating cards.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  CircleCheck,
  Copy,
  Cpu,
  Inbox,
  Loader2,
  MessageSquare,
  MonitorSmartphone,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  AdminAvatar,
  AdminBadge,
  AdminStatusDot,
  type Tone,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatClockTime,
  formatDayLabel,
  formatRelativeTime,
} from "@/lib/admin/format"
import { playAdminNotificationSound } from "@/lib/admin/notification-sound"
import { useAdminFeedbackStream } from "@/lib/admin/use-admin-feedback-stream"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Sentiment = "like" | "dislike" | "neutral"
type Filter = "all" | "unread" | "like" | "dislike"

type FeedbackMessage = {
  id: string
  author: "user" | "admin"
  body: string
  imageUrl?: string | null
  createdAt: string
}

type FeedbackItem = {
  id: string
  deviceId: string | null
  sentiment: Sentiment
  name: string | null
  message: string
  appVersion: string | null
  osVersion: string | null
  deviceModel: string | null
  modelIdentifier: string | null
  chip: string | null
  memoryGb: number | null
  isResolved: boolean
  userHasUnread: boolean
  needsAdminReply: boolean
  messages: FeedbackMessage[]
  createdAt: string
}

type Totals = {
  total: number
  like: number
  dislike: number
  neutral: number
  unresolved: number
  awaitingReply: number
}

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Needs reply" },
  { id: "like", label: "Praise" },
  { id: "dislike", label: "Issues" },
]

const NEAR_BOTTOM_PX = 140
const GROUP_GAP_MS = 5 * 60 * 1000

const SENTIMENT: Record<Sentiment, { label: string; tone: Tone }> = {
  like: { label: "Praise", tone: "green" },
  dislike: { label: "Issue", tone: "amber" },
  neutral: { label: "Neutral", tone: "neutral" },
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Web tickets send a raw user-agent where the native app sends "14.4.1". */
function readableOsVersion(raw: string): string {
  const fromUserAgent = /Mac OS X (\d+[._]\d+(?:[._]\d+)?)/.exec(raw)
  if (fromUserAgent) return fromUserAgent[1].replaceAll("_", ".")
  if (/mozilla\//i.test(raw)) return "Unknown"
  return raw.replace(/^macOS\s*/i, "")
}

function deviceSpecs(item: FeedbackItem) {
  const specs: Array<{ label: string; value: string }> = []
  if (item.deviceModel) {
    specs.push({
      label: "Mac",
      value: item.modelIdentifier
        ? `${item.deviceModel} (${item.modelIdentifier})`
        : item.deviceModel,
    })
  } else if (item.modelIdentifier) {
    specs.push({ label: "Mac", value: item.modelIdentifier })
  }
  if (item.chip) specs.push({ label: "Chip", value: item.chip })
  if (item.memoryGb && item.memoryGb > 0) {
    specs.push({ label: "Memory", value: `${item.memoryGb} GB` })
  }
  if (item.osVersion) {
    specs.push({ label: "macOS", value: readableOsVersion(item.osVersion) })
  }
  if (item.appVersion) specs.push({ label: "App", value: item.appVersion })
  return specs
}

type MessageGroup = { author: "user" | "admin"; messages: FeedbackMessage[] }
type TimelineItem =
  | { kind: "separator"; key: string; label: string }
  | { kind: "group"; key: string; group: MessageGroup }

function buildTimeline(messages: FeedbackMessage[]): TimelineItem[] {
  const items: TimelineItem[] = []
  let lastDay = ""
  let lastTime = 0

  for (const msg of messages) {
    const date = new Date(msg.createdAt)
    const day = date.toDateString()
    const time = date.getTime()
    const newDay = day !== lastDay

    if (newDay) {
      items.push({
        kind: "separator",
        key: `sep-${msg.id}`,
        label: formatDayLabel(msg.createdAt),
      })
      lastDay = day
    }

    const tail = items.at(-1)
    const openGroup = !newDay && tail?.kind === "group" ? tail.group : undefined

    if (
      openGroup &&
      openGroup.author === msg.author &&
      time - lastTime < GROUP_GAP_MS
    ) {
      openGroup.messages.push(msg)
    } else {
      items.push({
        kind: "group",
        key: msg.id,
        group: { author: msg.author, messages: [msg] },
      })
    }
    lastTime = time
  }

  return items
}

function bubbleShape(
  author: "user" | "admin",
  index: number,
  total: number
): string {
  const isAdmin = author === "admin"
  // iMessage-style: soft 18px corners with a tighter tail on the shared edge
  if (total === 1) return "rounded-[1.125rem]"
  if (index === 0) {
    return isAdmin
      ? "rounded-[1.125rem] rounded-br-md"
      : "rounded-[1.125rem] rounded-bl-md"
  }
  if (index === total - 1) {
    return isAdmin
      ? "rounded-[1.125rem] rounded-tr-md"
      : "rounded-[1.125rem] rounded-tl-md"
  }
  return isAdmin
    ? "rounded-[1.125rem] rounded-r-md"
    : "rounded-[1.125rem] rounded-l-md"
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminFeedbackPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [atBottom, setAtBottom] = useState(true)
  const [copied, setCopied] = useState(false)

  const endRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)

  const selected = items.find((item) => item.id === selectedId) ?? null

  /* --- data ------------------------------------------------------------- */

  const load = useCallback(async (next: Filter, silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/feedback?filter=${next}`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as {
        feedback?: FeedbackItem[]
        totals?: Totals
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Failed to load feedback")
      setItems(json.feedback ?? [])
      setTotals(json.totals ?? null)
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load feedback")
        setItems([])
      }
    } finally {
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load(filter)
    })
  }, [filter, load])

  useAdminFeedbackStream((event) => {
    setLive(true)
    if (event.type === "message" && event.author === "user") {
      playAdminNotificationSound()
    }
    void load(filter, true)
  })

  /* --- selection + scrolling -------------------------------------------- */

  useEffect(() => {
    if (selectedId && !items.some((item) => item.id === selectedId)) {
      queueMicrotask(() => {
        setSelectedId((current) => (current === selectedId ? null : current))
        setDraft("")
      })
    }
  }, [items, selectedId])

  useEffect(() => {
    queueMicrotask(() => {
      setDraft("")
      setComposerError(null)
      setAtBottom(true)
    })
    endRef.current?.scrollIntoView({ block: "end" })
  }, [selectedId])

  const messageCount = selected?.messages.length ?? 0
  useEffect(() => {
    if (atBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageCount])

  useEffect(() => {
    const el = composerRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.min(el.scrollHeight, 176)}px`
  }, [draft])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => {
      const last = item.messages.at(-1)?.body ?? item.message
      return (
        (item.name ?? "").toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term) ||
        last.toLowerCase().includes(term)
      )
    })
  }, [items, search])

  const timeline = useMemo(
    () => (selected ? buildTimeline(selected.messages) : []),
    [selected]
  )

  /* --- actions ----------------------------------------------------------- */

  async function toggleResolved(item: FeedbackItem) {
    const nextResolved = !item.isResolved
    setPendingId(item.id)
    setItems((current) =>
      current.map((row) =>
        row.id === item.id
          ? {
              ...row,
              isResolved: nextResolved,
              needsAdminReply: nextResolved ? false : row.needsAdminReply,
            }
          : row
      )
    )

    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: item.id, isResolved: nextResolved }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? "Update failed")
      }
      void load(filter, true)
    } catch (err) {
      setItems((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, isResolved: item.isResolved } : row
        )
      )
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setPendingId(null)
    }
  }

  async function sendReply() {
    if (!selected) return
    const body = draft.trim()
    if (!body) return

    const optimisticId = `optimistic-${Date.now()}`
    setSending(true)
    setComposerError(null)
    setDraft("")
    setAtBottom(true)
    setItems((current) =>
      current.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              needsAdminReply: false,
              messages: [
                ...row.messages,
                {
                  id: optimisticId,
                  author: "admin" as const,
                  body,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : row
      )
    )

    try {
      const res = await fetch(`/api/admin/feedback/${selected.id}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reply: body }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Reply failed")
      void load(filter, true)
    } catch (err) {
      setItems((current) =>
        current.map((row) =>
          row.id === selected.id
            ? {
                ...row,
                messages: row.messages.filter((m) => m.id !== optimisticId),
              }
            : row
        )
      )
      setDraft(body)
      setComposerError(err instanceof Error ? err.message : "Reply failed")
    } finally {
      setSending(false)
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void sendReply()
    }
  }

  function onThreadScroll() {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    )
  }

  const filterCounts: Record<Filter, number | undefined> = {
    all: totals?.total,
    unread: totals?.awaitingReply,
    like: totals?.like,
    dislike: totals?.dislike,
  }

  /* --- render ------------------------------------------------------------ */

  return (
    <AdminShell
      title="Live Support"
      fill
      actions={
        <>
          <span className="hidden items-center gap-1.5 rounded-full bg-[var(--admin-fill)] px-2.5 py-1 text-xs font-medium text-[var(--admin-fg-soft)] sm:inline-flex">
            <AdminStatusDot tone={live ? "green" : "neutral"} pulse={live} />
            {live ? "Live" : "Connecting…"}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full bg-[var(--admin-fill)] px-2.5 py-1 text-xs font-medium text-[var(--admin-fg-soft)] lg:inline-flex">
            <span className="tabular-nums">{visibleItems.length}</span>
            conversation{visibleItems.length === 1 ? "" : "s"}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full bg-[var(--admin-fill)] px-2.5 py-1 text-xs font-medium text-[var(--admin-fg-soft)] sm:inline-flex">
            <span className="tabular-nums">{totals?.unresolved ?? 0}</span>
            open
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load(filter, true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("size-3.5", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </>
      }
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_18rem]">
        {/* ---------------------------------------------------------------- */}
        {/* Inbox                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section
          className={cn(
            "flex min-h-0 flex-col border-r border-[var(--admin-border)] bg-white",
            selected && "hidden md:flex"
          )}
        >
          <div className="shrink-0 space-y-3 border-b border-[var(--admin-border)] px-4 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="h-9 rounded-full pl-9"
              />
            </div>

            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as Filter)}
            >
              <TabsList className="h-9 w-full justify-between gap-0.5 rounded-full bg-[var(--admin-fill)] p-1">
                {FILTERS.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="h-7 flex-1 gap-1 px-2 text-xs"
                  >
                    <span className="truncate">{item.label}</span>
                    {filterCounts[item.id] ? (
                      <span data-count className="text-[11px] tabular-nums">
                        {filterCounts[item.id]}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="admin-scroll min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-1 p-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex gap-3 rounded-lg p-2.5">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/5 rounded-md" />
                      <Skeleton className="h-3 w-4/5 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <Inbox className="size-7 text-[var(--admin-border-strong)]" />
                <p className="text-[13px] font-medium text-[var(--admin-fg)]">
                  Nothing here
                </p>
                <p className="text-xs text-[var(--admin-muted)]">
                  {search
                    ? "No conversation matches your search."
                    : "No tickets match this filter."}
                </p>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const last = item.messages.at(-1)
                  const preview = last?.body ?? item.message
                  const active = selectedId === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "flex w-full cursor-pointer gap-3 rounded-2xl p-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/30",
                          active
                            ? "bg-[var(--admin-blue-soft)]"
                            : "hover:bg-[var(--admin-fill)]"
                        )}
                      >
                        <AdminAvatar name={item.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-[13px] font-semibold",
                                item.isResolved
                                  ? "text-[var(--admin-muted)]"
                                  : "text-[var(--admin-fg)]"
                              )}
                            >
                              {item.name?.trim() || "Anonymous"}
                            </span>
                            <span className="shrink-0 text-[11px] text-[var(--admin-muted)] tabular-nums">
                              {formatRelativeTime(
                                last?.createdAt ?? item.createdAt
                              )}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "mt-0.5 line-clamp-2 text-xs leading-relaxed",
                              item.needsAdminReply
                                ? "text-[var(--admin-fg-soft)]"
                                : "text-[var(--admin-muted)]"
                            )}
                          >
                            {last?.author === "admin" ? "You: " : ""}
                            {preview}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <AdminBadge tone={SENTIMENT[item.sentiment].tone}>
                              {SENTIMENT[item.sentiment].label}
                            </AdminBadge>
                            {item.needsAdminReply ? (
                              <AdminBadge tone="blue">Needs reply</AdminBadge>
                            ) : null}
                            {item.isResolved ? (
                              <AdminBadge tone="neutral">Closed</AdminBadge>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Conversation                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section
          className={cn(
            "flex min-h-0 flex-col bg-[var(--admin-canvas)]",
            !selected && "hidden md:flex"
          )}
        >
          {error ? (
            <div className="flex items-center gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-red-soft)] px-4 py-2 text-[13px] text-[var(--admin-red)]">
              <TriangleAlert className="size-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white ring-1 ring-[var(--admin-border)]">
                <MessageSquare className="size-5 text-[var(--admin-muted)]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--admin-fg)]">
                  No conversation selected
                </p>
                <p className="mt-1 max-w-xs text-[13px] text-[var(--admin-muted)]">
                  Choose a ticket from the inbox to read the thread and reply in
                  real time.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-white px-4">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-ml-1 md:hidden"
                  aria-label="Back to inbox"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <AdminAvatar name={selected.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-[var(--admin-fg)]">
                      {selected.name?.trim() || "Anonymous"}
                    </span>
                    <AdminBadge tone={SENTIMENT[selected.sentiment].tone}>
                      {SENTIMENT[selected.sentiment].label}
                    </AdminBadge>
                    {selected.isResolved ? (
                      <AdminBadge tone="neutral">Closed</AdminBadge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-[var(--admin-muted)]">
                    Opened {formatRelativeTime(selected.createdAt)} ·{" "}
                    {selected.messages.length} message
                    {selected.messages.length === 1 ? "" : "s"}
                  </p>
                </div>

                <Button
                  variant={selected.isResolved ? "outline" : "secondary"}
                  size="sm"
                  className="hidden sm:inline-flex"
                  disabled={pendingId === selected.id}
                  onClick={() => void toggleResolved(selected)}
                >
                  {pendingId === selected.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : selected.isResolved ? (
                    <RotateCcw className="size-3.5" />
                  ) : (
                    <CircleCheck className="size-3.5" />
                  )}
                  {selected.isResolved ? "Reopen" : "Resolve"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Conversation actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onSelect={() => void toggleResolved(selected)}
                    >
                      {selected.isResolved ? <RotateCcw /> : <CircleCheck />}
                      {selected.isResolved
                        ? "Reopen conversation"
                        : "Mark as resolved"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!selected.deviceId}
                      onSelect={() => {
                        if (!selected.deviceId) return
                        void navigator.clipboard.writeText(selected.deviceId)
                        setCopied(true)
                      }}
                    >
                      {copied ? <Check /> : <Copy />}
                      {copied ? "Device ID copied" : "Copy device ID"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void load(filter, true)}>
                      <RefreshCw />
                      Refresh thread
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <div className="relative min-h-0 flex-1">
                <div
                  ref={scrollRef}
                  onScroll={onThreadScroll}
                  className="admin-scroll h-full overflow-y-auto px-4 py-4 sm:px-6"
                >
                  <div className="mx-auto flex max-w-3xl flex-col gap-1">
                    {timeline.map((item) =>
                      item.kind === "separator" ? (
                        <div
                          key={item.key}
                          className="flex items-center gap-3 py-4"
                        >
                          <span className="h-px flex-1 bg-[var(--admin-border)]" />
                          <span className="text-[11px] font-medium text-[var(--admin-muted)]">
                            {item.label}
                          </span>
                          <span className="h-px flex-1 bg-[var(--admin-border)]" />
                        </div>
                      ) : (
                        <div
                          key={item.key}
                          className={cn(
                            "flex items-end gap-2 pt-2",
                            item.group.author === "admin"
                              ? "flex-row-reverse"
                              : "flex-row"
                          )}
                        >
                          {item.group.author === "user" ? (
                            <AdminAvatar
                              name={selected.name}
                              size="sm"
                              className="mb-5"
                            />
                          ) : (
                            <span className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--admin-blue)] text-[10px] font-semibold text-white">
                              MW
                            </span>
                          )}

                          <div
                            className={cn(
                              "flex max-w-[min(34rem,80%)] min-w-0 flex-col gap-1",
                              item.group.author === "admin"
                                ? "items-end"
                                : "items-start"
                            )}
                          >
                            {item.group.messages.map((msg, index) => (
                              <div
                                key={msg.id}
                                className={cn(
                                  "px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap",
                                  bubbleShape(
                                    item.group.author,
                                    index,
                                    item.group.messages.length
                                  ),
                                  item.group.author === "admin"
                                    ? "bg-[var(--admin-blue)] text-white"
                                    : "bg-[#e9e9eb] text-[var(--admin-fg)]"
                                )}
                              >
                                {msg.body}
                                {msg.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={msg.imageUrl}
                                    alt="Attachment"
                                    className="mt-2 max-h-64 w-auto max-w-full rounded-lg object-cover"
                                  />
                                ) : null}
                              </div>
                            ))}
                            <span className="px-1 text-[11px] text-[var(--admin-muted)]">
                              {item.group.author === "admin"
                                ? "You"
                                : selected.name?.trim() || "Customer"}
                              {" · "}
                              {formatClockTime(
                                item.group.messages.at(-1)!.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                    <div ref={endRef} className="h-1" />
                  </div>
                </div>

                {!atBottom ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-md"
                    onClick={() => {
                      endRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                      })
                      setAtBottom(true)
                    }}
                  >
                    <ArrowDown className="size-3.5" />
                    Jump to latest
                  </Button>
                ) : null}
              </div>

              <footer className="shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-fill)]/70 px-3 py-2.5 backdrop-blur-sm sm:px-5">
                <div className="mx-auto max-w-3xl">
                  {composerError ? (
                    <p className="mb-2 flex items-center gap-1.5 px-1 text-xs text-[var(--admin-red)]">
                      <TriangleAlert className="size-3.5" />
                      {composerError}
                    </p>
                  ) : null}
                  {selected.isResolved ? (
                    <p className="mb-2 px-1 text-xs text-[var(--admin-muted)]">
                      This ticket is closed — replying will not reopen it.
                    </p>
                  ) : null}

                  <div className="flex items-end gap-2">
                    <div
                      className={cn(
                        "flex min-w-0 flex-1 items-end gap-1 rounded-[1.25rem] border bg-white pl-3.5 pr-1.5 shadow-[var(--admin-shadow)] transition-colors",
                        "border-[var(--admin-border-strong)] focus-within:border-[var(--admin-blue)]"
                      )}
                    >
                      <textarea
                        ref={composerRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onComposerKeyDown}
                        rows={1}
                        placeholder="iMessage"
                        aria-label="Write a reply"
                        title="Enter to send · Shift+Enter for a new line"
                        className="admin-scroll max-h-36 min-h-9 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-snug text-[var(--admin-fg)] outline-none placeholder:text-[var(--admin-muted)]"
                      />
                      <button
                        type="button"
                        aria-label="Send reply"
                        disabled={sending || !draft.trim()}
                        onClick={() => void sendReply()}
                        className={cn(
                          "mb-1 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/35",
                          draft.trim()
                            ? "bg-[var(--admin-blue)] text-white hover:bg-[var(--admin-blue-hover)]"
                            : "bg-[var(--admin-fill)] text-[var(--admin-muted)]",
                          "disabled:pointer-events-none"
                        )}
                      >
                        {sending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ArrowUp className="size-4 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </footer>
            </>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Customer detail rail                                             */}
        {/* ---------------------------------------------------------------- */}
        <aside className="admin-scroll hidden min-h-0 overflow-y-auto border-l border-[var(--admin-border)] bg-white xl:block">
          {!selected ? (
            <div className="space-y-5 p-5">
              <p className="text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                Overview
              </p>
              <dl className="space-y-3">
                {[
                  {
                    label: "Total tickets",
                    value: totals?.total ?? 0,
                    icon: Inbox,
                  },
                  {
                    label: "Open",
                    value: totals?.unresolved ?? 0,
                    icon: MessageSquare,
                  },
                  {
                    label: "Needs reply",
                    value: totals?.awaitingReply ?? 0,
                    icon: Send,
                  },
                  { label: "Praise", value: totals?.like ?? 0, icon: ThumbsUp },
                  {
                    label: "Issues",
                    value: totals?.dislike ?? 0,
                    icon: ThumbsDown,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="flex items-center gap-2 text-[13px] text-[var(--admin-muted)]">
                      <Icon className="size-3.5" />
                      {label}
                    </dt>
                    <dd className="text-[13px] font-semibold text-[var(--admin-fg)] tabular-nums">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="divide-y divide-[var(--admin-border)]">
              <div className="flex flex-col items-center gap-2 px-5 py-6 text-center">
                <AdminAvatar
                  name={selected.name}
                  size="lg"
                  className="size-12 text-base"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-fg)]">
                    {selected.name?.trim() || "Anonymous"}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
                    First seen {formatRelativeTime(selected.createdAt)}
                  </p>
                </div>
                <AdminBadge tone={SENTIMENT[selected.sentiment].tone}>
                  {SENTIMENT[selected.sentiment].label}
                </AdminBadge>
              </div>

              {deviceSpecs(selected).length > 0 ? (
                <div className="space-y-3 px-5 py-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                    <Cpu className="size-3.5" />
                    Device
                  </p>
                  <dl className="space-y-2">
                    {deviceSpecs(selected).map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-start justify-between gap-3"
                      >
                        <dt className="shrink-0 text-xs text-[var(--admin-muted)]">
                          {spec.label}
                        </dt>
                        <dd
                          title={spec.value}
                          className="line-clamp-2 min-w-0 text-right text-xs font-medium break-words text-[var(--admin-fg)]"
                        >
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <div className="space-y-2 px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                  <MonitorSmartphone className="size-3.5" />
                  Original feedback
                </p>
                <p className="text-xs leading-relaxed text-[var(--admin-fg-soft)]">
                  {selected.message}
                </p>
              </div>

              {selected.deviceId ? (
                <div className="space-y-2 px-5 py-4">
                  <p className="text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                    Device ID
                  </p>
                  <p className="font-mono text-[11px] break-all text-[var(--admin-fg-soft)]">
                    {selected.deviceId}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  )
}
