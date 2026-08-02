import type { ChatQuickReply } from "@/lib/macwall-chat/faq-engine"
import { SUPPORT_SESSION_STORAGE_KEY } from "@/lib/support/shared"

export type ChatRole = "assist" | "user" | "system" | "founder" | "event"

export type ChatMessage = {
  id: string
  role: ChatRole
  body: string
  createdAt: number
  followUps?: ChatQuickReply[]
  remoteId?: string
  imageUrl?: string | null
}

export type HandoffStep =
  | "idle"
  | "ask_name"
  | "ask_email"
  | "ask_issue"
  | "live"
  | "closed"

/** One support/assist thread — `id` is the public Chat ID (e.g. MW-A1B2C3). */
export type ChatConversation = {
  id: string
  ticketId: string | null
  title: string
  messages: ChatMessage[]
  handoff: HandoffStep
  visitorName: string
  /** Collected during human handoff for follow-up. */
  visitorEmail: string
  founderJoined: boolean
  seenRemoteIds: string[]
  createdAt: number
  updatedAt: number
}

export type PersistedChatStore = {
  version: 3
  activeId: string
  conversations: ChatConversation[]
}

export const CHAT_STORAGE_KEY = "macwall_chat_state_v3"
export const CHAT_STORAGE_KEY_LEGACY = "macwall_chat_state_v2"
export const CHAT_OPEN_KEY = "macwall_chat_open_v2"

export const FOUNDER_DISPLAY_NAME = "Founder"

export function getOrCreateChatSessionId(): string {
  if (typeof window === "undefined") return ""
  const existing = window.localStorage.getItem(SUPPORT_SESSION_STORAGE_KEY)
  if (existing) return existing
  const next = crypto.randomUUID()
  window.localStorage.setItem(SUPPORT_SESSION_STORAGE_KEY, next)
  return next
}

export function chatMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/** Public reference ID shown to users / support — always MW-XXXXXX. */
export function createChatId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  let out = "MW-"
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return out
}

export function normalizeHandoffStep(value: unknown): HandoffStep {
  if (
    value === "idle" ||
    value === "ask_name" ||
    value === "ask_email" ||
    value === "ask_issue" ||
    value === "live" ||
    value === "closed"
  ) {
    return value
  }
  return "idle"
}

export function createEmptyConversation(
  greeting: ChatMessage[]
): ChatConversation {
  const now = Date.now()
  return {
    id: createChatId(),
    ticketId: null,
    title: "New chat",
    messages: greeting,
    handoff: "idle",
    visitorName: "",
    visitorEmail: "",
    founderJoined: false,
    seenRemoteIds: [],
    createdAt: now,
    updatedAt: now,
  }
}

function titleFromMessages(messages: ChatMessage[], fallback: string): string {
  const user = [...messages].reverse().find((m) => m.role === "user" && m.body.trim())
  if (!user) return fallback
  const text = user.body.trim().replace(/\s+/g, " ")
  return text.length > 36 ? `${text.slice(0, 36)}…` : text
}

export function conversationPreviewTitle(convo: ChatConversation): string {
  if (convo.handoff === "live" || convo.handoff === "closed") {
    return convo.title !== "New chat"
      ? convo.title
      : titleFromMessages(convo.messages, `Chat ${convo.id}`)
  }
  return titleFromMessages(convo.messages, convo.title || "New chat")
}

export function loadPersistedChatStore(
  greeting: ChatMessage[]
): PersistedChatStore {
  if (typeof window === "undefined") {
    const convo = createEmptyConversation(greeting)
    return { version: 3, activeId: convo.id, conversations: [convo] }
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedChatStore
      if (
        parsed?.version === 3 &&
        Array.isArray(parsed.conversations) &&
        parsed.conversations.length > 0
      ) {
        const conversations = parsed.conversations.map((c) => ({
          ...c,
          handoff: normalizeHandoffStep(c.handoff),
          visitorEmail:
            typeof (c as ChatConversation).visitorEmail === "string"
              ? (c as ChatConversation).visitorEmail
              : "",
          messages: Array.isArray(c.messages) ? c.messages.slice(-120) : greeting,
          seenRemoteIds: Array.isArray(c.seenRemoteIds) ? c.seenRemoteIds : [],
        }))
        const activeId =
          conversations.find((c) => c.id === parsed.activeId)?.id ??
          conversations[0]!.id
        return { version: 3, activeId, conversations }
      }
    }
  } catch {
    /* fall through */
  }

  // Migrate legacy single-thread v2
  try {
    const legacyRaw = window.localStorage.getItem(CHAT_STORAGE_KEY_LEGACY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as {
        messages?: ChatMessage[]
        handoff?: HandoffStep
        visitorName?: string
        visitorEmail?: string
        ticketId?: string | null
        founderJoined?: boolean
        seenRemoteIds?: string[]
      }
      const now = Date.now()
      const messages =
        Array.isArray(legacy.messages) && legacy.messages.length > 0
          ? legacy.messages.slice(-120)
          : greeting
      // Prefer Chat ID embedded in ticket transcript so admin search still matches
      let migratedId: string | null = null
      for (const m of messages) {
        const match = /Chat ID:\s*(MW-[A-Z0-9]+)/i.exec(m.body)
        if (match?.[1]) {
          migratedId = match[1].toUpperCase()
          break
        }
      }
      const convo: ChatConversation = {
        id: migratedId ?? createChatId(),
        ticketId: legacy.ticketId ?? null,
        title: "Previous chat",
        messages,
        handoff: normalizeHandoffStep(legacy.handoff),
        visitorName: legacy.visitorName ?? "",
        visitorEmail: legacy.visitorEmail ?? "",
        founderJoined: Boolean(legacy.founderJoined),
        seenRemoteIds: Array.isArray(legacy.seenRemoteIds)
          ? legacy.seenRemoteIds
          : [],
        createdAt: now,
        updatedAt: now,
      }
      const store = {
        version: 3 as const,
        activeId: convo.id,
        conversations: [convo],
      }
      savePersistedChatStore(store)
      return store
    }
  } catch {
    /* ignore */
  }

  const convo = createEmptyConversation(greeting)
  return { version: 3, activeId: convo.id, conversations: [convo] }
}

export function savePersistedChatStore(store: PersistedChatStore) {
  if (typeof window === "undefined") return
  try {
    const payload: PersistedChatStore = {
      version: 3,
      activeId: store.activeId,
      conversations: store.conversations.slice(0, 40).map((c) => ({
        ...c,
        messages: c.messages.slice(-120),
        seenRemoteIds: c.seenRemoteIds.slice(-200),
        title: conversationPreviewTitle(c),
      })),
    }
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota */
  }
}
