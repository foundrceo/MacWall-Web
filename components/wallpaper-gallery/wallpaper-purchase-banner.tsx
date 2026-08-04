"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { prefetchCheckoutSession } from "@/lib/checkout/prefetch-checkout"
import { macwall } from "@/lib/macwall-site"

const DWELL_MS = 15_000
const PURCHASE_COMPLETE_KEY = "macwall_purchase_complete"
const VIEWS_KEY = "macwall_wp_detail_views_v1"
const THRESHOLD_KEY = "macwall_wp_view_threshold_v1"
const TICK_MS = 1_000
const MIN_VIEWS = 3
const MAX_VIEWS = 5

function isWallpaperPath(pathname: string | null): boolean {
  if (!pathname) return false
  return (
    pathname === "/wallpapers" ||
    pathname.startsWith("/wallpapers/") ||
    pathname === "/wallpaper" ||
    pathname.startsWith("/wallpaper/")
  )
}

/** Detail pages only — `/wallpaper/{category}/{slug}`. */
function isWallpaperDetailPath(pathname: string | null): boolean {
  if (!pathname) return false
  const parts = pathname.split("/").filter(Boolean)
  return parts[0] === "wallpaper" && parts.length >= 3
}

function readPurchaseComplete(): boolean {
  try {
    return Boolean(window.sessionStorage.getItem(PURCHASE_COMPLETE_KEY))
  } catch {
    return false
  }
}

function readViewPaths(): string[] {
  try {
    const raw = window.sessionStorage.getItem(VIEWS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : []
  } catch {
    return []
  }
}

function writeViewPaths(paths: string[]): void {
  try {
    window.sessionStorage.setItem(VIEWS_KEY, JSON.stringify(paths))
  } catch {
    // Ignore quota / private mode.
  }
}

function readOrCreateThreshold(): number {
  try {
    const existing = window.sessionStorage.getItem(THRESHOLD_KEY)
    if (existing) {
      const n = Number(existing)
      if (n >= MIN_VIEWS && n <= MAX_VIEWS) return n
    }
  } catch {
    // fall through
  }
  const next =
    MIN_VIEWS + Math.floor(Math.random() * (MAX_VIEWS - MIN_VIEWS + 1))
  try {
    window.sessionStorage.setItem(THRESHOLD_KEY, String(next))
  } catch {
    // Ignore.
  }
  return next
}

function resetViewCycle(): void {
  try {
    window.sessionStorage.removeItem(VIEWS_KEY)
    window.sessionStorage.removeItem(THRESHOLD_KEY)
  } catch {
    // Ignore.
  }
}

function isChatOpen(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.dataset.macwallChatOpen === "true"
}

/**
 * Wallpaper engagement banner → Stripe.
 * Shows after 15s dwell, or after 3–5 wallpaper detail visits (repeats each cycle).
 */
export function WallpaperPurchaseBanner() {
  const pathname = usePathname()
  const pricing = useMarketingPricing()
  const reduceMotion = useReducedMotion()
  const onWallpaper = isWallpaperPath(pathname)

  const [purchased, setPurchased] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [ready, setReady] = useState(false)
  const [chatOpen, setChatOpen] = useState(isChatOpen)
  const [visibleDwellMs, setVisibleDwellMs] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [viewThreshold, setViewThreshold] = useState(MIN_VIEWS)

  useEffect(() => {
    setPurchased(readPurchaseComplete())
    setViewThreshold(readOrCreateThreshold())
    setViewCount(readViewPaths().length)
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === PURCHASE_COMPLETE_KEY && event.newValue) {
        setPurchased(true)
        setHidden(true)
        setReady(false)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => setChatOpen(isChatOpen()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-macwall-chat-open"],
    })
    return () => observer.disconnect()
  }, [])

  // Count unique wallpaper detail visits; every 3–5 views can re-open the banner.
  useEffect(() => {
    if (!isWallpaperDetailPath(pathname) || purchased) return

    const paths = readViewPaths()
    if (paths.includes(pathname)) {
      setViewCount(paths.length)
      return
    }

    const next = [...paths, pathname]
    writeViewPaths(next)
    const threshold = readOrCreateThreshold()
    setViewThreshold(threshold)
    setViewCount(next.length)

    if (next.length >= threshold) {
      setHidden(false)
      setReady(true)
    }
  }, [pathname, purchased])

  // Accumulate visible dwell on wallpaper routes (pauses when tab hidden).
  useEffect(() => {
    if (!onWallpaper || purchased || ready || hidden) return

    let cancelled = false
    const tick = () => {
      if (cancelled) return
      if (document.hidden || isChatOpen()) return
      setVisibleDwellMs((prev) => prev + TICK_MS)
    }

    const id = window.setInterval(tick, TICK_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [onWallpaper, purchased, ready, hidden])

  useEffect(() => {
    if (visibleDwellMs >= DWELL_MS) {
      setHidden(false)
      setReady(true)
    }
  }, [visibleDwellMs])

  // Warm Stripe once when the banner is about to show (not every dwell tick).
  useEffect(() => {
    if (!ready || purchased) return
    void prefetchCheckoutSession("permanent")
  }, [ready, purchased])

  const open = onWallpaper && ready && !hidden && !purchased && !chatOpen

  useEffect(() => {
    if (!open) {
      delete document.documentElement.dataset.macwallPurchaseBannerOpen
      return
    }
    document.documentElement.dataset.macwallPurchaseBannerOpen = "true"
    trackSiteEventClient("cta_click", {
      source: "wallpaper_purchase_banner_shown",
      view_count: viewCount,
      view_threshold: viewThreshold,
    })
    return () => {
      delete document.documentElement.dataset.macwallPurchaseBannerOpen
    }
  }, [open, viewCount, viewThreshold])

  const dismissForNow = () => {
    setHidden(true)
    setReady(false)
    setVisibleDwellMs(0)
    // Start a fresh 3–5 wallpaper cycle so it can show again.
    resetViewCycle()
    setViewCount(0)
    setViewThreshold(readOrCreateThreshold())
  }

  const dismiss = () => {
    dismissForNow()
    trackSiteEventClient("cta_click", {
      source: "wallpaper_purchase_banner_dismiss",
    })
  }

  const onCheckoutClick = () => {
    // Hide banner for this cycle; navigation to Stripe happens in TrackedLink.
    dismissForNow()
  }

  const ctaLabel = `Buy Pro — ${pricing.permanentPrice}`
  // Must be the create-session API path — TrackedLink POSTs and opens Stripe URL.
  const checkoutHref = "/api/checkout/create-session?offer=permanent"

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-3 pb-[calc(max(0.75rem,env(safe-area-inset-bottom))+5rem)] sm:px-5 sm:pb-24"
    >
      <AnimatePresence>
        {open ? (
          <motion.aside
            role="dialog"
            aria-label="Unlock MacWall Pro"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-full max-w-[28rem] rounded-2xl border border-white/12 bg-[#141414]/95 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-4"
          >
            <div className="flex items-start gap-3">
              <MacWallAppIcon size={40} className="mt-0.5 shrink-0" alt="" />
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[15px] leading-snug font-medium tracking-tight text-white">
                  Loving these wallpapers?
                </p>
                <p className="mt-1 font-sans text-[13px] leading-snug text-white/65">
                  Unlock {macwall.name} Pro and make your Mac cooler — one-time{" "}
                  {pricing.permanentPrice}, no subscription.
                </p>
                <div className="mt-3">
                  <TrackedPricingButton
                    href={checkoutHref}
                    location="wallpaper_purchase_banner"
                    size="pill"
                    ariaLabel={`Buy ${macwall.name} Pro for ${pricing.permanentPrice}`}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[13px] font-medium text-black no-underline transition-opacity hover:opacity-90"
                    onClick={onCheckoutClick}
                  >
                    {ctaLabel}
                  </TrackedPricingButton>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
