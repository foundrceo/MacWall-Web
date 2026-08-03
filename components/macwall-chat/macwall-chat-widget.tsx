"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  type DragEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Cancel01Icon,
  Copy01Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  SentIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { MacWallAppIcon } from "@/components/macwall-app-icon"
import {
  isValidVisitorEmail,
  sanitizeVisitorEmailDraft,
  SUPPORT_CONNECTING_EVENT,
  SUPPORT_CONNECTING_PROMPT,
  SUPPORT_JOIN_SEED,
  SUPPORT_REPLY_WINDOW_EVENT,
  SUPPORT_TEAM_JUST_JOINED,
  SUPPORT_WELCOME,
} from "@/lib/macwall-chat/support-welcome"
import {
  CHAT_OPEN_KEY,
  FOUNDER_DISPLAY_NAME,
  chatMessageId,
  conversationPreviewTitle,
  createChatId,
  createEmptyConversation,
  getOrCreateChatSessionId,
  isPublicChatId,
  loadPersistedChatStore,
  savePersistedChatStore,
  type ChatConversation,
  type ChatMessage,
  type HandoffStep,
} from "@/lib/macwall-chat/persistence"
import {
  playChatCloseSound,
  playChatOpenSound,
  playChatPopSound,
  playChatReceiveSound,
  playChatSendSound,
} from "@/lib/macwall-chat/sounds"
import { useSupportTicketStream } from "@/lib/macwall-chat/use-support-ticket-stream"
import { useSupportTypingEmitter } from "@/lib/macwall-chat/use-support-typing-emitter"
import { isAllowedChatImage, uploadChatImage } from "@/lib/macwall-chat/upload"
import { ChatAttachmentMedia } from "@/components/macwall-chat/chat-attachment-media"
import { SupportTypingBubble } from "@/components/macwall-chat/support-typing-bubble"
import { macwall } from "@/lib/macwall-site"
import {
  supportErrorMessage,
  SUPPORT_CHAT_MESSAGE_QUERY,
  SUPPORT_CHAT_NEW_QUERY,
  SUPPORT_CHAT_QUERY,
} from "@/lib/support/shared"
import { cn } from "@/lib/utils"

/** Safety-net poll when SSE is live; slower when offline / closed (cuts API $). */
const POLL_LIVE_MS = 45_000
const POLL_OFFLINE_MS = 20_000
const POLL_CLOSED_MS = 30_000
const IDLE_MS = 60_000
const MENU_CONVERSATION_LIMIT = 12
/** Clear admin typing bubble if no fresh ping arrives. */
const ADMIN_TYPING_TTL_MS = 2500

type PresenceTone = "active" | "idle" | "offline"

function greetingMessages(): ChatMessage[] {
  return [
    {
      id: "greet",
      role: "system",
      body: SUPPORT_WELCOME,
      createdAt: Date.now(),
    },
  ]
}

/** Blue links that stay readable on light (user) and dark (support) bubbles. */
function linkClassForBubble(tone: "user" | "support") {
  return tone === "user"
    ? "font-medium text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:decoration-blue-700"
    : "font-medium text-sky-300 underline decoration-sky-300/45 underline-offset-2 hover:decoration-sky-200"
}

function linkify(text: string, tone: "user" | "support" = "support") {
  const linkClass = linkClassForBubble(tone)
  const parts = text.split(
    /(\/[a-z0-9\-/_]+|https?:\/\/\S+|[\w.+-]+@[\w.-]+\.\w+)/gi
  )
  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith("/") && !part.startsWith("//")) {
      return (
        <Link key={`${part}-${i}`} href={part} className={linkClass}>
          {part}
        </Link>
      )
    }
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={`${part}-${i}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {part}
        </a>
      )
    }
    if (part.includes("@") && part.includes(".")) {
      return (
        <a
          key={`${part}-${i}`}
          href={`mailto:${part}`}
          className={linkClass}
        >
          {part}
        </a>
      )
    }
    return <span key={`${i}`}>{part}</span>
  })
}

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

function handoffStatusLabel(handoff: HandoffStep): "Open" | "Live" | "Closed" {
  if (handoff === "live") return "Live"
  if (handoff === "closed") return "Closed"
  return "Open"
}

/** Resume contact collection for open chats that never reached a ticket. */
function normalizeContactHandoff(convo: ChatConversation): HandoffStep {
  const handoff = convo.handoff
  if (handoff === "live" || handoff === "closed") return handoff
  if (handoff === "ask_name" || handoff === "ask_email" || handoff === "ask_issue") {
    return handoff
  }
  // idle / unknown — route by what contact info we already have
  if (convo.visitorEmail.trim()) return "ask_issue"
  if (convo.visitorName.trim()) return "ask_email"
  return "ask_name"
}

export function MacWallChatWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const panelId = useId()
  const menuId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const seenRemoteRef = useRef<Set<string>>(new Set())
  const activeIdRef = useRef<string>("")

  const hidden = pathname?.startsWith("/admin") ?? false

  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [activeId, setActiveId] = useState("")
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [draft, setDraft] = useState("")
  const [pendingImage, setPendingImage] = useState<{
    file: File
    previewUrl: string
  } | null>(null)
  const [unread, setUnread] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveredPulse, setDeliveredPulse] = useState(false)
  const [streamState, setStreamState] = useState<
    "connecting" | "live" | "offline"
  >("offline")
  const [sessionIdState, setSessionIdState] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [presence, setPresence] = useState<PresenceTone>("active")
  const [menuOpen, setMenuOpen] = useState(false)
  const [copiedChatId, setCopiedChatId] = useState(false)
  const [connectingUI, setConnectingUI] = useState<
    null | "connecting" | "queued"
  >(null)
  const [adminTyping, setAdminTyping] = useState(false)
  const adminTypingTimerRef = useRef<number | null>(null)
  const dragDepthRef = useRef(0)
  const lastActivityRef = useRef(Date.now())
  const handoffRef = useRef<HandoffStep>("idle")
  const openRef = useRef(false)
  const ticketResolvedRef = useRef<boolean | null>(null)
  const lastReopenAtRef = useRef(0)
  const sendingRef = useRef(false)
  /** Prefill from `?support-chat-message=` after contact is collected. */
  const pendingIssueDraftRef = useRef("")

  const active = useMemo(() => {
    if (conversations.length === 0) return null
    return (
      conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null
    )
  }, [conversations, activeId])

  const messages = active?.messages ?? []
  const handoff = active
    ? normalizeContactHandoff(active)
    : ("ask_name" as HandoffStep)
  const visitorName = active?.visitorName ?? ""
  const visitorEmail = active?.visitorEmail ?? ""
  const ticketId = active?.ticketId ?? null
  const founderJoined = active?.founderJoined ?? false
  const chatId = active?.id ?? ""
  const publicChatId = isPublicChatId(chatId) ? chatId : ""
  const canAttachImages =
    handoff === "live" ||
    handoff === "ask_issue" ||
    (Boolean(visitorEmail.trim()) && isValidVisitorEmail(visitorEmail))

  activeIdRef.current = active?.id ?? ""
  handoffRef.current = handoff
  openRef.current = open

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    setPresence((prev) => (prev === "active" ? prev : "active"))
  }, [])

  const patchConversation = useCallback(
    (
      convoId: string | null | undefined,
      updater: (c: ChatConversation) => ChatConversation
    ) => {
      if (!convoId) return
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convoId) return c
          const next = updater(c)
          return {
            ...next,
            title: conversationPreviewTitle(next),
            updatedAt: Date.now(),
          }
        })
      )
    },
    []
  )

  const patchActive = useCallback(
    (updater: (c: ChatConversation) => ChatConversation) => {
      patchConversation(activeIdRef.current, updater)
    },
    [patchConversation]
  )

  const clearPendingImage = useCallback(() => {
    setPendingImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
    if (fileRef.current) fileRef.current.value = ""
  }, [])

  const loadConversationFields = useCallback(
    (convo: ChatConversation) => {
      const handoff = normalizeContactHandoff(convo)
      seenRemoteRef.current = new Set(convo.seenRemoteIds)
      setActiveId(convo.id)
      setStreamState("offline")
      setDraft("")
      setError(null)
      setDeliveredPulse(false)
      setCopiedChatId(false)
      setConnectingUI(null)
      clearPendingImage()
      lastActivityRef.current = Date.now()
      lastReopenAtRef.current = 0
      ticketResolvedRef.current =
        handoff === "closed" ? true : handoff === "live" ? false : null
      handoffRef.current = handoff
      setPresence(handoff === "closed" ? "offline" : "active")
      if (handoff !== convo.handoff) {
        patchConversation(convo.id, (c) => ({ ...c, handoff }))
      }
    },
    [clearPendingImage, patchConversation]
  )

  useEffect(() => {
    setSessionIdState(getOrCreateChatSessionId())
  }, [])

  useEffect(() => {
    bumpActivity()
  }, [messages, draft, open, handoff, bumpActivity])

  useEffect(() => {
    if (handoff === "closed") {
      setPresence("offline")
      return
    }
    const id = window.setInterval(() => {
      const idle = Date.now() - lastActivityRef.current >= IDLE_MS
      setPresence(idle ? "idle" : "active")
    }, 4_000)
    return () => window.clearInterval(id)
  }, [handoff])

  useEffect(() => {
    const store = loadPersistedChatStore(greetingMessages())
    setConversations(store.conversations)
    const current =
      store.conversations.find((c) => c.id === store.activeId) ??
      store.conversations[0]!
    loadConversationFields(current)
    try {
      if (window.localStorage.getItem(CHAT_OPEN_KEY) === "1") setOpen(true)
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [loadConversationFields])

  // Open from `?support-chat` on any navigation (footer Link, /support redirect, typed URL).
  useEffect(() => {
    if (!hydrated || !searchParams.has(SUPPORT_CHAT_QUERY)) return

    const message = searchParams.get(SUPPORT_CHAT_MESSAGE_QUERY)?.trim() ?? ""
    const wantsNew =
      searchParams.has(SUPPORT_CHAT_NEW_QUERY) || message.length > 0

    setOpen(true)

    if (wantsNew) {
      const greeting = greetingMessages()
      const next = createEmptyConversation(greeting)
      setConversations((prev) => [next, ...prev])
      loadConversationFields(next)
    }

    if (message) {
      // Don’t put the issue into the name/email field — apply after contact.
      pendingIssueDraftRef.current = message
      window.setTimeout(() => inputRef.current?.focus(), 280)
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete(SUPPORT_CHAT_QUERY)
    params.delete(SUPPORT_CHAT_MESSAGE_QUERY)
    params.delete(SUPPORT_CHAT_NEW_QUERY)
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [searchParams, pathname, router, hydrated, loadConversationFields])

  useEffect(() => {
    if (!hydrated || !activeId || conversations.length === 0) return
    savePersistedChatStore({
      version: 3,
      activeId,
      conversations: conversations.map((c) =>
        c.id === activeId
          ? {
              ...c,
              seenRemoteIds: [...seenRemoteRef.current],
              title: conversationPreviewTitle(c),
            }
          : c
      ),
    })
    try {
      window.localStorage.setItem(CHAT_OPEN_KEY, open ? "1" : "0")
    } catch {
      /* ignore */
    }
  }, [conversations, activeId, open, hydrated])

  useEffect(() => {
    if (!open) {
      setMenuOpen(false)
      return
    }
    setUnread(0)
    if (handoff === "closed") return
    const id = window.setTimeout(() => inputRef.current?.focus(), 240)
    return () => window.clearTimeout(id)
  }, [open, handoff])
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }, [messages, open, reduceMotion, connectingUI, adminTyping])

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (menuButtonRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  const pushMessage = useCallback(
    (msg: ChatMessage) => {
      patchActive((c) => ({
        ...c,
        messages: [...c.messages, msg],
      }))
    },
    [patchActive]
  )

  const conversationsRef = useRef(conversations)
  conversationsRef.current = conversations

  const ingestAdminMessages = useCallback(
    (
      incoming: Array<{
        id: string
        body: string
        createdAt?: string
        imageUrl?: string | null
      }>,
      convoId?: string | null
    ) => {
      const targetId = convoId ?? activeIdRef.current
      if (!targetId || incoming.length === 0) return

      const current = conversationsRef.current.find((c) => c.id === targetId)
      if (!current) return

      const existing = new Set<string>([
        ...current.seenRemoteIds,
        ...current.messages
          .map((p) => p.remoteId)
          .filter((id): id is string => Boolean(id)),
      ])

      const alreadyJoined =
        current.founderJoined ||
        current.messages.some(
          (p) =>
            p.role === "event" &&
            (/has joined the chat/i.test(p.body) ||
              /just joined/i.test(p.body) ||
              /connected you with the team/i.test(p.body))
        ) ||
        current.messages.some((p) => p.role === "founder")

      let localJoined = alreadyJoined
      const next: ChatMessage[] = []
      const teamJoinedRemoteId = `team-joined:${targetId}`

      for (const m of incoming) {
        const hasBody = Boolean(m.body?.trim())
        const hasImage = Boolean(m.imageUrl?.trim())
        if (!hasBody && !hasImage) continue
        if (existing.has(m.id)) continue
        existing.add(m.id)

        if (!localJoined) {
          localJoined = true
          // Presence only when the team actually messages — not after email/ticket create.
          // Stable remoteId prevents duplicate chips when SSE + poll race.
          next.push({
            id: chatMessageId(),
            role: "event",
            body: SUPPORT_TEAM_JUST_JOINED,
            createdAt: Date.now(),
            remoteId: teamJoinedRemoteId,
          })
          existing.add(teamJoinedRemoteId)
        }

        next.push({
          id: `founder-${m.id}`,
          role: "founder",
          body: m.body || (m.imageUrl ? " " : ""),
          createdAt: m.createdAt
            ? Date.parse(m.createdAt) || Date.now()
            : Date.now(),
          remoteId: m.id,
          imageUrl: m.imageUrl ?? null,
        })
      }

      if (next.length === 0) return

      const founderCount = next.filter((m) => m.role === "founder").length
      const seenRemoteIds = [...existing]

      if (founderCount > 0 && targetId === activeIdRef.current) {
        if (adminTypingTimerRef.current) {
          window.clearTimeout(adminTypingTimerRef.current)
          adminTypingTimerRef.current = null
        }
        setAdminTyping(false)
      }

      patchConversation(targetId, (c) => {
        // Re-check against latest conversation state (concurrent polls)
        const live = new Set<string>([
          ...c.seenRemoteIds,
          ...c.messages
            .map((p) => p.remoteId)
            .filter((id): id is string => Boolean(id)),
        ])
        const alreadyHasJoin =
          c.founderJoined ||
          c.messages.some(
            (p) =>
              p.role === "event" &&
              (/has joined the chat/i.test(p.body) ||
                /just joined/i.test(p.body) ||
                /connected you with the team/i.test(p.body))
          ) ||
          c.messages.some((p) => p.role === "founder")
        const fresh = next.filter((m) => {
          if (m.remoteId && live.has(m.remoteId)) return false
          if (
            m.role === "event" &&
            /just joined/i.test(m.body) &&
            alreadyHasJoin
          ) {
            return false
          }
          return true
        })
        if (fresh.length === 0) return c
        for (const m of fresh) {
          if (m.remoteId) live.add(m.remoteId)
        }
        const joinedNow = fresh.some(
          (m) => m.role === "event" && /just joined/i.test(m.body)
        )
        return {
          ...c,
          founderJoined: localJoined || c.founderJoined || joinedNow,
          seenRemoteIds: [...live],
          messages: [...c.messages, ...fresh],
        }
      })

      if (targetId === activeIdRef.current) {
        for (const id of seenRemoteIds) seenRemoteRef.current.add(id)
      }

      queueMicrotask(() => {
        void playChatReceiveSound()
        if (!openRef.current && founderCount > 0) {
          setUnread((n) => n + founderCount)
        }
      })
    },
    [patchConversation]
  )

  const markTicketSeen = useCallback(async () => {
    if (!ticketId) return
    try {
      await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getOrCreateChatSessionId(),
          ticketId,
          action: "mark_seen",
        }),
      })
    } catch {
      /* ignore */
    }
  }, [ticketId])

  // Clear server-side unseen only while the panel is open
  useEffect(() => {
    if (!open || !ticketId) return
    void markTicketSeen()
  }, [open, ticketId, markTicketSeen])

  const acceptImageFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return
      if (handoff === "closed") {
        setError("This chat is closed. Start a new chat to send images.")
        return
      }
      if (!canAttachImages) {
        setError("Add your email first — then you can attach a screenshot.")
        return
      }
      if (connectingUI) {
        setError("Please wait while we connect you with the team.")
        return
      }
      if (!isAllowedChatImage(file)) {
        setError("Images only — jpg, png, or webp under 4MB.")
        return
      }
      setError(null)
      setPendingImage((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return { file, previewUrl: URL.createObjectURL(file) }
      })
    },
    [handoff, connectingUI, canAttachImages]
  )

  const closeLiveChat = useCallback(
    (convoId?: string | null) => {
      const id = convoId ?? activeIdRef.current
      if (!id) return

      const now = Date.now()

      patchConversation(id, (c) => {
        if (c.handoff === "closed") return c

        let lastCloseAt = -1
        let lastReopenAt = -1
        for (let i = 0; i < c.messages.length; i++) {
          const p = c.messages[i]!
          if (p.role !== "event") continue
          if (/^chat closed$/i.test(p.body.trim())) lastCloseAt = i
          if (
            /^chat reopened$/i.test(p.body.trim()) ||
            /has rejoined the chat/i.test(p.body)
          ) {
            lastReopenAt = i
          }
        }

        const needsBanner = lastCloseAt <= lastReopenAt
        const extras: ChatMessage[] = needsBanner
          ? [
              {
                id: chatMessageId(),
                role: "event",
                body: `${FOUNDER_DISPLAY_NAME} has left the chat`,
                createdAt: now,
              },
              {
                id: chatMessageId(),
                role: "event",
                body: "Chat closed",
                createdAt: now + 1,
              },
            ]
          : []

        return {
          ...c,
          handoff: "closed" as const,
          messages: extras.length > 0 ? [...c.messages, ...extras] : c.messages,
        }
      })

      if (id === activeIdRef.current) {
        const wasLive = handoffRef.current !== "closed"
        handoffRef.current = "closed"
        ticketResolvedRef.current = true
        setPresence("offline")
        clearPendingImage()
        if (wasLive) void playChatReceiveSound()
      }
    },
    [clearPendingImage, patchConversation]
  )

  const reopenLiveChat = useCallback(
    (convoId?: string | null) => {
      const id = convoId ?? activeIdRef.current
      if (!id) return

      const now = Date.now()
      if (
        now - lastReopenAtRef.current < 1200 &&
        id === activeIdRef.current &&
        handoffRef.current === "live"
      ) {
        return
      }

      const extras: ChatMessage[] = [
        {
          id: chatMessageId(),
          role: "event",
          body: `${FOUNDER_DISPLAY_NAME} has rejoined the chat`,
          createdAt: now,
        },
        {
          id: chatMessageId(),
          role: "event",
          body: "Chat reopened",
          createdAt: now + 1,
        },
      ]

      patchConversation(id, (c) => {
        let lastCloseAt = -1
        let lastReopenAt = -1
        for (let i = 0; i < c.messages.length; i++) {
          const p = c.messages[i]!
          if (p.role !== "event") continue
          if (/^chat closed$/i.test(p.body.trim())) lastCloseAt = i
          if (
            /^chat reopened$/i.test(p.body.trim()) ||
            /has rejoined the chat/i.test(p.body)
          ) {
            lastReopenAt = i
          }
        }

        const needsReopenBanner =
          c.handoff === "closed" || lastCloseAt > lastReopenAt

        if (!needsReopenBanner) return c

        return {
          ...c,
          handoff: "live" as const,
          founderJoined: true,
          messages: [...c.messages, ...extras],
        }
      })

      if (id === activeIdRef.current) {
        const wasClosed = handoffRef.current === "closed"
        lastReopenAtRef.current = now
        handoffRef.current = "live"
        ticketResolvedRef.current = false
        lastActivityRef.current = now
        setPresence("active")
        if (wasClosed) {
          void playChatReceiveSound()
          if (!openRef.current) setUnread((n) => n + 1)
        }
      }
    },
    [patchConversation]
  )

  const applyTicketResolved = useCallback(
    (resolved: boolean, convoId?: string | null) => {
      const id = convoId ?? activeIdRef.current
      if (!id) return

      if (id === activeIdRef.current) {
        const prev = ticketResolvedRef.current
        ticketResolvedRef.current = resolved
        if (resolved) {
          closeLiveChat(id)
          return
        }
        if (prev === true || handoffRef.current === "closed") {
          reopenLiveChat(id)
        }
        return
      }

      if (resolved) closeLiveChat(id)
      else reopenLiveChat(id)
    },
    [closeLiveChat, reopenLiveChat]
  )
  const startNewChat = useCallback(() => {
    if (busy) return
    const greeting = greetingMessages()
    const next = createEmptyConversation(greeting)
    setConversations((prev) => [next, ...prev])
    loadConversationFields(next)
    setConnectingUI(null)
    setMenuOpen(false)
    void playChatPopSound()
    window.setTimeout(() => inputRef.current?.focus(), 120)
  }, [loadConversationFields, busy])

  const switchConversation = useCallback(
    (id: string) => {
      if (busy) return
      if (id === activeIdRef.current) {
        setMenuOpen(false)
        return
      }
      const target = conversations.find((c) => c.id === id)
      if (!target) return
      loadConversationFields(target)
      setMenuOpen(false)
      void playChatPopSound()
      if (target.handoff !== "closed") {
        window.setTimeout(() => inputRef.current?.focus(), 120)
      }
    },
    [conversations, loadConversationFields, busy]
  )

  useEffect(() => {
    if (!open || handoff === "closed" || !canAttachImages) return

    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            event.preventDefault()
            acceptImageFile(file)
          }
          break
        }
      }
    }

    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [open, handoff, canAttachImages, acceptImageFile])

  const syncTicketMessages = useCallback(async () => {
    const convoId = activeIdRef.current
    const tid = ticketId
    if (!tid || !convoId) return
    try {
      const res = await fetch(
        `/api/support/tickets?sessionId=${encodeURIComponent(getOrCreateChatSessionId())}`
      )
      if (!res.ok) return
      // Drop stale responses after conversation switch
      if (activeIdRef.current !== convoId) return

      const data = (await res.json()) as {
        tickets?: Array<{
          id: string
          isResolved?: boolean
          userHasUnread?: boolean
          messages?: Array<{
            id: string
            author: string
            body: string
            createdAt: string
            imageUrl?: string | null
          }>
        }>
      }
      if (activeIdRef.current !== convoId) return

      const ticket = data.tickets?.find((t) => t.id === tid)
      if (!ticket) return

      if (typeof ticket.isResolved === "boolean") {
        applyTicketResolved(ticket.isResolved, convoId)
      }

      if (!ticket.messages) return

      const admin = ticket.messages
        .filter((m) => m.author === "admin")
        .map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt,
          imageUrl: m.imageUrl ?? null,
        }))
      // Always ingest — even when closed — so closing notes aren't lost
      ingestAdminMessages(admin, convoId)
      if (
        ticket.userHasUnread &&
        openRef.current &&
        activeIdRef.current === convoId &&
        handoffRef.current !== "closed"
      ) {
        void markTicketSeen()
      }
    } catch {
      /* ignore */
    }
  }, [ticketId, ingestAdminMessages, markTicketSeen, applyTicketResolved])

  const clearAdminTyping = useCallback(() => {
    if (adminTypingTimerRef.current) {
      window.clearTimeout(adminTypingTimerRef.current)
      adminTypingTimerRef.current = null
    }
    setAdminTyping(false)
  }, [])

  const pulseAdminTyping = useCallback(() => {
    setAdminTyping(true)
    if (adminTypingTimerRef.current) {
      window.clearTimeout(adminTypingTimerRef.current)
    }
    adminTypingTimerRef.current = window.setTimeout(() => {
      setAdminTyping(false)
      adminTypingTimerRef.current = null
    }, ADMIN_TYPING_TTL_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (adminTypingTimerRef.current) {
        window.clearTimeout(adminTypingTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Reset typing when switching conversations / leaving live.
    clearAdminTyping()
  }, [ticketId, handoff, clearAdminTyping])

  const { signalTyping } = useSupportTypingEmitter({
    ticketId,
    enabled: Boolean(ticketId) && handoff === "live",
    buildBody: () => ({
      sessionId: getOrCreateChatSessionId(),
    }),
    endpointFor: (id) => `/api/support/tickets/${encodeURIComponent(id)}/typing`,
  })

  useSupportTicketStream(
    ticketId,
    sessionIdState,
    Boolean(ticketId) && (handoff === "live" || handoff === "closed"),
    {
      onMessage: (message) => {
        if (message.author !== "admin") return
        clearAdminTyping()
        const convoId = activeIdRef.current
        // Do NOT local-reopen on admin reply — only when server sets is_resolved=false
        ingestAdminMessages(
          [
            {
              id: message.id,
              body: message.body,
              createdAt: message.createdAt,
              imageUrl: message.imageUrl ?? null,
            },
          ],
          convoId
        )
        if (openRef.current && handoffRef.current !== "closed") {
          void markTicketSeen()
        }
      },
      onTicketUpdate: (update) => {
        const convoId = activeIdRef.current
        if (typeof update.isResolved === "boolean") {
          applyTicketResolved(update.isResolved, convoId)
        }
        void syncTicketMessages()
      },
      onTyping: () => {
        if (handoffRef.current === "closed") return
        pulseAdminTyping()
      },
      onConnectionChange: setStreamState,
    }
  )

  // Safety-net poll — keep listening while live or closed (for reopen).
  // Skip while the tab is hidden; closed tickets only poll when chat is open.
  useEffect(() => {
    if (!ticketId) return
    if (handoff !== "live" && handoff !== "closed") return
    if (handoff === "closed" && !open) return
    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      if (typeof document !== "undefined" && document.hidden) return
      await syncTicketMessages()
    }

    void tick()
    const ms =
      handoff === "closed"
        ? POLL_CLOSED_MS
        : streamState === "live"
          ? POLL_LIVE_MS
          : POLL_OFFLINE_MS
    const id = window.setInterval(tick, ms)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [handoff, ticketId, streamState, syncTicketMessages, open])

  const pushEvent = useCallback(
    (body: string) => {
      pushMessage({
        id: chatMessageId(),
        role: "event",
        body,
        createdAt: Date.now(),
      })
      void playChatReceiveSound()
      if (!openRef.current) setUnread((n) => n + 1)
    },
    [pushMessage]
  )

  const pushSupportPrompt = useCallback(
    (body: string) => {
      pushMessage({
        id: chatMessageId(),
        role: "assist",
        body,
        createdAt: Date.now(),
      })
      void playChatReceiveSound()
    },
    [pushMessage]
  )

  /**
   * After a valid email is saved: create Chat ID + ticket (seed), then connecting → live.
   * The visitor’s first issue message later appends to this ticket.
   */
  const createTicketAfterEmail = useCallback(
    async (opts?: { name?: string; email?: string }) => {
    const provisionalId = activeIdRef.current
    if (!provisionalId) return false

    const convo = conversationsRef.current.find((c) => c.id === provisionalId)
    const name = (
      opts?.name ||
      convo?.visitorName ||
      visitorName ||
      "Visitor"
    ).trim()
    const email = (
      opts?.email ||
      convo?.visitorEmail ||
      visitorEmail
    )
      .trim()
      .toLowerCase()
    const contactName = email
      ? `${name} · ${email}`.slice(0, 120)
      : name.slice(0, 120)

    const publicChatId = isPublicChatId(provisionalId)
      ? provisionalId
      : createChatId()

    if (publicChatId !== provisionalId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === provisionalId ? { ...c, id: publicChatId } : c
        )
      )
      setActiveId(publicChatId)
      activeIdRef.current = publicChatId
    }

    // Already have a ticket (resume / retry) — don’t create a second one.
    const existingConvo = conversationsRef.current.find(
      (c) => c.id === provisionalId || c.id === publicChatId
    )
    const existingTid = existingConvo?.ticketId
    if (existingTid) {
      patchConversation(publicChatId, (c) => ({
        ...c,
        ticketId: existingTid,
        handoff: "live",
      }))
      if (activeIdRef.current === publicChatId) {
        handoffRef.current = "live"
        ticketResolvedRef.current = false
      }
      setConnectingUI(null)
      const alreadyHasConnectingPrompt = (existingConvo?.messages ?? []).some(
        (m) =>
          m.role === "assist" &&
          (/you.?re connected/i.test(m.body) ||
            /we.?re connecting you/i.test(m.body) ||
            /meanwhile,? tell us/i.test(m.body))
      )
      if (!alreadyHasConnectingPrompt) {
        pushSupportPrompt(SUPPORT_CONNECTING_PROMPT)
      }
      return true
    }

    setConnectingUI("connecting")
    void playChatPopSound()
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getOrCreateChatSessionId(),
          name: contactName,
          message: SUPPORT_JOIN_SEED,
          chatId: publicChatId,
          // Assist seed keeps Reply queue clean until the visitor’s first issue appends.
          firstAuthor: "assist",
          needsAdminReply: false,
          sentiment: "neutral",
        }),
      })
      const data = (await res.json()) as {
        ticket?: { id: string }
        error?: string
      }
      if (!res.ok || !data.ticket?.id) {
        throw new Error(supportErrorMessage(data.error ?? "create_failed"))
      }
      const tid = data.ticket.id

      await new Promise((r) => setTimeout(r, reduceMotion ? 280 : 700))

      patchConversation(publicChatId, (c) => ({
        ...c,
        ticketId: tid,
        handoff: "live",
      }))
      if (activeIdRef.current === publicChatId) {
        handoffRef.current = "live"
        ticketResolvedRef.current = false
      }
      setConnectingUI(null)
      // Invite them to describe the issue. “Team just joined” waits for a real admin msg.
      pushSupportPrompt(SUPPORT_CONNECTING_PROMPT)
      await new Promise((r) => setTimeout(r, reduceMotion ? 120 : 280))
      pushEvent(SUPPORT_REPLY_WINDOW_EVENT)
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start chat."
      setError(msg)
      setConnectingUI(null)
      patchConversation(publicChatId, (c) => ({
        ...c,
        handoff: "ask_issue",
      }))
      if (activeIdRef.current === publicChatId) {
        handoffRef.current = "ask_issue"
      }
      return false
    }
  },
  [
    patchConversation,
    pushEvent,
    pushSupportPrompt,
    reduceMotion,
    visitorName,
    visitorEmail,
  ]
  )

  const replyOnTicket = useCallback(
    async (text: string, imageUrl?: string | null) => {
      const convoId = activeIdRef.current
      const tid =
        ticketId ??
        conversationsRef.current.find((c) => c.id === convoId)?.ticketId ??
        null
      if (!tid || !convoId) return false
      setBusy(true)
      setError(null)
      try {
        const res = await fetch(`/api/support/tickets/${tid}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getOrCreateChatSessionId(),
            message: text,
            imageUrl: imageUrl || null,
          }),
        })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) {
          if (data.error === "ticket_closed" || res.status === 409) {
            closeLiveChat(convoId)
          }
          throw new Error(supportErrorMessage(data.error ?? "reply_failed"))
        }
        if (activeIdRef.current === convoId) {
          setDeliveredPulse(true)
          window.setTimeout(() => setDeliveredPulse(false), 1800)
        }
        return true
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not send."
        if (activeIdRef.current === convoId) {
          setError(msg)
          pushMessage({
            id: chatMessageId(),
            role: "system",
            body: msg,
            createdAt: Date.now(),
          })
        }
        return false
      } finally {
        setBusy(false)
      }
    },
    [ticketId, pushMessage, closeLiveChat]
  )

  /**
   * Legacy / resume: contact collected but no ticket yet — create from first issue,
   * or append when a ticket already exists.
   */
  const ensureTicketThenSendIssue = useCallback(
    async (text: string, imageUrl?: string | null) => {
      const provisionalId = activeIdRef.current
      if (!provisionalId) return false

      const existingTid = conversationsRef.current.find(
        (c) => c.id === provisionalId
      )?.ticketId
      if (existingTid) {
        return replyOnTicket(text, imageUrl)
      }

      const convo = conversationsRef.current.find(
        (c) => c.id === provisionalId
      )
      const name = (convo?.visitorName || visitorName || "Visitor").trim()
      const email = (convo?.visitorEmail || visitorEmail).trim().toLowerCase()
      const contactName = email
        ? `${name} · ${email}`.slice(0, 120)
        : name.slice(0, 120)

      const publicChatId = isPublicChatId(provisionalId)
        ? provisionalId
        : createChatId()

      if (publicChatId !== provisionalId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === provisionalId ? { ...c, id: publicChatId } : c
          )
        )
        setActiveId(publicChatId)
        activeIdRef.current = publicChatId
      }

      setConnectingUI("connecting")
      void playChatPopSound()
      try {
        const res = await fetch("/api/support/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getOrCreateChatSessionId(),
            name: contactName,
            message: text.trim() || " ",
            imageUrl: imageUrl || null,
            chatId: publicChatId,
            firstAuthor: "user",
            needsAdminReply: true,
            sentiment: "neutral",
          }),
        })
        const data = (await res.json()) as {
          ticket?: { id: string }
          error?: string
        }
        if (!res.ok || !data.ticket?.id) {
          throw new Error(supportErrorMessage(data.error ?? "create_failed"))
        }

        await new Promise((r) => setTimeout(r, reduceMotion ? 280 : 700))

        patchConversation(publicChatId, (c) => ({
          ...c,
          ticketId: data.ticket!.id,
          handoff: "live",
        }))
        if (activeIdRef.current === publicChatId) {
          handoffRef.current = "live"
          ticketResolvedRef.current = false
        }
        setConnectingUI(null)
        // “Team just joined” waits for the first real admin message.
        pushEvent(SUPPORT_REPLY_WINDOW_EVENT)
        return true
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not start chat."
        setError(msg)
        setConnectingUI(null)
        patchConversation(publicChatId, (c) => ({
          ...c,
          handoff: "ask_issue",
        }))
        return false
      }
    },
    [
      patchConversation,
      pushEvent,
      reduceMotion,
      replyOnTicket,
      visitorName,
      visitorEmail,
    ]
  )

  const handleUserText = useCallback(
    async (raw: string) => {
      const text =
        handoff === "ask_email"
          ? sanitizeVisitorEmailDraft(raw).trim()
          : raw.trim()
      const hasImage = Boolean(pendingImage) && canAttachImages
      if ((!text && !hasImage) || busy || sendingRef.current) return

      if (handoff === "closed") {
        setError("This chat is closed. Start a new chat to continue.")
        return
      }

      if (connectingUI) return

      // —— Contact collection (no ticket yet) ——
      if (handoff === "ask_name") {
        if (!text) {
          pushSupportPrompt("Please type your name so our team knows who you are.")
          return
        }
        const name = text.slice(0, 120)
        sendingRef.current = true
        setBusy(true)
        setDraft("")
        setError(null)
        clearPendingImage()
        try {
          pushMessage({
            id: chatMessageId(),
            role: "user",
            body: name,
            createdAt: Date.now(),
          })
          void playChatSendSound()
          patchActive((c) => ({
            ...c,
            visitorName: name,
            handoff: "ask_email",
          }))
          handoffRef.current = "ask_email"
          pushSupportPrompt(
            `Nice to meet you, ${name}.\n\nWhat’s the best email to reach you at? We’ll save it with this chat so our team can follow up if needed.`
          )
        } finally {
          sendingRef.current = false
          setBusy(false)
        }
        return
      }

      if (handoff === "ask_email") {
        if (!text || !isValidVisitorEmail(text)) {
          setDraft(text)
          pushSupportPrompt(
            "Please enter a valid email address (for example, you@icloud.com) — nothing else."
          )
          return
        }
        const email = text.toLowerCase().slice(0, 254)
        sendingRef.current = true
        setBusy(true)
        setDraft("")
        setError(null)
        clearPendingImage()
        try {
          pushMessage({
            id: chatMessageId(),
            role: "user",
            body: email,
            createdAt: Date.now(),
          })
          void playChatSendSound()
          // Persist contact first so ticket create can read name · email.
          const knownName = (
            conversationsRef.current.find(
              (c) => c.id === activeIdRef.current
            )?.visitorName ||
            visitorName ||
            "Visitor"
          ).trim()
          patchActive((c) => ({
            ...c,
            visitorEmail: email,
            handoff: "ask_issue",
          }))
          handoffRef.current = "ask_issue"
          // Chat ID + ticket now — connecting copy / Fin events live inside create.
          const created = await createTicketAfterEmail({
            name: knownName,
            email,
          })
          if (!created) return
          const pending = pendingIssueDraftRef.current
          if (pending) {
            pendingIssueDraftRef.current = ""
            setDraft(pending)
            window.setTimeout(() => {
              const el = inputRef.current
              if (!el) return
              el.focus()
              el.setSelectionRange(pending.length, pending.length)
            }, 80)
          }
        } finally {
          sendingRef.current = false
          setBusy(false)
        }
        return
      }

      sendingRef.current = true
      setBusy(true)
      setDraft("")
      setError(null)

      try {
        let imageUrl: string | null = null
        const localPreview = hasImage
          ? (pendingImage?.previewUrl ?? null)
          : null
        const fileToUpload = hasImage ? (pendingImage?.file ?? null) : null

        if (fileToUpload) {
          try {
            imageUrl = await uploadChatImage(
              getOrCreateChatSessionId(),
              fileToUpload
            )
          } catch {
            setError(
              "Couldn’t upload that image. Try jpg, png, or webp under 4MB."
            )
            return
          }
          clearPendingImage()
        } else if (pendingImage && !canAttachImages) {
          clearPendingImage()
        }

        const userMessage: ChatMessage = {
          id: chatMessageId(),
          role: "user",
          body: text || " ",
          createdAt: Date.now(),
          imageUrl: imageUrl || localPreview,
        }
        pushMessage(userMessage)
        void playChatSendSound()

        if (handoff === "live") {
          // Ticket already exists (created at email) — append the issue / reply.
          await replyOnTicket(text || " ", imageUrl)
          return
        }

        // ask_issue resume: create ticket from first issue, or append if one exists.
        await ensureTicketThenSendIssue(text || " ", imageUrl)
      } finally {
        sendingRef.current = false
        setBusy(false)
      }
    },
    [
      busy,
      handoff,
      connectingUI,
      pendingImage,
      canAttachImages,
      pushMessage,
      pushSupportPrompt,
      patchActive,
      replyOnTicket,
      createTicketAfterEmail,
      ensureTicketThenSendIssue,
      clearPendingImage,
      visitorName,
    ]
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void handleUserText(draft)
  }

  // Lets other bottom-right widgets (social proof popup) step aside.
  useEffect(() => {
    const root = document.documentElement
    if (open) root.dataset.macwallChatOpen = "true"
    else delete root.dataset.macwallChatOpen
    return () => {
      delete root.dataset.macwallChatOpen
    }
  }, [open])

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev
      if (next) void playChatOpenSound()
      else {
        void playChatCloseSound()
        setMenuOpen(false)
      }
      return next
    })
  }

  const copyChatId = async () => {
    if (!chatId) return
    try {
      await navigator.clipboard.writeText(chatId)
      setCopiedChatId(true)
      window.setTimeout(() => setCopiedChatId(false), 1600)
    } catch {
      setError("Couldn’t copy Chat ID. Select and copy it manually.")
    }
  }

  const menuConversations = useMemo(() => {
    const lastActivity = (c: ChatConversation) => {
      const lastMsg = c.messages.at(-1)?.createdAt
      return lastMsg ?? c.updatedAt ?? c.createdAt
    }
    return [...conversations]
      .sort((a, b) => lastActivity(b) - lastActivity(a))
      .slice(0, MENU_CONVERSATION_LIMIT)
  }, [conversations])

  const status = useMemo(() => {
    if (handoff === "closed") {
      return { label: "Chat closed", live: false }
    }
    if (founderJoined) {
      return {
        label:
          presence === "idle"
            ? `${FOUNDER_DISPLAY_NAME} · away`
            : `${FOUNDER_DISPLAY_NAME} is in this chat`,
        live: true,
      }
    }
    // Transient handoff chip only — never leave SSE reconnect as a stuck “Connecting…” header.
    if (connectingUI) {
      return { label: "Connecting you to the team…", live: true }
    }
    if (handoff === "live") {
      return {
        label:
          presence === "idle"
            ? "Away · typically replies within 24 hours"
            : streamState === "live"
              ? "Live · usually replies within 24 hours"
              : "Usually replies within 24 hours",
        live: true,
      }
    }
    if (
      handoff === "ask_name" ||
      handoff === "ask_email" ||
      handoff === "ask_issue"
    ) {
      return { label: "Getting you set up…", live: false }
    }
    return {
      label:
        presence === "idle"
          ? "Away · usually replies within 24 hours"
          : "Usually replies within 24 hours",
      live: false,
    }
  }, [handoff, founderJoined, streamState, presence, connectingUI])

  const presenceDotClass =
    handoff === "closed"
      ? "bg-white/30"
      : presence === "idle"
        ? "bg-amber-400"
        : "bg-emerald-400"

  const showChatIdBanner =
    Boolean(publicChatId) &&
    (handoff === "live" || handoff === "closed" || connectingUI !== null)
  // Keep composer visible during connect — only briefly disable send; no overlay.
  const composerHidden = handoff === "closed"
  const composerLocked = connectingUI !== null

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (composerHidden || !canAttachImages || composerLocked) return
    dragDepthRef.current += 1
    setDragActive(true)
  }

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setDragActive(false)
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setDragActive(false)
    if (composerHidden || !canAttachImages || composerLocked) return
    const file = e.dataTransfer.files?.[0]
    acceptImageFile(file)
  }

  if (hidden || !hydrated || !active) return null

  return (
    <div className="pointer-events-none fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[80] flex flex-col items-end gap-3 sm:right-5 sm:bottom-5">
      <AnimatePresence>
        {open ? (
          <motion.section
            id={panelId}
            key="panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            initial={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 22, scale: 0.92, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.96, filter: "blur(5px)" }
            }
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative flex h-[min(36rem,calc(100dvh-7.5rem))] w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0e0e0c] font-sans shadow-[0_28px_90px_rgba(0,0,0,0.62)]"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {dragActive ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-[2px]">
                <div className="rounded-2xl border border-dashed border-white/35 bg-white/5 px-6 py-5 text-center">
                  <p className="font-sans text-[15px] font-normal text-white">
                    Drop image to attach
                  </p>
                  <p className="mt-1 font-sans text-[12px] font-normal text-white/50">
                    jpg · png · webp · max 4MB
                  </p>
                </div>
              </div>
            ) : null}

            <header className="relative border-b border-white/[0.07] px-3.5 py-3">
              <div className="relative flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <span className="relative flex size-8 overflow-hidden rounded-full bg-black ring-1 ring-white/12">
                    <MacWallAppIcon
                      size={32}
                      className="!rounded-full"
                      alt=""
                      aria-hidden
                    />
                  </span>
                  <span
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-[#0e0e0c] transition-colors duration-500",
                      presenceDotClass
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    id={titleId}
                    className="truncate font-sans text-[14px] font-normal tracking-tight text-white"
                  >
                    {macwall.name} Support
                  </h2>
                  <p className="truncate font-sans text-[11px] font-normal text-white/50">
                    {status.label}
                  </p>
                </div>
                <div className="relative">
                  <button
                    ref={menuButtonRef}
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="inline-flex size-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Chat menu"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-controls={menuOpen ? menuId : undefined}
                  >
                    <HugeiconsIcon
                      icon={MoreHorizontalIcon}
                      size={18}
                      strokeWidth={2}
                    />
                  </button>
                  <AnimatePresence>
                    {menuOpen ? (
                      <motion.div
                        ref={menuRef}
                        id={menuId}
                        role="menu"
                        aria-label="Conversations"
                        initial={
                          reduceMotion
                            ? { opacity: 1 }
                            : { opacity: 0, y: -6, scale: 0.96 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: -4, scale: 0.98 }
                        }
                        transition={{ duration: 0.16 }}
                        className="absolute top-10 right-0 z-30 w-[15.5rem] overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a18] shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
                      >
                        <div className="max-h-56 overflow-y-auto overscroll-contain py-1.5">
                          {menuConversations.map((convo) => {
                            const statusLabel = handoffStatusLabel(
                              convo.handoff
                            )
                            const selected = convo.id === activeId
                            return (
                              <button
                                key={convo.id}
                                type="button"
                                role="menuitem"
                                onClick={() => switchConversation(convo.id)}
                                className={cn(
                                  "flex w-full flex-col gap-0.5 px-3 py-2 text-left transition hover:bg-white/[0.06]",
                                  selected && "bg-white/[0.08]"
                                )}
                              >
                                <span className="truncate font-sans text-[13px] font-normal text-white/90">
                                  {conversationPreviewTitle(convo)}
                                </span>
                                <span className="flex items-center gap-1.5 font-sans text-[10px] font-normal text-white/40">
                                  {isPublicChatId(convo.id) ? (
                                    <>
                                      <span className="tabular-nums">
                                        {convo.id}
                                      </span>
                                      <span aria-hidden>·</span>
                                    </>
                                  ) : null}
                                  <span
                                    className={cn(
                                      statusLabel === "Live" &&
                                        "text-emerald-300/90",
                                      statusLabel === "Closed" &&
                                        "text-white/35",
                                      statusLabel === "Open" && "text-white/45"
                                    )}
                                  >
                                    {statusLabel}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <div className="border-t border-white/[0.08] py-1">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={startNewChat}
                            className="flex w-full items-center gap-2 px-3 py-2 font-sans text-[13px] font-normal text-white/85 transition hover:bg-white/[0.06]"
                          >
                            <HugeiconsIcon
                              icon={PlusSignIcon}
                              size={14}
                              strokeWidth={2.2}
                            />
                            New chat
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              {showChatIdBanner ? (
                <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  <span className="min-w-0 flex-1 truncate font-sans text-[11px] font-normal text-white/55">
                    Chat ID{" "}
                    <span className="text-white/85 tabular-nums">{chatId}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyChatId()}
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                    aria-label={
                      copiedChatId ? "Copied Chat ID" : "Copy Chat ID"
                    }
                    title={copiedChatId ? "Copied" : "Copy Chat ID"}
                  >
                    <HugeiconsIcon
                      icon={copiedChatId ? Tick01Icon : Copy01Icon}
                      size={13}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              ) : null}
            </header>

            <div
              ref={listRef}
              className="flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-3.5 py-4"
            >
              {messages.map((m) => {
                // Connecting is a transient chip (connectingUI) — never keep it stuck in history.
                if (
                  m.role === "event" &&
                  m.body.trim() === SUPPORT_CONNECTING_EVENT
                ) {
                  return null
                }

                if (m.role === "event") {
                  const isLeave = /has left the chat/i.test(m.body)
                  const isClosed = /^chat closed$/i.test(m.body.trim())
                  const isRejoin = /has rejoined the chat/i.test(m.body)
                  const isReopened = /^chat reopened/i.test(m.body.trim())
                  const isJustJoined = /just joined/i.test(m.body)
                  const isConnected = /connected you with the team/i.test(
                    m.body
                  )
                  const isReopen = isRejoin || isReopened
                  const isPresence = isJustJoined || isConnected
                  return (
                    <motion.div
                      key={m.id}
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 10, scale: 0.94 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      className="flex justify-center px-2 py-1"
                    >
                      <div
                        className={cn(
                          "max-w-[92%] rounded-2xl px-3.5 py-2 text-center font-sans",
                          isLeave &&
                            "border border-amber-400/20 bg-amber-400/10 text-amber-50",
                          isClosed &&
                            "border border-white/10 bg-white/[0.05] text-white/70",
                          isRejoin &&
                            "border border-emerald-400/25 bg-emerald-400/10 text-emerald-50",
                          isReopened &&
                            "border border-emerald-400/30 bg-emerald-400/[0.12] text-emerald-50",
                          isPresence &&
                            !isReopen &&
                            "border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-50/90",
                          !isLeave &&
                            !isClosed &&
                            !isReopen &&
                            !isPresence &&
                            "bg-white/[0.06] text-white/55"
                        )}
                      >
                        <p className="text-[12px] font-normal tracking-wide">
                          {m.body}
                        </p>
                        {isReopened ? (
                          <p className="mt-1.5 text-[11px] font-normal text-emerald-100/65">
                            Live again with {FOUNDER_DISPLAY_NAME} — you can
                            keep messaging here.
                          </p>
                        ) : null}
                        {isClosed ? (
                          <>
                            {chatId ? (
                              <p className="mt-1.5 text-[11px] font-normal text-white/40">
                                Chat ID{" "}
                                <span className="text-white/65 tabular-nums">
                                  {chatId}
                                </span>
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={startNewChat}
                              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-normal text-black"
                            >
                              <HugeiconsIcon
                                icon={PlusSignIcon}
                                size={12}
                                strokeWidth={2.2}
                              />
                              Start new chat
                            </button>
                          </>
                        ) : null}
                      </div>
                    </motion.div>
                  )
                }

                const isUser = m.role === "user"
                const isFounder = m.role === "founder"
                const isSystem = m.role === "system"
                const caption = m.body.trim()
                const isLegacyPhotoLabel =
                  /^sent a (photo|image|img)$/i.test(caption)
                const hasRealText =
                  Boolean(caption) &&
                  caption !== " " &&
                  !isLegacyPhotoLabel
                const hasImage = Boolean(m.imageUrl?.trim())
                // Never render empty white/colored pills (user bubbles especially).
                if (!hasImage && !hasRealText) return null

                return (
                  <motion.div
                    key={m.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24 }}
                    className={cn(
                      "flex flex-col gap-1.5",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    {isFounder ? (
                      <span className="px-1 text-[11px] font-medium text-emerald-300/90">
                        {FOUNDER_DISPLAY_NAME}
                      </span>
                    ) : m.role === "assist" ? (
                      <span className="px-1 text-[11px] font-medium text-white/45">
                        MacWall Support
                      </span>
                    ) : null}
                    {/* Image = hero media; caption (if any) = its own bubble — iMessage-style. */}
                    <div
                      className={cn(
                        "flex max-w-[88%] flex-col gap-1.5",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      {hasImage ? (
                        <ChatAttachmentMedia
                          src={m.imageUrl!}
                          tone="dark"
                          maxWidth={248}
                        />
                      ) : null}
                      {hasRealText ? (
                        <div
                          className={cn(
                            "overflow-hidden rounded-[18px] px-3.5 py-2.5 font-sans text-[14px] leading-relaxed font-normal whitespace-pre-wrap",
                            isUser &&
                              "rounded-br-md bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                            isFounder &&
                              "rounded-bl-md border border-emerald-400/20 bg-emerald-400/10 text-white",
                            isSystem &&
                              "rounded-bl-md bg-amber-500/12 text-amber-50",
                            m.role === "assist" &&
                              "rounded-bl-md bg-white/[0.07] text-white/[0.94]"
                          )}
                        >
                          {linkify(m.body, isUser ? "user" : "support")}
                        </div>
                      ) : null}
                    </div>
                    <span className="px-1 text-[10px] text-white/30">
                      {formatTime(m.createdAt)}
                    </span>
                  </motion.div>
                )
              })}

              {connectingUI ? (
                <motion.div
                  key="connecting-chip"
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 10, scale: 0.94 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-center px-2 py-1"
                >
                  <div className="max-w-[92%] rounded-2xl bg-white/[0.06] px-3.5 py-2 text-center font-sans text-white/55">
                    <p className="text-[12px] font-normal tracking-wide">
                      {SUPPORT_CONNECTING_EVENT}
                    </p>
                  </div>
                </motion.div>
              ) : null}

              {deliveredPulse && handoff === "live" ? (
                <p className="text-center text-[11px] text-white/35">
                  Delivered
                </p>
              ) : null}

              <AnimatePresence>
                {adminTyping && handoff === "live" ? (
                  <SupportTypingBubble key="admin-typing" />
                ) : null}
              </AnimatePresence>
            </div>

            {!composerHidden ? (
              <form
                onSubmit={onSubmit}
                className="border-t border-white/[0.07] bg-[#121210]/90 px-3 pt-2.5 pb-3 font-sans backdrop-blur-md"
              >
                {error ? (
                  <p className="mb-2 px-1 text-[12px] font-normal text-red-300">
                    {error}
                  </p>
                ) : null}
                {handoff === "live" && !founderJoined ? (
                  <p className="mb-2 px-1 text-center text-[11px] font-normal text-white/40">
                    Our team will reply ASAP · typically within 24 hours
                  </p>
                ) : null}
                {pendingImage ? (
                  <div className="mb-2 flex items-center gap-2 rounded-[16px] border border-white/10 bg-black/30 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingImage.previewUrl}
                      alt="Selected attachment"
                      className="size-11 rounded-[12px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-normal text-white/80">
                        {pendingImage.file.name}
                      </p>
                      <p className="text-[11px] font-normal text-white/40">
                        Ready to send
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearPendingImage}
                      className="inline-flex size-7 items-center justify-center rounded-full text-white/50 hover:bg-white/8 hover:text-white"
                      aria-label="Remove attachment"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={14}
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                ) : null}

                {/* Apple Messages–style composer: text · camera · send */}
                <div className="flex items-end gap-1.5 rounded-[22px] border border-white/12 bg-[#1c1c1e] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:border-white/22">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      acceptImageFile(file)
                      e.target.value = ""
                    }}
                  />
                  <textarea
                    ref={inputRef}
                    value={draft}
                    rows={1}
                    onChange={(e) => {
                      const next =
                        handoff === "ask_email"
                          ? sanitizeVisitorEmailDraft(e.target.value)
                          : e.target.value
                      setDraft(next)
                      bumpActivity()
                      if (handoff === "live" && next.trim()) {
                        signalTyping()
                      }
                      const el = e.target
                      el.style.height = "auto"
                      el.style.height = `${Math.min(el.scrollHeight, 96)}px`
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        void handleUserText(draft)
                      }
                    }}
                    placeholder={
                      composerLocked
                        ? "Connecting…"
                        : handoff === "ask_name"
                          ? "Your name…"
                          : handoff === "ask_email"
                            ? "you@email.com"
                            : handoff === "live"
                              ? "Message…"
                              : "Describe your issue…"
                    }
                    disabled={busy || composerLocked}
                    autoComplete={
                      handoff === "ask_email"
                        ? "email"
                        : handoff === "ask_name"
                          ? "name"
                          : "off"
                    }
                    inputMode={handoff === "ask_email" ? "email" : undefined}
                    className="max-h-24 min-h-[36px] min-w-0 flex-1 resize-none bg-transparent px-2.5 py-2 font-sans text-[15px] leading-snug font-normal text-white outline-none placeholder:text-white/30 disabled:opacity-55"
                  />
                  <button
                    type="button"
                    disabled={busy || composerLocked || !canAttachImages}
                    onClick={() => {
                      if (!canAttachImages) return
                      fileRef.current?.click()
                    }}
                    className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#0a84ff] transition hover:bg-[#0a84ff]/12 disabled:opacity-35 disabled:text-white/30"
                    aria-label={
                      canAttachImages
                        ? "Attach photo"
                        : "Attach photo (enter email first)"
                    }
                    title={
                      canAttachImages
                        ? "Attach photo"
                        : "Enter your email first"
                    }
                  >
                    <HugeiconsIcon
                      icon={Camera01Icon}
                      size={20}
                      strokeWidth={1.8}
                    />
                  </button>
                  <button
                    type="submit"
                    disabled={
                      busy ||
                      composerLocked ||
                      (!draft.trim() && !(pendingImage && canAttachImages))
                    }
                    className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-white transition enabled:hover:brightness-110 disabled:bg-white/10 disabled:text-white/25"
                    aria-label="Send message"
                  >
                    <HugeiconsIcon icon={SentIcon} size={16} strokeWidth={2} />
                  </button>
                </div>
              </form>
            ) : null}
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={
          open
            ? "Close chat"
            : unread > 0
              ? `Open MacWall Support, ${unread} unseen ${unread === 1 ? "message" : "messages"}`
              : "Open MacWall Support"
        }
        className="pointer-events-auto relative flex size-[3.6rem] items-center justify-center rounded-full bg-white text-black shadow-[0_14px_44px_rgba(0,0,0,0.5)] transition hover:scale-[1.03] active:scale-[0.97]"
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      >
        {!open && unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 z-10 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white shadow-[0_0_0_2px_rgba(0,0,0,0.35)]">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
        {!open && unread > 0 && !reduceMotion ? (
          <span className="absolute -top-0.5 -right-0.5 size-5 animate-ping rounded-full bg-red-500/50" />
        ) : null}
        {!open && unread === 0 && !reduceMotion ? (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-white/20" />
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={
              reduceMotion ? false : { opacity: 0, rotate: -18, scale: 0.82 }
            }
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, rotate: 18, scale: 0.82 }
            }
            transition={{ duration: 0.18 }}
            className="flex size-full items-center justify-center"
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="currentColor"
                aria-hidden
              >
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-3.8 2.85c-.55.41-1.2-.06-1.2-.72V6.5Z" />
              </svg>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
