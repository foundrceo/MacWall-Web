"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  socialProofMessage,
  type SocialProofMessage,
} from "@/lib/social-proof/feed"

const PURCHASE_COMPLETE_KEY = "macwall_purchase_complete"
/** Set when the toast shows, so it appears at most once per session. */
const SHOWN_KEY = "macwall_social_proof_shown"

/** Post-purchase and account surfaces don't need a nudge. */
const HIDDEN_PATH_PREFIXES = [
  "/activate",
  "/thank-you",
  "/admin",
  "/auth",
  "/open",
]

/** Below Tailwind's `sm`: phones never get the toast. */
const PHONE_QUERY = "(max-width: 639px)"

const FIRST_DELAY_RANGE: readonly [number, number] = [10_000, 20_000]
/** How long the toast stays after the user has actually seen it. */
const VISIBLE_MS = 5_000
/** Retry while the tab is hidden or a bottom banner holds the spot. */
const BLOCKED_RETRY_MS = 8_000

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

function writeSessionFlag(key: string): void {
  try {
    window.sessionStorage.setItem(key, "1")
  } catch {
    // Storage blocked: the toast still shows only once on this page.
  }
}

function isPhone(): boolean {
  if (typeof document === "undefined") return true
  if (document.documentElement.dataset.platform === "mobile") return true
  try {
    return window.matchMedia(PHONE_QUERY).matches
  } catch {
    return true
  }
}

function isPurchaseBannerOpen(): boolean {
  if (typeof document === "undefined") return false
  const { dataset } = document.documentElement
  // The gallery "Download free" bar uses the same bottom spot.
  return (
    dataset.macwallPurchaseBannerOpen === "true" ||
    dataset.macwallDownloadBarOpen === "true"
  )
}

/**
 * One downloads-only toast (`macwallSocialProof.downloadsLine`), once per
 * session, desktop only. Mounted only while `FLAGS.socialProof` is on.
 */
export function SocialProofPopups() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  const [current, setCurrent] = useState<SocialProofMessage | null>(null)
  // Skip if a purchase completed or the toast already showed this session.
  const [skipped, setSkipped] = useState(
    () => readSessionFlag(PURCHASE_COMPLETE_KEY) || readSessionFlag(SHOWN_KEY)
  )
  const [purchaseBannerOpen, setPurchaseBannerOpen] =
    useState(isPurchaseBannerOpen)
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document === "undefined" ? true : !document.hidden
  )

  /** Also guards "once" when sessionStorage is blocked. */
  const shownRef = useRef(false)
  /** Active dismiss timer: cleared when the toast is replaced or hidden. */
  const dismissTimerRef = useRef<number | null>(null)

  const pathHidden = HIDDEN_PATH_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  )

  // Yield to the wallpaper purchase banner while it is open.
  useEffect(() => {
    const sync = () => setPurchaseBannerOpen(isPurchaseBannerOpen())
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-macwall-purchase-banner-open",
        "data-macwall-download-bar-open",
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

  // If checkout completes mid-session, stop showing the nudge.
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

  // Show the toast once, a little after landing, then never again.
  useEffect(() => {
    if (!enabled || shownRef.current || isPhone()) return

    let cancelled = false
    let timer = 0

    const step = () => {
      if (cancelled) return
      if (isPhone() || readSessionFlag(SHOWN_KEY)) return
      if (document.hidden || isPurchaseBannerOpen()) {
        timer = window.setTimeout(step, BLOCKED_RETRY_MS)
        return
      }
      shownRef.current = true
      writeSessionFlag(SHOWN_KEY)
      setCurrent(socialProofMessage())
    }

    timer = window.setTimeout(step, randomBetween(FIRST_DELAY_RANGE))

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [enabled])

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

    if (!pageVisible || !current) return

    const key = current.key
    dismissTimerRef.current = window.setTimeout(() => {
      dismissTimerRef.current = null
      setCurrent((prev) => (prev?.key === key ? null : prev))
    }, VISIBLE_MS)

    return clearDismissTimer
  }, [pageVisible, current, clearDismissTimer])

  const onOpenPricing = useCallback(() => {
    trackSiteEventClient("cta_click", { source: "social_proof_popup" })
    setCurrent(null)
  }, [])

  const visible = !pathHidden && !purchaseBannerOpen && current !== null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-5 bottom-5 z-[70] flex items-end"
    >
      <AnimatePresence initial={false} mode="wait">
        {visible && current ? (
          <motion.div
            key={current.key}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.94 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }
            }
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative max-w-[min(22rem,calc(100vw-2.5rem))] rounded-[1.75rem] bg-white shadow-[0_14px_44px_rgba(0,0,0,0.32)]"
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
              <span className="min-w-0 font-sans text-[13px] leading-snug font-medium tracking-tight text-black">
                {current.text}
              </span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
