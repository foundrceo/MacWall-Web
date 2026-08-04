"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  EMPTY_SOCIAL_PROOF_FEED,
  buildSocialProofQueue,
  socialProofFallbackMessages,
  type SocialProofFeed,
  type SocialProofMessage,
} from "@/lib/social-proof/feed"

const PURCHASE_COMPLETE_KEY = "macwall_purchase_complete"

/** Post-purchase and account surfaces don't need a "go Pro" nudge. */
const HIDDEN_PATH_PREFIXES = [
  "/activate",
  "/thank-you",
  "/admin",
  "/auth",
  "/open",
]

/** Wait after landing, then keep 2–3 popups per minute. */
const FIRST_DELAY_RANGE: readonly [number, number] = [10_000, 20_000]
/** ~20–30s between starts → 2–3 / minute. */
const GAP_RANGE: readonly [number, number] = [20_000, 30_000]
/** How long a toast stays after the user has actually seen it. */
const VISIBLE_MS = 4_500
/** Cascade older stacked toasts out after the newest has been seen. */
const STACK_DISMISS_STAGGER_MS = 700
/** Cap unread/background stack so we don't bury the UI. */
const MAX_STACK = 4
const HIDDEN_RETRY_MS = 8_000
/** Client refresh is intentionally slower than CDN TTL — CDN absorbs most hits. */
const REFRESH_MS = 300_000

function randomBetween([min, max]: readonly [number, number]): number {
  return min + Math.random() * (max - min)
}

function readSessionFlag(key: string): boolean {
  try {
    return Boolean(window.sessionStorage.getItem(key))
  } catch {
    return false
  }
}

function isChatOpen(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.dataset.macwallChatOpen === "true"
}

function isPurchaseBannerOpen(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.dataset.macwallPurchaseBannerOpen === "true"
}

export function SocialProofPopups() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  const [stack, setStack] = useState<SocialProofMessage[]>([])
  // Skip nudges for people who already completed purchase this session.
  const [skipped, setSkipped] = useState(() =>
    readSessionFlag(PURCHASE_COMPLETE_KEY)
  )
  const [chatOpen, setChatOpen] = useState(isChatOpen)
  const [purchaseBannerOpen, setPurchaseBannerOpen] = useState(
    isPurchaseBannerOpen
  )
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document === "undefined" ? true : !document.hidden
  )

  const feedRef = useRef<SocialProofFeed>(EMPTY_SOCIAL_PROOF_FEED)
  const shownKeysRef = useRef<Set<string>>(new Set())
  const fallbackIndexRef = useRef(0)
  const queueIndexRef = useRef(0)
  /** Active dismiss timers — keyed so stack updates don't reset unseen toasts. */
  const dismissTimersRef = useRef<Map<string, number>>(new Map())

  const pathHidden = HIDDEN_PATH_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  )

  // Yield to chat + wallpaper purchase banner while either is open.
  useEffect(() => {
    const sync = () => {
      setChatOpen(isChatOpen())
      setPurchaseBannerOpen(isPurchaseBannerOpen())
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-macwall-chat-open",
        "data-macwall-purchase-banner-open",
      ],
    })
    return () => observer.disconnect()
  }, [])

  // Stack while backgrounded; only dismiss timers run when the tab is visible.
  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden)
    sync()
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [])

  // If checkout completes mid-session, stop showing purchase nudges.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === PURCHASE_COMPLETE_KEY && event.newValue) {
        setSkipped(true)
        setStack([])
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const enabled = !skipped && !pathHidden

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/social-proof", {
          headers: { Accept: "application/json" },
        })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as SocialProofFeed
        if (!cancelled && Array.isArray(data?.purchases)) {
          feedRef.current = data
        }
      } catch {
        // Synthetic marketing still works from empty feed floors.
      }
    }

    void load()
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return
      void load()
    }, REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [enabled])

  const nextMessage = useCallback((): SocialProofMessage | null => {
    const feed = feedRef.current
    const queue = buildSocialProofQueue(feed, Date.now())

    // Walk the synthetic pool before falling back to the rotating set.
    while (queueIndexRef.current < queue.length) {
      const item = queue[queueIndexRef.current]
      queueIndexRef.current += 1
      if (item && !shownKeysRef.current.has(item.key)) {
        return item
      }
    }

    const fallback = socialProofFallbackMessages(feed)
    if (fallback.length === 0) return null

    const picked = fallback[fallbackIndexRef.current % fallback.length]
    fallbackIndexRef.current += 1
    if (!picked) return null

    // Re-key so the same line can animate again later in the session.
    return {
      ...picked,
      key: `${picked.key}:n${fallbackIndexRef.current}`,
    }
  }, [])

  // Keep enqueueing even in the background so unread toasts stack up to MAX_STACK.
  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let scheduleTimer = 0

    const schedule = (delayMs: number) => {
      scheduleTimer = window.setTimeout(step, delayMs)
    }

    const step = () => {
      if (cancelled) return

      if (isChatOpen() || isPurchaseBannerOpen()) {
        schedule(HIDDEN_RETRY_MS)
        return
      }

      setStack((prev) => {
        if (prev.length >= MAX_STACK) return prev
        const next = nextMessage()
        if (!next) return prev
        shownKeysRef.current.add(next.key)
        return [...prev, next].slice(-MAX_STACK)
      })

      schedule(randomBetween(GAP_RANGE))
    }

    schedule(randomBetween(FIRST_DELAY_RANGE))

    return () => {
      cancelled = true
      window.clearTimeout(scheduleTimer)
    }
  }, [enabled, nextMessage])

  const clearDismissTimers = useCallback(() => {
    for (const timer of dismissTimersRef.current.values()) {
      window.clearTimeout(timer)
    }
    dismissTimersRef.current.clear()
  }, [])

  // Wipe timers on unmount so nothing fires after the widget is gone.
  useEffect(() => clearDismissTimers, [clearDismissTimers])

  // Dismiss only after the user has actually seen the stack (tab visible).
  // Background tabs keep the stack; timers pause until they come back.
  useEffect(() => {
    if (!enabled || chatOpen || !pageVisible) {
      clearDismissTimers()
      return
    }

    let newIndex = 0
    for (const message of stack) {
      if (dismissTimersRef.current.has(message.key)) continue
      const delay = VISIBLE_MS + newIndex * STACK_DISMISS_STAGGER_MS
      newIndex += 1
      const timer = window.setTimeout(() => {
        dismissTimersRef.current.delete(message.key)
        setStack((prev) => prev.filter((item) => item.key !== message.key))
      }, delay)
      dismissTimersRef.current.set(message.key, timer)
    }

    for (const key of [...dismissTimersRef.current.keys()]) {
      if (stack.some((item) => item.key === key)) continue
      const timer = dismissTimersRef.current.get(key)
      if (timer) window.clearTimeout(timer)
      dismissTimersRef.current.delete(key)
    }
  }, [enabled, chatOpen, pageVisible, stack, clearDismissTimers])

  const onOpenPricing = useCallback(() => {
    trackSiteEventClient("cta_click", { source: "social_proof_popup" })
    setStack([])
  }, [])

  const visible =
    enabled && !chatOpen && !purchaseBannerOpen && stack.length > 0

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.35rem)] z-[70] flex flex-col-reverse items-end gap-2 sm:right-5 sm:bottom-[5.6rem]"
    >
      <AnimatePresence initial={false}>
        {visible
          ? stack.map((message, index) => (
              <motion.div
                key={message.key}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 14, scale: 0.94 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.96 }
                }
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ zIndex: index + 1 }}
                className="pointer-events-auto relative max-w-[min(22rem,calc(100vw-1.5rem))] rounded-[1.75rem] bg-white shadow-[0_14px_44px_rgba(0,0,0,0.32)]"
              >
                <Link
                  href="/pricing"
                  onClick={onOpenPricing}
                  className="flex items-center gap-2.5 rounded-full py-2.5 pr-3.5 pl-2.5 outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                >
                  <MacWallAppIcon
                    size={32}
                    className="shrink-0"
                    alt=""
                    aria-hidden
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-sans text-[13px] leading-snug font-medium tracking-tight text-black">
                      {message.text} <span aria-hidden>{message.emoji}</span>
                    </span>
                    {message.meta ? (
                      <span className="font-sans text-[11px] leading-snug font-normal text-black/45">
                        {message.meta}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </motion.div>
            ))
          : null}
      </AnimatePresence>
    </div>
  )
}
