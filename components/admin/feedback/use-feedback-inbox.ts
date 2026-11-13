"use client"

/**
 * Inbox data for Live support: the ticket list, the live stream that patches
 * it in place, visitor typing, selection and resolve/reopen.
 */

import { useCallback, useEffect, useRef, useState } from "react"

import { playAdminNotificationSound } from "@/lib/admin/notification-sound"
import { useAdminFeedbackStream } from "@/lib/admin/use-admin-feedback-stream"

import type { FeedbackItem, InboxError, Totals, VisitorTyping } from "./types"

const VISITOR_TYPING_TTL_MS = 2500

export type FeedbackStreamEvent = Parameters<
  Parameters<typeof useAdminFeedbackStream>[0]
>[0]

/**
 * Holds the SSE connection. Rendered with a `key` so "Reconnect" can drop the
 * current stream and open a new one without waiting for the retry backoff.
 */
export function FeedbackStream({
  onEvent,
}: Readonly<{ onEvent: (event: FeedbackStreamEvent) => void }>) {
  useAdminFeedbackStream(onEvent)
  return null
}

export function useFeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<InboxError | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  /** When the stream last dropped; null while it is up or still connecting. */
  const [offlineSince, setOfflineSince] = useState<number | null>(null)
  const [streamEpoch, setStreamEpoch] = useState(0)
  const [visitorTypingUntil, setVisitorTypingUntil] = useState<VisitorTyping>(
    {}
  )

  const visitorTypingTimersRef = useRef<Map<string, number>>(new Map())
  const loadSeqRef = useRef(0)
  /** Non-silent loads in flight, and whether a refresh was asked for meanwhile. */
  const foregroundLoadsRef = useRef(0)
  const catchUpRef = useRef(false)
  /** Set by the composer while a reply is in flight. */
  const sendingRef = useRef(false)

  const selected = items.find((item) => item.id === selectedId) ?? null
  // Entries are removed by their TTL timer, so presence in the map means "typing now".
  const selectedVisitorTyping = Boolean(
    selectedId && selectedId in visitorTypingUntil
  )

  /* data */

  const load = useCallback(async (silent = false) => {
    // Don't wipe an in-flight optimistic reply (esp. image uploads).
    if (silent && sendingRef.current) return
    // A background refresh must not overtake the first load: that load owns
    // the skeleton and the error state. Run the refresh right after it.
    if (silent && foregroundLoadsRef.current > 0) {
      catchUpRef.current = true
      return
    }

    const seq = ++loadSeqRef.current
    if (silent) setRefreshing(true)
    else {
      foregroundLoadsRef.current += 1
      setLoading(true)
    }
    // A background refresh only clears an error once it has fresh data, so a
    // failed load never turns into an inbox that merely looks empty.
    if (!silent) setError(null)
    try {
      // Always load the full inbox so search + tab filters work client-side
      const res = await fetch(`/api/admin/feedback?filter=all`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as {
        feedback?: FeedbackItem[]
        totals?: Totals
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Failed to load feedback")
      if (seq !== loadSeqRef.current) return
      if (sendingRef.current) return
      setItems(json.feedback ?? [])
      setTotals(json.totals ?? null)
      if (silent) setError(null)
    } catch (err) {
      if (seq !== loadSeqRef.current) return
      if (!silent) {
        setError({
          message:
            err instanceof Error ? err.message : "Failed to load feedback",
          retry: true,
        })
        setItems([])
      }
    } finally {
      if (!silent) foregroundLoadsRef.current -= 1
      if (seq !== loadSeqRef.current) return
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  // Stream events that arrived during the first load get their refresh now.
  useEffect(() => {
    if (loading || !catchUpRef.current) return
    catchUpRef.current = false
    queueMicrotask(() => {
      void load(true)
    })
  }, [loading, load])

  /* visitor typing */

  const clearVisitorTyping = useCallback((ticketId: string) => {
    const existing = visitorTypingTimersRef.current.get(ticketId)
    if (existing) {
      window.clearTimeout(existing)
      visitorTypingTimersRef.current.delete(ticketId)
    }
    setVisitorTypingUntil((prev) => {
      if (!(ticketId in prev)) return prev
      const next = { ...prev }
      delete next[ticketId]
      return next
    })
  }, [])

  const pulseVisitorTyping = useCallback((ticketId: string) => {
    const until = Date.now() + VISITOR_TYPING_TTL_MS
    setVisitorTypingUntil((prev) => ({ ...prev, [ticketId]: until }))
    const existing = visitorTypingTimersRef.current.get(ticketId)
    if (existing) window.clearTimeout(existing)
    const timer = window.setTimeout(() => {
      visitorTypingTimersRef.current.delete(ticketId)
      setVisitorTypingUntil((prev) => {
        if (!(ticketId in prev)) return prev
        const next = { ...prev }
        delete next[ticketId]
        return next
      })
    }, VISITOR_TYPING_TTL_MS)
    visitorTypingTimersRef.current.set(ticketId, timer)
  }, [])

  useEffect(() => {
    const timers = visitorTypingTimersRef.current
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer)
      timers.clear()
    }
  }, [])

  /* live stream */

  function markLive() {
    setLive(true)
    setOfflineSince(null)
  }

  function onStreamEvent(event: FeedbackStreamEvent) {
    if (event.type === "connected") {
      markLive()
      return
    }
    if (event.type === "offline") {
      setLive(false)
      setOfflineSince((since) => since ?? Date.now())
      return
    }
    // Catch up on anything missed while the tab was in the background.
    if (event.type === "resumed") {
      void load(true)
      return
    }
    if (event.type === "typing") {
      markLive()
      pulseVisitorTyping(event.ticketId)
      return
    }
    markLive()

    // Append the message in place instead of reloading everything.
    if (event.type === "message") {
      if (event.feedbackId) clearVisitorTyping(event.feedbackId)
      if (event.author === "user") {
        playAdminNotificationSound()
      }
      if (event.feedbackId && event.messageData) {
        const msg = event.messageData
        setItems((current) => {
          const ticketIndex = current.findIndex(
            (row) => row.id === event.feedbackId
          )
          // Ticket not loaded yet: full reload.
          if (ticketIndex === -1) {
            void load(true)
            return current
          }
          const ticket = current[ticketIndex]
          // Skip if we already have this exact message (SSE replay / duplicate).
          if (ticket.messages.some((m) => m.id === msg.id)) return current

          // Deduplicate optimistic admin messages: if the SSE message is from
          // admin, drop the matching optimistic placeholder (same author, sent
          // within the last few seconds).
          let cleaned = ticket.messages
          if (msg.author === "admin") {
            cleaned = cleaned.filter((m) => !m.id.startsWith("optimistic-"))
          }

          const newTicket: FeedbackItem = {
            ...ticket,
            messages: [...cleaned, msg],
            // Update reply flags based on who sent the message.
            ...(msg.author === "user" && !ticket.isResolved
              ? { needsAdminReply: true }
              : {}),
            ...(msg.author === "admin" ? { needsAdminReply: false } : {}),
          }

          const next = [...current]
          next[ticketIndex] = newTicket
          return next
        })
      } else {
        // Unparseable message event: full reload.
        void load(true)
      }
      return
    }

    // Patch ticket metadata (resolve / reopen / flags) in place.
    if (event.type === "feedback") {
      if (event.ticketPatch?.id) {
        const patch = event.ticketPatch
        setItems((current) => {
          const ticketIndex = current.findIndex((row) => row.id === patch.id)
          if (ticketIndex === -1) {
            // New ticket: full reload to pick it up.
            void load(true)
            return current
          }
          const ticket = current[ticketIndex]
          const newTicket: FeedbackItem = {
            ...ticket,
            ...(typeof patch.isResolved === "boolean"
              ? { isResolved: patch.isResolved }
              : {}),
            ...(typeof patch.needsAdminReply === "boolean"
              ? { needsAdminReply: patch.needsAdminReply }
              : {}),
            ...(typeof patch.userHasUnread === "boolean"
              ? { userHasUnread: patch.userHasUnread }
              : {}),
          }
          const next = [...current]
          next[ticketIndex] = newTicket
          return next
        })
      } else {
        // Unparseable feedback event: full reload.
        void load(true)
      }
      return
    }
  }

  /** Open a fresh stream now and catch up over REST. */
  const reconnect = useCallback(() => {
    setStreamEpoch((epoch) => epoch + 1)
    void load(true)
  }, [load])

  // Fallback poll only while SSE is down, never alongside a live stream.
  useEffect(() => {
    if (live) return
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return
      void load(true)
    }, 45_000)
    return () => window.clearInterval(id)
  }, [live, load])

  /* selection */

  // A ticket that left the inbox can't stay selected. The composer and the
  // thread reset themselves whenever the selection changes.
  useEffect(() => {
    if (selectedId && !items.some((item) => item.id === selectedId)) {
      queueMicrotask(() => {
        setSelectedId((current) => (current === selectedId ? null : current))
      })
    }
  }, [items, selectedId])

  /* actions */

  async function toggleResolved(item: FeedbackItem) {
    if (pendingId === item.id) return
    const nextResolved = !item.isResolved
    const snapshot = {
      isResolved: item.isResolved,
      needsAdminReply: item.needsAdminReply,
    }
    // On reopen, if last message is from user, surface Reply again
    const lastAuthor = item.messages.at(-1)?.author
    const nextNeedsReply = nextResolved
      ? false
      : lastAuthor === "user"
        ? true
        : item.needsAdminReply

    setPendingId(item.id)
    setItems((current) =>
      current.map((row) =>
        row.id === item.id
          ? {
              ...row,
              isResolved: nextResolved,
              needsAdminReply: nextNeedsReply,
            }
          : row
      )
    )

    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: item.id, isResolved: nextResolved }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? "Update failed")
      }
      // The SSE `feedback` event applies the real state.
    } catch (err) {
      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? {
                ...row,
                isResolved: snapshot.isResolved,
                needsAdminReply: snapshot.needsAdminReply,
              }
            : row
        )
      )
      setError({
        message: err instanceof Error ? err.message : "Update failed",
        retry: false,
      })
    } finally {
      setPendingId(null)
    }
  }

  return {
    items,
    setItems,
    totals,
    loading,
    refreshing,
    error,
    dismissError: () => setError(null),
    live,
    offlineSince,
    streamEpoch,
    onStreamEvent,
    reconnect,
    visitorTypingUntil,
    selectedVisitorTyping,
    selectedId,
    setSelectedId,
    selected,
    pendingId,
    sendingRef,
    load,
    toggleResolved,
  }
}

export type FeedbackInbox = ReturnType<typeof useFeedbackInbox>
