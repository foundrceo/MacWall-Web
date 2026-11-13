/**
 * Pure ticket logic for the support inbox: who needs a reply, how the inbox
 * sorts, what a ticket's Chat ID is and how a thread splits into a timeline.
 */

import { formatDayLabel } from "@/lib/admin/format"
import { isStaleSupportCloseNotice } from "@/lib/support/stale-ticket-copy"

import type {
  FeedbackItem,
  FeedbackMessage,
  Filter,
  TimelineItem,
} from "./types"

/** Messages closer together than this, by one author, share a group. */
const GROUP_GAP_MS = 5 * 60 * 1000

export function customerName(name: string | null | undefined) {
  const value = name?.trim() || "Anonymous"
  const parts = value.split(/\s+·\s+/)
  return parts.length > 1 && parts.at(-1)?.includes("@")
    ? parts.slice(0, -1).join(" · ")
    : value
}

export function customerEmail(name: string | null | undefined) {
  return name?.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] ?? null
}

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

export function chatIdForItem(item: FeedbackItem): string | null {
  if (item.chatId?.trim()) return item.chatId.trim().toUpperCase()
  // Prefer first user message (stable Chat ID line), then root message column
  const firstUser = item.messages.find((m) => m.author === "user")
  return extractChatId(firstUser?.body ?? null) ?? extractChatId(item.message)
}

/** The original issue without the Chat ID header or transcript dump. */
export function originalIssuePreview(item: FeedbackItem): string {
  const source =
    item.messages.find((m) => m.author === "user")?.body ?? item.message
  let body = source.replace(/^Chat ID:\s*MW-[A-Z0-9]+\s*/i, "").trim()
  const cut = body.search(/\n—\s*Chat transcript\s*—/i)
  if (cut >= 0) body = body.slice(0, cut).trim()
  return body || source
}

export function deviceSpecs(item: FeedbackItem) {
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

export function matchesSearch(item: FeedbackItem, term: string): boolean {
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

export function ticketNeedsReply(item: FeedbackItem): boolean {
  if (item.isResolved) return false
  if (item.needsAdminReply) return true
  const last = item.messages.at(-1)
  // Derived from the thread: the DB flag can lag after follow-ups or new tickets.
  // Assist-only threads (pre-handoff FAQ) do not need admin reply.
  if (!last) return Boolean(item.message.trim())
  return last.author === "user"
}

export function sortInbox(a: FeedbackItem, b: FeedbackItem): number {
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

/** Search wins over the filter tab, then the inbox order applies. */
export function filterInbox(
  items: FeedbackItem[],
  search: string,
  filter: Filter
): FeedbackItem[] {
  const term = search.trim().toLowerCase()
  let list = items
  if (term) {
    // Search across the full inbox (name, Chat ID, device, messages)
    list = list.filter((item) => matchesSearch(item, term))
  } else if (filter === "unread") {
    list = list.filter((item) => ticketNeedsReply(item))
  } else if (filter === "open") {
    list = list.filter((item) => !item.isResolved)
  } else if (filter === "closed") {
    list = list.filter((item) => item.isResolved)
  }
  return [...list].sort(sortInbox)
}

export function countInbox(items: FeedbackItem[]): Record<Filter, number> {
  const open = items.filter((item) => !item.isResolved).length
  const closed = items.filter((item) => item.isResolved).length
  const needsReply = items.filter((item) => ticketNeedsReply(item)).length
  return { unread: needsReply, open, closed, all: items.length }
}

/** Fallback so the thread still renders when its messages failed to load. */
export function threadMessages(item: FeedbackItem): FeedbackMessage[] {
  if (item.messages.length > 0) return item.messages
  if (!item.message.trim()) return []
  return [
    {
      id: `root-${item.id}`,
      author: "user",
      body: item.message,
      imageUrl: null,
      createdAt: item.createdAt,
    },
  ]
}

export function isAutoClosedTicket(item: FeedbackItem): boolean {
  return item.messages.some((msg) => isStaleSupportCloseNotice(msg.body))
}

/** Last message as one inbox line, with who said it. */
export function inboxPreview(item: FeedbackItem): string {
  const last = item.messages.at(-1)
  if (isStaleSupportCloseNotice(last?.body)) {
    return "Closed automatically after 7 idle days"
  }
  const preview = last?.body ?? originalIssuePreview(item)
  const prefix =
    last?.author === "admin"
      ? "You: "
      : last?.author === "assist"
        ? "Assist: "
        : ""
  return `${prefix}${preview}`
}

/** What a message shows: the old app sent "Sent a photo" as an image caption. */
export function messageParts(msg: FeedbackMessage) {
  const caption = msg.body.trim()
  const isLegacyPhotoLabel = /^sent a (photo|image|img)$/i.test(caption)
  const hasRealText = Boolean(caption) && caption !== " " && !isLegacyPhotoLabel
  const hasImage = Boolean(msg.imageUrl?.trim())
  return { hasImage, hasRealText }
}

export function buildTimeline(messages: FeedbackMessage[]): TimelineItem[] {
  const ordered = [...messages].sort((a, b) => {
    const delta =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (delta !== 0) return delta
    return a.id.localeCompare(b.id)
  })

  const items: TimelineItem[] = []
  let lastDay = ""
  let lastTime = 0

  for (const msg of ordered) {
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

    if (isStaleSupportCloseNotice(msg.body)) {
      items.push({
        kind: "system",
        key: `sys-${msg.id}`,
        body: msg.body,
      })
      lastTime = time
      continue
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
