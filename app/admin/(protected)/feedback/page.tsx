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
  ImagePlus,
  Inbox,
  Loader2,
  MessageSquare,
  MonitorSmartphone,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  TriangleAlert,
  X,
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
type Filter = "unread" | "open" | "closed" | "all"

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
  { id: "unread", label: "Reply" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "all", label: "All" },
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
  if (/mozilla\//i.test(raw)) return "Web browser"
  return raw.replace(/^macOS\s*/i, "")
}

/** Public Chat ID from web widget ticket body (`Chat ID: MW-XXXXXX`). */
function extractChatId(text: string | null | undefined): string | null {
  if (!text) return null
  const match = /Chat ID:\s*(MW-[A-Z0-9]+)/i.exec(text)
  return match?.[1]?.toUpperCase() ?? null
}

function chatIdForItem(item: FeedbackItem): string | null {
  // Prefer first user message (stable Chat ID line), then root message column
  const firstUser = item.messages.find((m) => m.author === "user")
  return extractChatId(firstUser?.body ?? null) ?? extractChatId(item.message)
}

/** Cleaner “original issue” without Chat ID header / transcript dump. */
function originalIssuePreview(item: FeedbackItem): string {
  const source =
    item.messages.find((m) => m.author === "user")?.body ?? item.message
  let body = source.replace(/^Chat ID:\s*MW-[A-Z0-9]+\s*/i, "").trim()
  const cut = body.search(/\n—\s*Chat transcript\s*—/i)
  if (cut >= 0) body = body.slice(0, cut).trim()
  return body || source
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
  if (item.appVersion) {
    specs.push({
      label: "App",
      value: item.appVersion === "Web" ? "MacWall Web" : item.appVersion,
    })
  } else if (!item.deviceModel && !item.modelIdentifier) {
    specs.push({ label: "Source", value: "Web chat" })
  }
  return specs
}

function matchesSearch(item: FeedbackItem, term: string): boolean {
  const haystacks: string[] = [
    item.name ?? "",
    item.message,
    item.id,
    item.deviceId ?? "",
    chatIdForItem(item) ?? "",
    item.appVersion ?? "",
    item.osVersion ?? "",
    item.deviceModel ?? "",
    item.modelIdentifier ?? "",
    item.chip ?? "",
    ...item.messages.map((m) => m.body),
  ]
  return haystacks.some((value) => value.toLowerCase().includes(term))
}

function ticketNeedsReply(item: FeedbackItem): boolean {
  if (item.isResolved) return false
  if (item.needsAdminReply) return true
  const last = item.messages.at(-1)
  // Derive from thread — DB flag can lag after user follow-ups / new tickets
  if (!last) return Boolean(item.message.trim())
  return last.author === "user"
}

function sortInbox(a: FeedbackItem, b: FeedbackItem): number {
  const aNeeds = ticketNeedsReply(a)
  const bNeeds = ticketNeedsReply(b)
  if (aNeeds !== bNeeds) return aNeeds ? -1 : 1
  if (a.isResolved !== b.isResolved) {
    return a.isResolved ? 1 : -1
  }
  const aLast = a.messages.at(-1)?.createdAt ?? a.createdAt
  const bLast = b.messages.at(-1)?.createdAt ?? b.createdAt
  return new Date(bLast).getTime() - new Date(aLast).getTime()
}

/** Ensure thread UI always has something to render even if messages failed to load. */
function threadMessages(item: FeedbackItem): FeedbackMessage[] {
  if (item.messages.length > 0) return item.messages
  if (!item.message.trim()) return []
  return [
    {
      id: `root-${item.id}`,
      author: "user",
      body: item.message,
      createdAt: item.createdAt,
    },
  ]
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
  const [filter, setFilter] = useState<Filter>("open")
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
  const [pendingImage, setPendingImage] = useState<{
    file: File
    previewUrl: string
  } | null>(null)
  const [live, setLive] = useState(false)
  const [atBottom, setAtBottom] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const endRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const selected = items.find((item) => item.id === selectedId) ?? null

  /* --- data ------------------------------------------------------------- */

  const loadSeqRef = useRef(0)
  const sendingRef = useRef(false)

  const load = useCallback(async (silent = false) => {
    // Don't wipe an in-flight optimistic reply (esp. image uploads).
    if (silent && sendingRef.current) return

    const seq = ++loadSeqRef.current
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      // Always load the full inbox so search + tab filters work client-side
      const res = await fetch(`/api/admin/feedback?filter=all`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as {
        feedback?: FeedbackItem[]
        totals?: Totals
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Failed to load feedback")
      if (seq !== loadSeqRef.current) return
      if (sendingRef.current) return
      setItems(json.feedback ?? [])
      setTotals(json.totals ?? null)
    } catch (err) {
      if (seq !== loadSeqRef.current) return
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load feedback")
        setItems([])
      }
    } finally {
      if (seq !== loadSeqRef.current) return
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  useAdminFeedbackStream((event) => {
    if (event.type === "connected") {
      setLive(true)
      return
    }
    if (event.type === "offline") {
      setLive(false)
      return
    }
    setLive(true)
    if (event.type === "message" && event.author === "user") {
      playAdminNotificationSound()
    }
    void load(true)
  })

  // Safety-net poll so new web chats appear even if SSE is quiet
  useEffect(() => {
    const ms = live ? 45_000 : 20_000
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return
      void load(true)
    }, ms)
    return () => window.clearInterval(id)
  }, [live, load])

  /* --- selection + scrolling -------------------------------------------- */

  useEffect(() => {
    if (selectedId && !items.some((item) => item.id === selectedId)) {
      queueMicrotask(() => {
        setSelectedId((current) => (current === selectedId ? null : current))
        setDraft("")
        setPendingImage((prev) => {
          if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
          return null
        })
      })
    }
  }, [items, selectedId])

  useEffect(() => {
    queueMicrotask(() => {
      setDraft("")
      setComposerError(null)
      setAtBottom(true)
      setPendingImage((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return null
      })
    })
    endRef.current?.scrollIntoView({ block: "end" })
  }, [selectedId])

  const messageCount = selected ? threadMessages(selected).length : 0
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
    if (!copiedField) return
    const timer = window.setTimeout(() => setCopiedField(null), 1600)
    return () => window.clearTimeout(timer)
  }, [copiedField])

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = items
    if (term) {
      // Search across the full inbox (name, Chat ID, device, messages)
      list = list.filter((item) => matchesSearch(item, term))
    } else if (filter === "unread") {
      list = list.filter((item) => ticketNeedsReply(item))
    } else if (filter === "open") {
      // Continue conversations — all open tickets
      list = list.filter((item) => !item.isResolved)
    } else if (filter === "closed") {
      list = list.filter((item) => item.isResolved)
    }
    return [...list].sort(sortInbox)
  }, [items, search, filter])

  const selectedChatId = selected ? chatIdForItem(selected) : null

  const copyValue = useCallback(async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
    } catch {
      setComposerError("Couldn’t copy to clipboard")
    }
  }, [])

  const timeline = useMemo(
    () => (selected ? buildTimeline(threadMessages(selected)) : []),
    [selected]
  )

  /* --- actions ----------------------------------------------------------- */

  async function toggleResolved(item: FeedbackItem) {
    if (pendingId === item.id) return
    const nextResolved = !item.isResolved
    const snapshot = {
      isResolved: item.isResolved,
      needsAdminReply: item.needsAdminReply,
    }
    // On reopen, if last message is from user, surface Reply again
    const lastAuthor = item.messages.at(-1)?.author
    const nextNeedsReply = nextResolved
      ? false
      : lastAuthor === "user"
        ? true
        : item.needsAdminReply

    setPendingId(item.id)
    setItems((current) =>
      current.map((row) =>
        row.id === item.id
          ? {
              ...row,
              isResolved: nextResolved,
              needsAdminReply: nextNeedsReply,
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
      void load(true)
    } catch (err) {
      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? {
                ...row,
                isResolved: snapshot.isResolved,
                needsAdminReply: snapshot.needsAdminReply,
              }
            : row
        )
      )
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setPendingId(null)
    }
  }

  function clearPendingImage() {
    setPendingImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
    if (fileRef.current) fileRef.current.value = ""
  }

  function acceptComposerImage(file: File | null | undefined) {
    if (!file) return
    const type = file.type.toLowerCase()
    const ext = file.name.split(".").pop()?.toLowerCase()
    const allowedType =
      type === "image/jpeg" || type === "image/png" || type === "image/webp"
    const allowedExt = Boolean(
      ext && ["jpg", "jpeg", "png", "webp"].includes(ext)
    )
    if ((!allowedType && !allowedExt) || file.size <= 0 || file.size > 4 * 1024 * 1024) {
      setComposerError("Images only — jpg, png, or webp under 4MB.")
      return
    }
    setComposerError(null)
    setPendingImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })
  }

  async function uploadAdminImage(ticketId: string, file: File): Promise<string> {
    const form = new FormData()
    form.append("file", file)
    form.append("ticketId", ticketId)
    const res = await fetch("/api/admin/feedback/upload", {
      method: "POST",
      body: form,
      credentials: "same-origin",
    })
    const json = (await res.json()) as { publicUrl?: string; error?: string }
    if (!res.ok || !json.publicUrl) {
      throw new Error(json.error ?? "Couldn’t upload image")
    }
    return json.publicUrl
  }

  async function sendReply() {
    if (!selected || sendingRef.current) return
    const body = draft.trim()
    const imageFile = pendingImage?.file ?? null
    const localPreview = pendingImage?.previewUrl ?? null
    if (!body && !imageFile) return

    const ticketId = selected.id
    const priorNeedsReply = selected.needsAdminReply
    const optimisticId = `optimistic-${Date.now()}`
    sendingRef.current = true
    setSending(true)
    setComposerError(null)
    setDraft("")
    setAtBottom(true)

    setItems((current) =>
      current.map((row) =>
        row.id === ticketId
          ? {
              ...row,
              needsAdminReply: false,
              messages: [
                ...row.messages,
                {
                  id: optimisticId,
                  author: "admin" as const,
                  body: body || " ",
                  imageUrl: localPreview,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : row
      )
    )
    setPendingImage(null)
    if (fileRef.current) fileRef.current.value = ""

    try {
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadAdminImage(ticketId, imageFile)
        // Swap blob preview for the durable public URL before the network reply.
        if (imageUrl) {
          setItems((current) =>
            current.map((row) =>
              row.id === ticketId
                ? {
                    ...row,
                    messages: row.messages.map((m) =>
                      m.id === optimisticId ? { ...m, imageUrl } : m
                    ),
                  }
                : row
            )
          )
          if (localPreview) URL.revokeObjectURL(localPreview)
        }
      }

      const res = await fetch(`/api/admin/feedback/${ticketId}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reply: body, imageUrl }),
      })
      const json = (await res.json()) as {
        feedback?: FeedbackItem
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Reply failed")

      if (json.feedback) {
        setItems((current) =>
          current.map((row) => (row.id === ticketId ? json.feedback! : row))
        )
      } else {
        void load(true)
      }
    } catch (err) {
      setItems((current) =>
        current.map((row) =>
          row.id === ticketId
            ? {
                ...row,
                needsAdminReply: priorNeedsReply,
                messages: row.messages.filter((m) => m.id !== optimisticId),
              }
            : row
        )
      )
      setDraft(body)
      if (imageFile) {
        setPendingImage({
          file: imageFile,
          previewUrl: URL.createObjectURL(imageFile),
        })
      }
      setComposerError(err instanceof Error ? err.message : "Reply failed")
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (sendingRef.current || sending) return
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

  const inboxCounts = useMemo(() => {
    const open = items.filter((item) => !item.isResolved).length
    const closed = items.filter((item) => item.isResolved).length
    const needsReply = items.filter((item) => ticketNeedsReply(item)).length
    return {
      unread: needsReply,
      open,
      closed,
      all: items.length,
    } satisfies Record<Filter, number>
  }, [items])

  const filterCounts: Record<Filter, number | undefined> = inboxCounts

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
            onClick={() => void load(true)}
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
                placeholder="Search name, Chat ID…"
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
                    {typeof filterCounts[item.id] === "number" ? (
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
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <Inbox className="size-7 text-[var(--admin-border-strong)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--admin-fg)]">
                    {search
                      ? "No matches"
                      : filter === "unread"
                        ? "Nothing needs a reply"
                        : filter === "open"
                          ? "No open conversations"
                          : filter === "closed"
                            ? "No closed conversations"
                            : "Nothing here"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {search
                      ? "Try another name or Chat ID."
                      : filter === "unread"
                        ? "Open tickets waiting on the customer are under Open."
                        : "New chats from the website will show up here live."}
                  </p>
                </div>
                {!search && filter === "unread" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter("open")}
                  >
                    View open conversations
                  </Button>
                ) : null}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const last = item.messages.at(-1)
                  const preview = last?.body ?? originalIssuePreview(item)
                  const active = selectedId === item.id
                  const chatId = chatIdForItem(item)
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
                          {chatId ? (
                            <p className="mt-0.5 font-mono text-[10px] tracking-wide text-[var(--admin-muted)] tabular-nums">
                              {chatId}
                            </p>
                          ) : null}
                          <p
                            className={cn(
                              "mt-0.5 line-clamp-2 text-xs leading-relaxed",
                              ticketNeedsReply(item)
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
                            {ticketNeedsReply(item) ? (
                              <AdminBadge tone="blue">Reply</AdminBadge>
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
                    {selectedChatId ? (
                      <>
                        <span className="font-mono tabular-nums">
                          {selectedChatId}
                        </span>
                        {" · "}
                      </>
                    ) : null}
                    Opened {formatRelativeTime(selected.createdAt)} ·{" "}
                    {threadMessages(selected).length} message
                    {threadMessages(selected).length === 1 ? "" : "s"}
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
                      disabled={pendingId === selected.id}
                      onSelect={() => void toggleResolved(selected)}
                    >
                      {selected.isResolved ? <RotateCcw /> : <CircleCheck />}
                      {selected.isResolved
                        ? "Reopen conversation"
                        : "Mark as resolved"}
                    </DropdownMenuItem>
                    {selectedChatId ? (
                      <DropdownMenuItem
                        onSelect={() =>
                          void copyValue("chatId", selectedChatId)
                        }
                      >
                        {copiedField === "chatId" ? <Check /> : <Copy />}
                        {copiedField === "chatId"
                          ? "Chat ID copied"
                          : "Copy Chat ID"}
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      disabled={!selected.deviceId}
                      onSelect={() => {
                        if (!selected.deviceId) return
                        void copyValue("deviceId", selected.deviceId)
                      }}
                    >
                      {copiedField === "deviceId" ? <Check /> : <Copy />}
                      {copiedField === "deviceId"
                        ? "Device ID copied"
                        : "Copy device ID"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void load(true)}>
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
                                  "overflow-hidden text-[15px] leading-snug",
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
                                {msg.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={msg.imageUrl}
                                    alt="Attachment"
                                    className={cn(
                                      "max-h-64 w-auto max-w-full object-cover",
                                      msg.body.trim() ? "rounded-t-[inherit]" : ""
                                    )}
                                  />
                                ) : null}
                                {msg.body.trim() ? (
                                  <div
                                    className={cn(
                                      "px-3.5 py-2 whitespace-pre-wrap",
                                      msg.imageUrl &&
                                        "border-t border-black/10"
                                    )}
                                  >
                                    {msg.body}
                                  </div>
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

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      acceptComposerImage(event.target.files?.[0])
                      event.target.value = ""
                    }}
                  />

                  {pendingImage ? (
                    <div className="mb-2 flex items-start gap-2 px-1">
                      <div className="relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pendingImage.previewUrl}
                          alt="Attachment preview"
                          className="max-h-28 w-auto max-w-[12rem] object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearPendingImage}
                          disabled={sending}
                          className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75 disabled:opacity-50"
                          aria-label="Remove attachment"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-end gap-2">
                    <div
                      className={cn(
                        "flex min-w-0 flex-1 items-end gap-1 rounded-[1.25rem] border bg-white pr-1.5 pl-2 shadow-[var(--admin-shadow)] transition-colors",
                        "border-[var(--admin-border-strong)] focus-within:border-[var(--admin-blue)]"
                      )}
                    >
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => fileRef.current?.click()}
                        className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--admin-blue)] transition hover:bg-[var(--admin-blue-soft)] disabled:opacity-40"
                        aria-label="Attach image"
                        title="Attach image"
                      >
                        <ImagePlus className="size-4" />
                      </button>
                      <textarea
                        ref={composerRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onComposerKeyDown}
                        onPaste={(event) => {
                          const file = Array.from(
                            event.clipboardData?.files ?? []
                          ).find((f) => f.type.startsWith("image/"))
                          if (file) {
                            event.preventDefault()
                            acceptComposerImage(file)
                          }
                        }}
                        rows={1}
                        placeholder="Message…"
                        aria-label="Write a reply"
                        title="Enter to send · Shift+Enter for a new line"
                        className="admin-scroll max-h-36 min-h-9 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-snug text-[var(--admin-fg)] outline-none placeholder:text-[var(--admin-muted)]"
                      />
                      <button
                        type="button"
                        aria-label="Send reply"
                        disabled={
                          sending || (!draft.trim() && !pendingImage)
                        }
                        onClick={() => void sendReply()}
                        className={cn(
                          "mb-1 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/35",
                          draft.trim() || pendingImage
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
                    label: "Reply",
                    value: inboxCounts.unread,
                    icon: Send,
                  },
                  {
                    label: "Open",
                    value: inboxCounts.open,
                    icon: MessageSquare,
                  },
                  {
                    label: "Closed",
                    value: inboxCounts.closed,
                    icon: CircleCheck,
                  },
                  {
                    label: "All",
                    value: inboxCounts.all,
                    icon: Inbox,
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
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <AdminBadge tone={SENTIMENT[selected.sentiment].tone}>
                    {SENTIMENT[selected.sentiment].label}
                  </AdminBadge>
                  {ticketNeedsReply(selected) ? (
                    <AdminBadge tone="blue">Reply</AdminBadge>
                  ) : null}
                  <AdminBadge tone={selected.isResolved ? "neutral" : "green"}>
                    {selected.isResolved ? "Closed" : "Open"}
                  </AdminBadge>
                </div>
              </div>

              <div className="space-y-3 px-5 py-4">
                <p className="text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                  Conversation
                </p>
                <dl className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 pt-0.5 text-xs text-[var(--admin-muted)]">
                      Chat ID
                    </dt>
                    <dd className="min-w-0 text-right">
                      {selectedChatId ? (
                        <button
                          type="button"
                          onClick={() =>
                            void copyValue("rail-chatId", selectedChatId)
                          }
                          className="inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs font-medium text-[var(--admin-fg)] tabular-nums transition hover:bg-[var(--admin-fill)]"
                          title="Copy Chat ID"
                        >
                          <span className="truncate">{selectedChatId}</span>
                          {copiedField === "rail-chatId" ? (
                            <Check className="size-3 shrink-0 text-[var(--admin-green)]" />
                          ) : (
                            <Copy className="size-3 shrink-0 text-[var(--admin-muted)]" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--admin-muted)]">
                          —
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 pt-0.5 text-xs text-[var(--admin-muted)]">
                      Status
                    </dt>
                    <dd className="text-right text-xs font-medium text-[var(--admin-fg)]">
                      {selected.isResolved
                        ? "Closed"
                        : ticketNeedsReply(selected)
                          ? "Reply"
                          : "Waiting on customer"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 pt-0.5 text-xs text-[var(--admin-muted)]">
                      Messages
                    </dt>
                    <dd className="text-right text-xs font-medium text-[var(--admin-fg)] tabular-nums">
                      {threadMessages(selected).length}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 pt-0.5 text-xs text-[var(--admin-muted)]">
                      Ticket
                    </dt>
                    <dd className="min-w-0 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          void copyValue("rail-ticketId", selected.id)
                        }
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-[var(--admin-fg-soft)] transition hover:bg-[var(--admin-fill)]"
                        title="Copy ticket ID"
                      >
                        <span className="truncate">
                          {selected.id.slice(0, 8)}…
                        </span>
                        {copiedField === "rail-ticketId" ? (
                          <Check className="size-3 shrink-0 text-[var(--admin-green)]" />
                        ) : (
                          <Copy className="size-3 shrink-0 text-[var(--admin-muted)]" />
                        )}
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>

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
                  {selected.deviceId ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 pt-0.5 text-xs text-[var(--admin-muted)]">
                        Device ID
                      </dt>
                      <dd className="min-w-0 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void copyValue("rail-deviceId", selected.deviceId!)
                          }
                          className="inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] break-all text-[var(--admin-fg-soft)] transition hover:bg-[var(--admin-fill)]"
                          title="Copy device ID"
                        >
                          <span className="line-clamp-2 text-left">
                            {selected.deviceId}
                          </span>
                          {copiedField === "rail-deviceId" ? (
                            <Check className="size-3 shrink-0 text-[var(--admin-green)]" />
                          ) : (
                            <Copy className="size-3 shrink-0 text-[var(--admin-muted)]" />
                          )}
                        </button>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="space-y-2 px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                  <MonitorSmartphone className="size-3.5" />
                  Original message
                </p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--admin-fg-soft)]">
                  {originalIssuePreview(selected)}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  )
}
