"use client"

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { MarketingCard } from "@/components/macwall-marketing/marketing-primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { macwall } from "@/lib/macwall-site"
import {
  SUPPORT_SESSION_STORAGE_KEY,
  supportErrorMessage,
  type SupportSentiment,
} from "@/lib/support/shared"
import { cn } from "@/lib/utils"

type SupportMessage = {
  id: string
  author: "user" | "admin"
  body: string
  imageUrl?: string | null
  createdAt: string
}

type SupportTicket = {
  id: string
  sentiment: SupportSentiment
  name: string | null
  message: string
  userHasUnread: boolean
  needsAdminReply: boolean
  isResolved: boolean
  messages: SupportMessage[]
  createdAt: string
}

type InboxFilter = "all" | "open" | "closed" | "awaiting" | "unread"
type PanelMode = "compose" | "thread"

const fieldClass =
  "rounded-2xl border-border bg-surface px-4 py-3 text-[15px] text-foreground shadow-none focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const FILTERS: Array<{ id: InboxFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "awaiting", label: "Awaiting reply" },
  { id: "unread", label: "Unread" },
]

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  const existing = window.localStorage.getItem(SUPPORT_SESSION_STORAGE_KEY)
  if (existing) return existing
  const next = crypto.randomUUID()
  window.localStorage.setItem(SUPPORT_SESSION_STORAGE_KEY, next)
  return next
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function ticketMatchesFilter(ticket: SupportTicket, filter: InboxFilter) {
  switch (filter) {
    case "open":
      return !ticket.isResolved
    case "closed":
      return ticket.isResolved
    case "awaiting":
      return !ticket.isResolved && ticket.needsAdminReply
    case "unread":
      return ticket.userHasUnread
    default:
      return true
  }
}

function sortTickets(tickets: SupportTicket[]) {
  return [...tickets].sort((a, b) => {
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

type PendingImage = {
  previewUrl: string
  file: File
}

async function uploadSupportImage(sessionId: string, file: File): Promise<string> {
  const form = new FormData()
  form.append("sessionId", sessionId)
  form.append("file", file)

  const directRes = await fetch("/api/support/upload", {
    method: "POST",
    body: form,
  })
  const directJson = (await directRes.json()) as {
    publicUrl?: string
    error?: string
  }
  if (directRes.ok && directJson.publicUrl) {
    return directJson.publicUrl
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const presignRes = await fetch("/api/support/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      extension: ext,
      contentType: file.type || "image/jpeg",
    }),
  })
  const presignJson = (await presignRes.json()) as {
    uploadUrl?: string
    publicUrl?: string
    contentType?: string
    error?: string
  }
  if (!presignRes.ok || !presignJson.uploadUrl || !presignJson.publicUrl) {
    throw new Error(directJson.error ?? presignJson.error ?? "upload_failed")
  }

  const putRes = await fetch(presignJson.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": presignJson.contentType ?? file.type ?? "image/jpeg" },
    body: file,
  })
  if (!putRes.ok) throw new Error("upload_failed")
  return presignJson.publicUrl
}

export function SupportCenter() {
  const [sessionId, setSessionId] = useState("")
  const [panel, setPanel] = useState<PanelMode>("compose")
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [sentiment, setSentiment] = useState<SupportSentiment>("neutral")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [reply, setReply] = useState("")
  const [composeImage, setComposeImage] = useState<PendingImage | null>(null)
  const [replyImage, setReplyImage] = useState<PendingImage | null>(null)

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId]
  )

  const filteredTickets = useMemo(
    () => sortTickets(tickets.filter((t) => ticketMatchesFilter(t, inboxFilter))),
    [tickets, inboxFilter]
  )

  const unreadCount = tickets.filter((t) => t.userHasUnread).length
  const openCount = tickets.filter((t) => !t.isResolved).length

  const loadTickets = useCallback(async (sid: string, silent = false) => {
    if (!sid) return
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/support/tickets?sessionId=${encodeURIComponent(sid)}`,
        { cache: "no-store" }
      )
      const json = (await res.json()) as {
        tickets?: SupportTicket[]
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "load_failed")
      setTickets(json.tickets ?? [])
    } catch (err) {
      if (!silent) {
        setError(
          supportErrorMessage(
            err instanceof Error ? err.message : "load_failed"
          )
        )
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const sid = getOrCreateSessionId()
    queueMicrotask(() => {
      setSessionId(sid)
      void loadTickets(sid)
    })
  }, [loadTickets])

  useEffect(() => {
    if (!sessionId) return
    const timer = window.setInterval(() => {
      void loadTickets(sessionId, true)
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [sessionId, loadTickets])

  useEffect(() => {
    if (!selected?.userHasUnread || !sessionId) return
    void fetch("/api/support/tickets", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId,
        ticketId: selected.id,
        action: "mark_seen",
      }),
    }).then(() => loadTickets(sessionId, true))
  }, [selected?.id, selected?.userHasUnread, sessionId, loadTickets])

  function openCompose() {
    setPanel("compose")
    setSelectedId(null)
    setReply("")
    setReplyImage(null)
    setError(null)
    setSuccess(null)
  }

  function openThread(id: string) {
    setSelectedId(id)
    setPanel("thread")
    setError(null)
    setSuccess(null)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()
    if (!sessionId || !trimmedName || (!trimmedMessage && !composeImage) || submitting) {
      if (!trimmedName) setError(supportErrorMessage("name_required"))
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      let imageUrl: string | null = null
      if (composeImage) {
        imageUrl = await uploadSupportImage(sessionId, composeImage.file)
      }
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sentiment,
          name: trimmedName,
          message: trimmedMessage,
          imageUrl,
        }),
      })
      const json = (await res.json()) as {
        ticket?: { id: string }
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "create_failed")
      setMessage("")
      if (composeImage) URL.revokeObjectURL(composeImage.previewUrl)
      setComposeImage(null)
      setSuccess("Support request submitted. We typically reply within a few hours on business days.")
      await loadTickets(sessionId, true)
      if (json.ticket?.id) {
        setSelectedId(json.ticket.id)
      }
      setPanel("thread")
      setInboxFilter("open")
    } catch (err) {
      setError(
        supportErrorMessage(err instanceof Error ? err.message : "create_failed")
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReply(event: FormEvent) {
    event.preventDefault()
    const trimmedReply = reply.trim()
    if (
      !sessionId ||
      !selected ||
      selected.isResolved ||
      (!trimmedReply && !replyImage) ||
      submitting
    ) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let imageUrl: string | null = null
      if (replyImage) {
        imageUrl = await uploadSupportImage(sessionId, replyImage.file)
      }
      const res = await fetch(`/api/support/tickets/${selected.id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, message: trimmedReply, imageUrl }),
      })
      const json = (await res.json()) as { error?: string; ticket?: SupportTicket }
      if (!res.ok) throw new Error(json.error ?? "reply_failed")
      setReply("")
      if (replyImage) URL.revokeObjectURL(replyImage.previewUrl)
      setReplyImage(null)
      await loadTickets(sessionId, true)
    } catch (err) {
      setError(
        supportErrorMessage(err instanceof Error ? err.message : "reply_failed")
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingCard className="overflow-hidden p-0">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-foreground">
              Live Support Center
            </h2>
            <p className="mt-1 text-[14px] text-marketing-muted">
              Submit support tickets, track conversations, and chat with the{" "}
              {macwall.name} team.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-marketing-muted">
            <span>{openCount} open</span>
            <span className="text-border">·</span>
            <a href={macwall.discordInvite} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Discord
            </a>
            <span className="text-border">·</span>
            <a href={`mailto:${macwall.supportEmail}`} className="hover:text-foreground">
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="grid min-h-[520px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-surface/20 p-4 lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            <SidebarAction
              active={panel === "compose"}
              onClick={openCompose}
              title="New Support Ticket"
              subtitle="Start a live chat request"
            />
            <SidebarAction
              active={panel === "thread"}
              onClick={() => {
                setPanel("thread")
                setSelectedId(null)
              }}
              title="Support Inbox"
              subtitle={`${tickets.length} conversation${tickets.length === 1 ? "" : "s"}`}
              badge={unreadCount}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-marketing-muted">
              Filter
            </p>
            <div className="flex flex-wrap gap-1.5 lg:flex-col">
              {FILTERS.map((f) => (
                <FilterChip
                  key={f.id}
                  active={inboxFilter === f.id}
                  onClick={() => setInboxFilter(f.id)}
                >
                  {f.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2 lg:block">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-marketing-muted">
              Conversations
            </p>
            {loading && tickets.length === 0 ? (
              <p className="text-[13px] text-marketing-muted">Loading…</p>
            ) : filteredTickets.length === 0 ? (
              <p className="text-[13px] text-marketing-muted">
                No tickets match this filter.
              </p>
            ) : (
              <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
                {filteredTickets.map((ticket) => (
                  <TicketListItem
                    key={ticket.id}
                    ticket={ticket}
                    active={selectedId === ticket.id}
                    onClick={() => openThread(ticket.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="p-4 sm:p-6">
          {error ? (
            <p className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">
              {error}
            </p>
          ) : null}
          {success && panel === "compose" ? (
            <p className="mb-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-[14px] text-emerald-400">
              {success}
            </p>
          ) : null}

          {panel === "compose" ? (
            <form onSubmit={handleCreate} className="mx-auto max-w-[560px] space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">
                  New Support Ticket
                </h3>
                <p className="mt-1 text-[14px] text-marketing-muted">
                  Tell us what you need help with. We typically reply within a few hours on business days.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <SentimentChip active={sentiment === "like"} onClick={() => setSentiment("like")} label="Positive feedback" />
                <SentimentChip active={sentiment === "dislike"} onClick={() => setSentiment("dislike")} label="Report an issue" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-name">Your name</Label>
                <Input
                  id="support-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={fieldClass}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail…"
                  rows={6}
                  className={cn(fieldClass, "min-h-[140px] w-full resize-y")}
                  disabled={submitting}
                />
              </div>

              <SupportImageAttachField
                pending={composeImage}
                disabled={submitting}
                onPick={(file) => {
                  if (composeImage) URL.revokeObjectURL(composeImage.previewUrl)
                  setComposeImage({
                    file,
                    previewUrl: URL.createObjectURL(file),
                  })
                }}
                onRemove={() => {
                  if (composeImage) URL.revokeObjectURL(composeImage.previewUrl)
                  setComposeImage(null)
                }}
              />

              <Button
                type="submit"
                disabled={
                  submitting || !name.trim() || (!message.trim() && !composeImage)
                }
                className="rounded-full px-6"
              >
                {submitting ? "Submitting…" : "Submit Support Ticket"}
              </Button>
              <p className="text-[13px] text-marketing-muted">
                Typical reply time is within a few hours on business days. Conversations are saved in this browser.
              </p>
            </form>
          ) : null}

          {panel === "thread" && !selected ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
              <p className="text-[16px] font-medium text-foreground">
                Select a support conversation
              </p>
              <p className="mt-2 max-w-sm text-[14px] text-marketing-muted">
                Choose a ticket from the inbox, or create a new support request to start a live chat with our team.
              </p>
              <Button type="button" onClick={openCompose} className="mt-5 rounded-full">
                New Support Ticket
              </Button>
            </div>
          ) : null}

          {panel === "thread" && selected ? (
            <div className="mx-auto flex max-w-[640px] flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-semibold text-foreground">
                  {selected.name?.trim() || "Support Conversation"}
                </h3>
                <TicketStatus ticket={selected} />
                <span className="ml-auto text-[12px] text-marketing-muted">
                  {formatWhen(selected.createdAt)}
                </span>
              </div>

              {selected.needsAdminReply ? (
                <p className="rounded-2xl border border-border bg-surface/40 px-4 py-3 text-[13px] text-marketing-muted">
                  Waiting for MacWall Support. We typically reply within a few hours on business days.
                </p>
              ) : null}

              <div className="max-h-[380px] space-y-4 overflow-y-auto pr-2">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[88%] text-[14px] leading-relaxed",
                      msg.author === "user" ? "ml-auto" : "mr-auto"
                    )}
                  >
                    <p className="mb-1 text-[11px] font-medium text-marketing-muted">
                      {msg.author === "admin" ? "MacWall Support" : "You"} ·{" "}
                      {formatWhen(msg.createdAt)}
                    </p>
                    <div
                      className={cn(
                        "space-y-2 rounded-2xl px-3 py-2.5",
                        msg.author === "user"
                          ? "bg-foreground/10 text-foreground"
                          : "bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/15"
                      )}
                    >
                      {msg.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.imageUrl}
                          alt="Support attachment"
                          className="max-h-52 w-auto max-w-full rounded-xl object-cover"
                        />
                      ) : null}
                      {msg.body.trim() ? (
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {selected.isResolved ? (
                <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                  <p className="text-[15px] font-medium text-foreground">
                    This support ticket is closed
                  </p>
                  <p className="text-[14px] text-marketing-muted">
                    Our team marked this request as resolved. Submit a new support ticket if you need further assistance.
                  </p>
                  <Button type="button" onClick={openCompose} className="rounded-full">
                    New Support Ticket
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReply} className="space-y-3">
                  <Label htmlFor="support-reply">Your reply</Label>
                  <textarea
                    id="support-reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add a follow-up or attach a screenshot…"
                    rows={4}
                    className={cn(fieldClass, "min-h-[96px] w-full resize-y")}
                    disabled={submitting}
                  />
                  <SupportImageAttachField
                    pending={replyImage}
                    disabled={submitting}
                    onPick={(file) => {
                      if (replyImage) URL.revokeObjectURL(replyImage.previewUrl)
                      setReplyImage({
                        file,
                        previewUrl: URL.createObjectURL(file),
                      })
                    }}
                    onRemove={() => {
                      if (replyImage) URL.revokeObjectURL(replyImage.previewUrl)
                      setReplyImage(null)
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={submitting || (!reply.trim() && !replyImage)}
                    className="rounded-full px-6"
                  >
                    {submitting ? "Sending…" : "Send Reply"}
                  </Button>
                </form>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </MarketingCard>
  )
}

function SupportImageAttachField({
  pending,
  disabled,
  onPick,
  onRemove,
}: {
  pending: PendingImage | null
  disabled?: boolean
  onPick: (file: File) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-surface/60">
          Attach screenshot
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) onPick(file)
            }}
          />
        </label>
        {pending ? (
          <button
            type="button"
            className="text-[13px] text-marketing-muted hover:text-foreground"
            onClick={onRemove}
            disabled={disabled}
          >
            Remove
          </button>
        ) : null}
      </div>
      {pending ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pending.previewUrl}
          alt="Attachment preview"
          className="h-24 w-auto max-w-full rounded-xl border border-border object-cover"
        />
      ) : null}
    </div>
  )
}

function SidebarAction({
  active,
  title,
  subtitle,
  badge,
  onClick,
}: {
  active: boolean
  title: string
  subtitle: string
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border px-3 py-2.5 text-left transition",
        active
          ? "border-foreground/20 bg-foreground/10"
          : "border-border bg-surface/40 hover:border-foreground/15 hover:bg-surface/70"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-medium text-foreground">{title}</span>
        {badge && badge > 0 ? (
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[12px] text-marketing-muted">{subtitle}</p>
    </button>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-[12px] font-medium transition",
        active
          ? "bg-foreground text-background"
          : "bg-surface text-marketing-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function TicketListItem({
  ticket,
  active,
  onClick,
}: {
  ticket: SupportTicket
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-foreground/25 bg-foreground/8"
          : "border-transparent hover:border-border hover:bg-surface/60"
      )}
    >
      <div className="flex items-center gap-2">
        {ticket.userHasUnread ? (
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
        ) : null}
        <span className="truncate text-[13px] font-medium text-foreground">
          {ticket.name?.trim() || "Support ticket"}
        </span>
      </div>
      <p className="mt-1 line-clamp-1 text-[12px] text-marketing-muted">
        {ticket.messages.at(-1)?.body ?? ticket.message}
      </p>
    </button>
  )
}

function TicketStatus({ ticket }: { ticket: SupportTicket }) {
  if (ticket.isResolved) return <StatusPill tone="muted">Closed</StatusPill>
  if (ticket.needsAdminReply) return <StatusPill tone="amber">Awaiting reply</StatusPill>
  if (ticket.userHasUnread) return <StatusPill tone="green">New reply</StatusPill>
  return <StatusPill tone="green">Open</StatusPill>
}

function SentimentChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[13px] transition",
        active
          ? "border-foreground/30 bg-foreground/10 text-foreground"
          : "border-border text-marketing-muted hover:border-foreground/20 hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "muted"
  children: ReactNode
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-400"
      : tone === "amber"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-foreground/10 text-marketing-muted"
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", toneClass)}>
      {children}
    </span>
  )
}
