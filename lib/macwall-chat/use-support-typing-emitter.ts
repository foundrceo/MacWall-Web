"use client"

import { useCallback, useEffect, useRef } from "react"

/** Wider throttle — typing pings were burning auth RPCs at ~2.5/s. */
const THROTTLE_MS = 1_200
const IDLE_CLEAR_MS = 2_500

type EmitArgs = {
  ticketId: string | null
  enabled: boolean
  /** POST body builder — return null to skip. */
  buildBody: () => Record<string, unknown> | null
  endpointFor: (ticketId: string) => string
}

/**
 * Throttled typing emitter. Call `signalTyping()` on composer changes.
 * Stops after ~2s idle. Does not persist anything.
 */
export function useSupportTypingEmitter({
  ticketId,
  enabled,
  buildBody,
  endpointFor,
}: EmitArgs) {
  const lastSentRef = useRef(0)
  const idleTimerRef = useRef<number | null>(null)
  const pendingRef = useRef(false)
  const buildBodyRef = useRef(buildBody)
  const endpointForRef = useRef(endpointFor)

  useEffect(() => {
    buildBodyRef.current = buildBody
    endpointForRef.current = endpointFor
  }, [buildBody, endpointFor])

  const flush = useCallback(async () => {
    const id = ticketId
    if (!enabled || !id) return
    const body = buildBodyRef.current()
    if (!body) return
    lastSentRef.current = Date.now()
    pendingRef.current = false
    try {
      await fetch(endpointForRef.current(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      })
    } catch {
      /* ignore */
    }
  }, [enabled, ticketId])

  const signalTyping = useCallback(() => {
    if (!enabled || !ticketId) return

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current)
    }
    idleTimerRef.current = window.setTimeout(() => {
      pendingRef.current = false
    }, IDLE_CLEAR_MS)

    const elapsed = Date.now() - lastSentRef.current
    if (elapsed >= THROTTLE_MS) {
      void flush()
      return
    }
    if (pendingRef.current) return
    pendingRef.current = true
    window.setTimeout(() => {
      if (pendingRef.current) void flush()
    }, THROTTLE_MS - elapsed)
  }, [enabled, ticketId, flush])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    }
  }, [])

  return { signalTyping }
}
