"use client"

import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { SendToMacButton } from "@/components/macwall-marketing/send-to-mac-dialog"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { macwallInstallerLatestPath } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const DISMISS_KEY = "macwall_gallery_bar_dismissed"
/** Read by the social-proof toasts so they never stack on top of this bar. */
const BAR_OPEN_ATTR = "macwallDownloadBarOpen"

function AppleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

const PILL =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-black no-underline transition hover:bg-white/90"

/** Download on Macs, "Send to my Mac" on phones; CSS picks one before paint. */
function PlatformCta({ location, className }: Readonly<{ location: string; className?: string }>) {
  return (
    <>
      <span className="mw-when-desktop">
        <TrackedDownloadButton
          href={macwallInstallerLatestPath}
          location={location}
          className={cn(PILL, className)}
        >
          <AppleIcon />
          Download free for Mac
        </TrackedDownloadButton>
      </span>
      <span className="mw-when-mobile">
        <SendToMacButton location={location} className={cn(PILL, className)} />
      </span>
    </>
  )
}

/**
 * Gallery, category and collection pages had ~25k views a fortnight and
 * almost no download button. This puts one under the title, and a slim bar
 * at the bottom once that one scrolls out of view.
 */
export function GalleryDownloadCta({ location }: Readonly<{ location: string }>) {
  const pricing = useMarketingPricing()
  const inlineRef = useRef<HTMLDivElement>(null)
  const [inlineVisible, setInlineVisible] = useState(true)
  const [dismissed, setDismissed] = useState(true)
  const [purchaseBannerOpen, setPurchaseBannerOpen] = useState(false)

  useEffect(() => {
    let wasDismissed = false
    try {
      wasDismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1"
    } catch {
      // Storage blocked: show the bar.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(wasDismissed)

    const el = inlineRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      // Only once the user has scrolled past it, not before it comes into view.
      setInlineVisible(entry.isIntersecting || entry.boundingClientRect.top > 0)
    })
    io.observe(el)

    // The wallpaper purchase banner uses the same bottom spot; it wins.
    const root = document.documentElement
    const sync = () =>
      setPurchaseBannerOpen(root.dataset.macwallPurchaseBannerOpen === "true")
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(root, { attributes: true, attributeFilter: ["data-macwall-purchase-banner-open"] })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  const barOpen = !inlineVisible && !dismissed && !purchaseBannerOpen

  useEffect(() => {
    const root = document.documentElement
    if (barOpen) root.dataset[BAR_OPEN_ATTR] = "true"
    else delete root.dataset[BAR_OPEN_ATTR]
    return () => {
      delete root.dataset[BAR_OPEN_ATTR]
    }
  }, [barOpen])

  const caption = (
    <>
      Free for 24 hours, then{" "}
      <span className="text-white">{pricing.permanentPrice}</span> once.
    </>
  )

  return (
    <>
      <div ref={inlineRef} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <PlatformCta location={location} />
        <span className="text-[13px] text-white/55">{caption}</span>
      </div>

      <div
        inert={!barOpen}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[75] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition duration-300 sm:pb-5",
          barOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <div className="flex w-full max-w-xl items-center gap-3 rounded-full bg-[#1a1a1a]/95 py-2 pr-2 pl-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur">
          <p className="min-w-0 flex-1 truncate text-[13px] text-white/70">
            <span className="text-white sm:hidden">Love these?</span>
            <span className="text-white max-sm:hidden">Like these on your Mac?</span>{" "}
            <span className="max-sm:hidden">Free for 24 hours.</span>
          </p>
          <PlatformCta location={`${location}_sticky`} className="h-9 px-4 text-[13px]" />
          <button
            type="button"
            onClick={() => {
              trackSiteEventClient("cta_click", { location: `${location}_sticky`, action: "dismiss" })
              setDismissed(true)
              try {
                window.sessionStorage.setItem(DISMISS_KEY, "1")
              } catch {
                // Storage blocked: dismissed for this page only.
              }
            }}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Hide"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}
