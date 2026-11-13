"use client"

/**
 * Keeps the transcript pinned to the latest message while the admin is at the
 * bottom, and flags new content instead of jumping when they have scrolled up.
 */

import { useReducedMotion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

/** Stick to latest when within this distance of the transcript bottom. */
const NEAR_BOTTOM_PX = 100

export function useThreadScroll({
  selectedId,
  messageCount,
  visitorTyping,
}: Readonly<{
  selectedId: string | null
  messageCount: number
  visitorTyping: boolean
}>) {
  const reduceMotion = useReducedMotion()
  const [atBottom, setAtBottom] = useState(true)
  const [hasUnseenBelow, setHasUnseenBelow] = useState(false)
  const atBottomRef = useRef(true)
  const endRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  /** Treat the thread as following the latest message again. */
  const pinToBottom = useCallback(() => {
    atBottomRef.current = true
    setAtBottom(true)
    setHasUnseenBelow(false)
  }, [])

  const scrollThreadToBottom = useCallback(
    (behavior?: ScrollBehavior) => {
      endRef.current?.scrollIntoView({
        behavior: behavior ?? (reduceMotion ? "auto" : "smooth"),
        block: "end",
      })
      atBottomRef.current = true
      setAtBottom(true)
      setHasUnseenBelow(false)
    },
    [reduceMotion]
  )

  // Another ticket: start at its latest message.
  useEffect(() => {
    queueMicrotask(() => {
      atBottomRef.current = true
      setAtBottom(true)
      setHasUnseenBelow(false)
      scrollThreadToBottom("auto")
    })
  }, [selectedId, scrollThreadToBottom])

  useEffect(() => {
    if (atBottomRef.current) {
      scrollThreadToBottom()
      return
    }
    // New content while scrolled up: flag it after layout, not mid-render.
    const id = window.requestAnimationFrame(() => setHasUnseenBelow(true))
    return () => window.cancelAnimationFrame(id)
  }, [messageCount, visitorTyping, scrollThreadToBottom])

  const onThreadScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const near =
      el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX
    atBottomRef.current = near
    setAtBottom(near)
    if (near) setHasUnseenBelow(false)
  }, [])

  return {
    endRef,
    scrollRef,
    atBottom,
    hasUnseenBelow,
    pinToBottom,
    scrollThreadToBottom,
    onThreadScroll,
  }
}

export type ThreadScroll = ReturnType<typeof useThreadScroll>
