"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  ArrowReloadHorizontalIcon,
  BubbleChatIcon,
  CheckmarkCircle01Icon,
  InboxIcon,
  MenuIcon,
  SentIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons"
import { useCallback, useEffect, useState } from "react"

import {
  AdminBadge,
  AdminButton,
  AdminMetricTile,
  AdminNotice,
  AdminPill,
  AdminSkeleton,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
  AdminLabel,
  AdminTextarea,
  AdminToolbar,
} from "@/components/admin/admin-ui"

type Sentiment = "like" | "dislike" | "neutral"
type Filter = "all" | "unread" | "like" | "dislike" | "neutral"

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

const FILTERS: Array<{ id: Filter; label: string; icon: IconSvgElement }> = [
  { id: "all", label: "All", icon: MenuIcon },
  { id: "unread", label: "Needs reply", icon: InboxIcon },
  { id: "like", label: "Loving it", icon: ThumbsUpIcon },
  { id: "dislike", label: "Issues", icon: ThumbsDownIcon },
]

function sentimentBadge(sentiment: Sentiment) {
  if (sentiment === "like") {
    return <AdminBadge tone="green">Loving it</AdminBadge>
  }
  if (sentiment === "dislike") {
    return <AdminBadge tone="amber">Something&apos;s off</AdminBadge>
  }
  return <AdminBadge tone="neutral">Neutral</AdminBadge>
}

function deviceSpecs(item: FeedbackItem): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = []

  if (item.deviceModel) {
    const value = item.modelIdentifier
      ? `${item.deviceModel} (${item.modelIdentifier})`
      : item.deviceModel
    specs.push({ label: "Mac", value })
  } else if (item.modelIdentifier) {
    specs.push({ label: "Mac", value: item.modelIdentifier })
  }

  if (item.chip) specs.push({ label: "Chip", value: item.chip })
  if (item.memoryGb && item.memoryGb > 0) {
    specs.push({ label: "RAM", value: `${item.memoryGb} GB` })
  }
  if (item.osVersion) {
    specs.push({ label: "OS", value: item.osVersion.replace(/^macOS\s*/i, "macOS ") })
  }

  return specs
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function FeedbackPanel() {
  const [filter, setFilter] = useState<Filter>("all")
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState("")
  const [replySending, setReplySending] = useState(false)
  const [replyMessage, setReplyMessage] = useState<string | null>(null)

  const selected = items.find((item) => item.id === selectedId) ?? null

  const load = useCallback(async (next: Filter) => {
    setLoading(true)
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
      setError(err instanceof Error ? err.message : "Failed to load feedback")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load(filter)
    })
  }, [filter, load])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load(filter)
    }, 20_000)
    return () => window.clearInterval(timer)
  }, [filter, load])

  useEffect(() => {
    if (selectedId && !items.some((item) => item.id === selectedId)) {
      queueMicrotask(() => {
        setSelectedId((current) => (current === selectedId ? null : current))
        setReplyDraft("")
      })
    }
  }, [items, selectedId])

  useEffect(() => {
    queueMicrotask(() => {
      setReplyDraft("")
      setReplyMessage(null)
    })
  }, [selected?.id, selected?.messages.length])

  async function toggleResolved(item: FeedbackItem) {
    setPendingId(item.id)
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: item.id, isResolved: !item.isResolved }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? "Update failed")
      }
      await load(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setPendingId(null)
    }
  }

  async function sendReply() {
    if (!selected) return
    const trimmed = replyDraft.trim()
    if (!trimmed) {
      setReplyMessage("Write a reply first.")
      return
    }

    setReplySending(true)
    setReplyMessage(null)
    try {
      const res = await fetch(`/api/admin/feedback/${selected.id}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reply: trimmed }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Reply failed")
      setReplyMessage("Reply sent — the user will be notified in the app.")
      setReplyDraft("")
      await load(filter)
    } catch (err) {
      setReplyMessage(err instanceof Error ? err.message : "Reply failed")
    } finally {
      setReplySending(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <AdminMetricTile
          label="Total tickets"
          value={totals?.total ?? 0}
          icon={<HugeiconsIcon icon={BubbleChatIcon} className="size-4 text-[#86868b]" />}
        />
        <AdminMetricTile
          label="Loving it"
          value={totals?.like ?? 0}
          icon={<HugeiconsIcon icon={ThumbsUpIcon} className="size-4 text-[#248a3d]" />}
        />
        <AdminMetricTile
          label="Issues"
          value={totals?.dislike ?? 0}
          icon={<HugeiconsIcon icon={ThumbsDownIcon} className="size-4 text-[#c93400]" />}
        />
        <AdminMetricTile
          label="Open tickets"
          value={totals?.unresolved ?? 0}
          icon={<HugeiconsIcon icon={InboxIcon} className="size-4 text-[#0071e3]" />}
        />
        <AdminMetricTile
          label="Needs reply"
          value={totals?.awaitingReply ?? 0}
          icon={<HugeiconsIcon icon={SentIcon} className="size-4 text-[#5856d6]" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6">
        <AdminSurface>
          <AdminSurfaceHeader
            title="Support Inbox"
            description="Select a support ticket to view the conversation. Refreshes every 20 seconds."
            action={
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => void load(filter)}
                className="gap-1.5"
              >
                <HugeiconsIcon
                  icon={ArrowReloadHorizontalIcon}
                  className="size-3.5"
                />
                Refresh
              </AdminButton>
            }
          />
          <AdminSurfaceBody className="space-y-4">
            <AdminToolbar>
              {FILTERS.map((f) => (
                <AdminPill
                  key={f.id}
                  active={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  <HugeiconsIcon icon={f.icon} className="size-3.5" />
                  {f.label}
                </AdminPill>
              ))}
            </AdminToolbar>

            {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}

            {loading ? (
              <div className="space-y-3">
                <AdminSkeleton className="h-24 w-full" />
                <AdminSkeleton className="h-24 w-full" />
              </div>
            ) : items.length === 0 ? (
              <AdminNotice tone="info">No support tickets match this filter.</AdminNotice>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={
                        selectedId === item.id
                          ? "w-full rounded-2xl bg-[#0071e3]/10 p-4 text-left ring-1 ring-[#0071e3]/25 sm:p-5"
                          : item.isResolved
                            ? "w-full rounded-2xl bg-[#f5f5f7]/60 p-4 text-left transition hover:bg-[#f5f5f7] sm:p-5"
                            : "w-full rounded-2xl bg-[#f5f5f7] p-4 text-left ring-1 ring-[#0071e3]/15 transition hover:bg-[#ebebef] sm:p-5"
                      }
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {sentimentBadge(item.sentiment)}
                        <span className="text-[14px] font-medium text-[#1d1d1f]">
                          {item.name?.trim() || "Anonymous"}
                        </span>
                        {!item.isResolved ? (
                          <AdminBadge tone="blue">Open</AdminBadge>
                        ) : (
                          <AdminBadge tone="neutral">Closed</AdminBadge>
                        )}
                        {item.needsAdminReply ? (
                          <AdminBadge tone="amber">Needs reply</AdminBadge>
                        ) : !item.isResolved ? (
                          <AdminBadge tone="green">Replied</AdminBadge>
                        ) : null}
                        {item.userHasUnread ? (
                          <AdminBadge tone="blue">Unseen</AdminBadge>
                        ) : null}
                        <span className="ml-auto text-[12px] text-[#86868b]">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[#1d1d1f]">
                        {item.messages.at(-1)?.body ?? item.message}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AdminSurfaceBody>
        </AdminSurface>

        <AdminSurface>
          <AdminSurfaceHeader
            title="Live Chat"
            description={
              selected
                ? "Support conversation thread. Replies notify the user in the Mac app or on macwall.app/support."
                : "Select a support ticket from the inbox to respond."
            }
          />
          <AdminSurfaceBody className="space-y-4">
            {!selected ? (
              <AdminNotice tone="info">
                Select a support ticket from the inbox to view the live chat thread.
              </AdminNotice>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#f5f5f7] p-4 sm:p-5">
                  {sentimentBadge(selected.sentiment)}
                  <span className="text-[14px] font-medium text-[#1d1d1f]">
                    {selected.name?.trim() || "Anonymous"}
                  </span>
                  {deviceSpecs(selected).map((spec) => (
                    <span
                      key={spec.label}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] ring-1 ring-black/5"
                    >
                      <span className="text-[#86868b]">{spec.label}</span>
                      <span className="font-medium text-[#1d1d1f]">
                        {spec.value}
                      </span>
                    </span>
                  ))}
                  <AdminButton
                    variant={selected.isResolved ? "ghost" : "secondary"}
                    size="sm"
                    className="ml-auto gap-1.5"
                    disabled={pendingId === selected.id}
                    onClick={() => void toggleResolved(selected)}
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="size-3.5"
                    />
                    {selected.isResolved ? "Reopen" : "Mark resolved"}
                  </AdminButton>
                </div>

                {selected.isResolved ? (
                  <AdminNotice tone="info">
                    This ticket is closed. The user cannot reply until you reopen it.
                    Send a final note below or tap Reopen to allow follow-ups.
                  </AdminNotice>
                ) : null}

                <div className="max-h-[340px] space-y-3 overflow-y-auto rounded-2xl bg-[#f5f5f7] p-4">
                  {selected.messages.length === 0 ? (
                    <p className="text-[14px] text-[#86868b]">
                      {selected.message}
                    </p>
                  ) : (
                    selected.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={
                          msg.author === "admin"
                            ? "ml-6 rounded-2xl border border-[#248a3d]/20 bg-[#248a3d]/8 p-3"
                            : "mr-6 rounded-2xl bg-white p-3 ring-1 ring-black/5"
                        }
                      >
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium">
                          <span className={msg.author === "admin" ? "text-[#248a3d]" : "text-[#0071e3]"}>
                            {msg.author === "admin" ? "MacWall Support" : selected.name?.trim() || "Customer"}
                          </span>
                          <span className="text-[#86868b]">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-[#1d1d1f]">
                          {msg.body}
                        </p>
                        {msg.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={msg.imageUrl}
                            alt="Support attachment"
                            className="mt-2 max-h-56 w-auto max-w-full rounded-xl border border-black/5 object-cover"
                          />
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <AdminLabel>Reply to customer</AdminLabel>
                  <AdminTextarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    placeholder="Thanks for reaching out — here is what we found…"
                    rows={5}
                  />
                </div>

                {replyMessage ? (
                  <AdminNotice
                    tone={replyMessage.includes("sent") ? "success" : "warning"}
                  >
                    {replyMessage}
                  </AdminNotice>
                ) : null}

                <AdminButton
                  variant="primary"
                  disabled={replySending || !replyDraft.trim()}
                  onClick={() => void sendReply()}
                  className="gap-1.5"
                >
                  <HugeiconsIcon icon={SentIcon} className="size-3.5" />
                  {replySending ? "Sending…" : "Send Support Reply"}
                </AdminButton>
              </>
            )}
          </AdminSurfaceBody>
        </AdminSurface>
      </div>
    </div>
  )
}
