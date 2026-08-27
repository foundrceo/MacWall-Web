"use client"

import { useEffect, useRef } from "react"

/** Structured message data extracted from Supabase Realtime INSERT payload. */
export type SSEMessageData = {
  id: string
  author: "user" | "admin" | "assist"
  body: string
  imageUrl: string | null
  createdAt: string
}

/** Structured ticket patch extracted from Supabase Realtime UPDATE payload. */
export type SSETicketPatch = {
  id: string
  isResolved?: boolean
  needsAdminReply?: boolean
  userHasUnread?: boolean
}

type FeedbackStreamEvent =
  | { type: "connected" }
  | { type: "resumed" }
  | { type: "feedback"; ticketPatch?: SSETicketPatch | null }
  | {
      type: "message"
      author?: string
      feedbackId?: string
      messageData?: SSEMessageData | null
    }
  | {
      type: "typing"
      ticketId: string
      role: "user" | "admin"
      at: number
    }
  | { type: "offline" }

function parseAuthor(raw: unknown): "user" | "admin" | "assist" {
  if (raw === "admin") return "admin"
  if (raw === "assist") return "assist"
  return "user"
}

/**
 * Admin Live Support SSE. Keeps the stream open across backgrounding when the
 * browser allows it; on tab return / focus, reconnects if stale and emits
 * `resumed` so callers can catch up via REST.
 */
export function useAdminFeedbackStream(
  onEvent: (event: FeedbackStreamEvent) => void
) {
  const callbackRef = useRef(onEvent)

  useEffect(() => {
    callbackRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    let source: EventSource | null = null
    let retryTimer: number | null = null
    let resumeTimer: number | null = null
    let disposed = false
    let attempt = 0

    function clearRetry() {
      if (retryTimer != null) {
        window.clearTimeout(retryTimer)
        retryTimer = null
      }
    }

    function connect() {
      if (disposed) return
      clearRetry()
      source?.close()
      source = new EventSource("/api/admin/feedback/stream", {
        withCredentials: true,
      })

      source.addEventListener("connected", () => {
        attempt = 0
        callbackRef.current({ type: "connected" })
      })

      source.addEventListener("feedback", (event) => {
        let ticketPatch: SSETicketPatch | null = null
        try {
          const payload = JSON.parse(event.data) as {
            new?: {
              id?: string
              is_resolved?: boolean
              needs_admin_reply?: boolean
              user_has_unread?: boolean
            }
          }
          const row = payload.new
          if (row?.id) {
            ticketPatch = {
              id: row.id,
              ...(typeof row.is_resolved === "boolean"
                ? { isResolved: row.is_resolved }
                : {}),
              ...(typeof row.needs_admin_reply === "boolean"
                ? { needsAdminReply: row.needs_admin_reply }
                : {}),
              ...(typeof row.user_has_unread === "boolean"
                ? { userHasUnread: row.user_has_unread }
                : {}),
            }
          }
        } catch {
          ticketPatch = null
        }
        callbackRef.current({ type: "feedback", ticketPatch })
      })

      source.addEventListener("message", (event) => {
        let author: string | undefined
        let feedbackId: string | undefined
        let messageData: SSEMessageData | null = null
        try {
          const payload = JSON.parse(event.data) as {
            new?: {
              id?: string
              author?: string
              feedback_id?: string
              body?: string
              image_url?: string | null
              created_at?: string
            }
          }
          const row = payload.new
          author = row?.author
          feedbackId = row?.feedback_id
          if (row?.id && row.feedback_id && typeof row.body === "string") {
            messageData = {
              id: row.id,
              author: parseAuthor(row.author),
              body: row.body,
              imageUrl: row.image_url ?? null,
              createdAt: row.created_at ?? new Date().toISOString(),
            }
          }
        } catch {
          author = undefined
          feedbackId = undefined
          messageData = null
        }
        callbackRef.current({ type: "message", author, feedbackId, messageData })
      })

      source.addEventListener("typing", (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            ticketId?: string
            role?: string
            at?: number
          }
          if (!payload.ticketId || payload.role !== "user") return
          callbackRef.current({
            type: "typing",
            ticketId: payload.ticketId,
            role: "user",
            at: typeof payload.at === "number" ? payload.at : Date.now(),
          })
        } catch {
          /* ignore */
        }
      })

      // Rely on the server "connected" event only — onopen + connected was a double fire.

      source.onerror = () => {
        source?.close()
        source = null
        callbackRef.current({ type: "offline" })
        if (disposed) return
        attempt += 1
        const delay = Math.min(8_000, 900 * 2 ** Math.min(attempt, 4))
        retryTimer = window.setTimeout(connect, delay)
      }
    }

    function ensureConnected() {
      if (disposed) return
      if (!source || source.readyState === EventSource.CLOSED) {
        connect()
      }
    }

    /** Debounced catch-up after tab return / window focus. */
    function scheduleResume() {
      if (disposed) return
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return
      }
      if (resumeTimer != null) return
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null
        if (disposed) return
        ensureConnected()
        callbackRef.current({ type: "resumed" })
      }, 50)
    }

    connect()

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        scheduleResume()
      }
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("focus", scheduleResume)

    return () => {
      disposed = true
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("focus", scheduleResume)
      clearRetry()
      if (resumeTimer != null) window.clearTimeout(resumeTimer)
      source?.close()
    }
  }, [])
}
