"use client"

import { useEffect, useRef } from "react"

type FeedbackStreamEvent =
  | { type: "connected" }
  | { type: "feedback" }
  | { type: "message"; author?: string }
  | { type: "offline" }

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
    let disposed = false

    function connect() {
      if (disposed) return
      source?.close()
      source = new EventSource("/api/admin/feedback/stream", {
        withCredentials: true,
      })

      source.addEventListener("connected", () => {
        callbackRef.current({ type: "connected" })
      })

      source.addEventListener("feedback", () => {
        callbackRef.current({ type: "feedback" })
      })

      source.addEventListener("message", (event) => {
        let author: string | undefined
        try {
          const payload = JSON.parse(event.data) as {
            new?: { author?: string }
          }
          author = payload.new?.author
        } catch {
          author = undefined
        }
        callbackRef.current({ type: "message", author })
      })

      source.onopen = () => {
        callbackRef.current({ type: "connected" })
      }

      source.onerror = () => {
        source?.close()
        source = null
        callbackRef.current({ type: "offline" })
        if (!disposed && !document.hidden) {
          retryTimer = window.setTimeout(connect, 4000)
        }
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
      callbackRef.current({ type: "offline" })
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
    }
  }, [])
}
