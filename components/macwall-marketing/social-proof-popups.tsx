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

  const [current, setCurrent] = useState<SocialProofMessage | null>(null)
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
  /** Active dismiss timer — cleared when the toast is replaced or hidden. */
  const dismissTimerRef = useRef<number | null>(null)

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

  // Only dismiss timers run when the tab is visible.
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
        setCurrent(null)
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

  // Show one popup at a time — replace any existing toast instead of stacking.
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

      const next = nextMessage()
      if (next) {
        shownKeysRef.current.add(next.key)
        setCurrent(next)
      }

      schedule(randomBetween(GAP_RANGE))
    }

    schedule(randomBetween(FIRST_DELAY_RANGE))

    return () => {
      cancelled = true
      window.clearTimeout(scheduleTimer)
    }
  }, [enabled, nextMessage])

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }, [])

  // Wipe timer on unmount so nothing fires after the widget is gone.
  useEffect(() => clearDismissTimer, [clearDismissTimer])

  // Dismiss only after the user has actually seen the toast (tab visible).
  useEffect(() => {
    clearDismissTimer()

    if (!enabled || chatOpen || !pageVisible || !current) {
      return
    }

    const key = current.key
    dismissTimerRef.current = window.setTimeout(() => {
      dismissTimerRef.current = null
      setCurrent((prev) => (prev?.key === key ? null : prev))
    }, VISIBLE_MS)

    return clearDismissTimer
  }, [enabled, chatOpen, pageVisible, current, clearDismissTimer])

  const onOpenPricing = useCallback(() => {
    trackSiteEventClient("cta_click", { source: "social_proof_popup" })
    setCurrent(null)
  }, [])

  const visible =
    enabled && !chatOpen && !purchaseBannerOpen && current !== null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.35rem)] z-[70] flex items-end sm:right-5 sm:bottom-[5.6rem]"
    >
      <AnimatePresence initial={false} mode="wait">
        {visible && current ? (
          <motion.div
            key={current.key}
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
                  {current.text} <span aria-hidden>{current.emoji}</span>
                </span>
                {current.meta ? (
                  <span className="font-sans text-[11px] leading-snug font-normal text-black/45">
                    {current.meta}
                  </span>
                ) : null}
              </span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
