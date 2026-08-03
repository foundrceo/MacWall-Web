"use client"

import { useEffect, useRef } from "react"

type FeedbackStreamEvent =
  | { type: "connected" }
  | { type: "resumed" }
  | { type: "feedback" }
  | { type: "message"; author?: string; feedbackId?: string }
  | {
      type: "typing"
      ticketId: string
      role: "user" | "admin"
      at: number
    }
  | { type: "offline" }

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

      source.addEventListener("feedback", () => {
        callbackRef.current({ type: "feedback" })
      })

      source.addEventListener("message", (event) => {
        let author: string | undefined
        let feedbackId: string | undefined
        try {
          const payload = JSON.parse(event.data) as {
            new?: { author?: string; feedback_id?: string }
          }
          author = payload.new?.author
          feedbackId = payload.new?.feedback_id
        } catch {
          author = undefined
          feedbackId = undefined
        }
        callbackRef.current({ type: "message", author, feedbackId })
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

      // Rely on the server “connected” event only — onopen + connected was a double fire.

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
