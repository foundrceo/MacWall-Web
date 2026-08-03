"use client"

import { useEffect, useRef } from "react"

export type SupportStreamMessage = {
  id: string
  author: "user" | "admin"
  body: string
  createdAt: string
  feedbackId: string
  imageUrl?: string | null
}

export type SupportStreamTicketUpdate = {
  isResolved?: boolean
}

export type SupportStreamTyping = {
  ticketId: string
  role: "user" | "admin"
  at: number
}

type Handlers = {
  onMessage?: (message: SupportStreamMessage) => void
  onTicketUpdate?: (update: SupportStreamTicketUpdate) => void
  onTyping?: (typing: SupportStreamTyping) => void
  onConnectionChange?: (state: "connecting" | "live" | "offline") => void
}

/**
 * Real-time ticket stream via SSE + Supabase postgres_changes (+ typing broadcast).
 * Auto-reconnects; callers should keep a slow poll as safety net.
 */
export function useSupportTicketStream(
  ticketId: string | null,
  sessionId: string | null,
  enabled: boolean,
  handlers: Handlers
) {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    if (!enabled || !ticketId || !sessionId) return

    let source: EventSource | null = null
    let retryTimer: number | null = null
    let disposed = false
    let attempt = 0

    const setState = (state: "connecting" | "live" | "offline") => {
      handlersRef.current.onConnectionChange?.(state)
    }

    function connect() {
      if (disposed) return
      source?.close()
      setState("connecting")

      const url = `/api/support/tickets/${encodeURIComponent(ticketId!)}/stream?sessionId=${encodeURIComponent(sessionId!)}`
      source = new EventSource(url)

      source.addEventListener("ready", () => {
        attempt = 0
        setState("live")
      })

      source.addEventListener("connected", () => {
        setState("connecting")
      })

      source.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            new?: {
              id?: string
              author?: string
              body?: string
              created_at?: string
              feedback_id?: string
              image_url?: string | null
            }
          }
          const row = payload.new
          if (!row?.id || (!row.body && !row.image_url)) return
          handlersRef.current.onMessage?.({
            id: row.id,
            author: row.author === "admin" ? "admin" : "user",
            body: row.body ?? "",
            createdAt: row.created_at ?? new Date().toISOString(),
            feedbackId: row.feedback_id ?? ticketId!,
            imageUrl: row.image_url ?? null,
          })
        } catch {
          /* ignore malformed */
        }
      })

      source.addEventListener("ticket", (event) => {
        let isResolved: boolean | undefined
        try {
          const payload = JSON.parse(event.data) as {
            new?: { is_resolved?: boolean | string | number | null }
            record?: { is_resolved?: boolean | string | number | null }
          }
          const raw = payload.new?.is_resolved ?? payload.record?.is_resolved
          if (typeof raw === "boolean") {
            isResolved = raw
          } else if (raw === "true" || raw === 1) {
            isResolved = true
          } else if (raw === "false" || raw === 0) {
            isResolved = false
          }
        } catch {
          isResolved = undefined
        }
        handlersRef.current.onTicketUpdate?.({ isResolved })
      })

      source.addEventListener("typing", (event) => {
        try {
          const payload = JSON.parse(event.data) as SupportStreamTyping
          if (!payload?.ticketId || payload.role !== "admin") return
          handlersRef.current.onTyping?.(payload)
        } catch {
          /* ignore */
        }
      })

      source.onerror = () => {
        source?.close()
        source = null
        setState("offline")
        if (disposed) return
        attempt += 1
        const delay = Math.min(8_000, 900 * 2 ** Math.min(attempt, 4))
        retryTimer = window.setTimeout(connect, delay)
      }
    }

    connect()

    const onVisible = () => {
      if (disposed) return
      if (document.visibilityState === "visible") {
        if (!source || source.readyState === EventSource.CLOSED) {
          connect()
        }
        return
      }
      // Close SSE while backgrounded — Fluid Compute bills for open streams.
      source?.close()
      source = null
      setState("offline")
      if (retryTimer) {
        window.clearTimeout(retryTimer)
        retryTimer = null
      }
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      disposed = true
      document.removeEventListener("visibilitychange", onVisible)
      if (retryTimer) window.clearTimeout(retryTimer)
      source?.close()
      setState("offline")
    }
  }, [enabled, ticketId, sessionId])
}
