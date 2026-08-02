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
        if (!disposed) {
          retryTimer = window.setTimeout(connect, 4000)
        }
      }
    }

    connect()

    return () => {
      disposed = true
      if (retryTimer) window.clearTimeout(retryTimer)
      source?.close()
    }
  }, [])
}
