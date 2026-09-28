"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { GALLERY_PRIMARY_CTA_CLASS } from "@/lib/public-catalog/chrome"
import {
  macwallInstallerLatestPath,
  macwallWallpaperDeepLink,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * How long to wait for the OS to switch to MacWall before concluding the
 * app isn't installed. Only then do we show the inline download hint —
 * never auto-navigate or auto-download.
 */
const APP_OPEN_WAIT_MS = 2000

export function WallpaperSetOnMacButton({
  wallpaperId,
  wallpaperName,
  className,
}: Readonly<{
  wallpaperId: string
  wallpaperName: string
  className?: string
}>) {
  const [showInstallHint, setShowInstallHint] = useState(false)
  const waitTimerRef = useRef<number | null>(null)
  const settledRef = useRef(false)

  const clearWaitTimer = useCallback(() => {
    if (waitTimerRef.current != null) {
      window.clearTimeout(waitTimerRef.current)
      waitTimerRef.current = null
    }
  }, [])

  useEffect(() => clearWaitTimer, [clearWaitTimer])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Stay on this page — fire the scheme from a hidden iframe so a
      // missing app never navigates away or triggers a download.
      event.preventDefault()
      setShowInstallHint(false)
      settledRef.current = false
      clearWaitTimer()

      trackSiteEventClient("download_click", {
        location: "wallpaper_detail_set_on_mac",
        wallpaper_id: wallpaperId,
      })

      const deepLink = macwallWallpaperDeepLink(wallpaperId)

      const settleOpened = () => {
        if (settledRef.current) return
        settledRef.current = true
        clearWaitTimer()
        document.removeEventListener("visibilitychange", onVisibilityChange)
        window.removeEventListener("blur", onWindowBlur)
      }

      const onVisibilityChange = () => {
        // OS switched to MacWall — it opened, nothing more to do.
        if (document.visibilityState === "hidden") settleOpened()
      }

      const onWindowBlur = () => settleOpened()

      document.addEventListener("visibilitychange", onVisibilityChange)
      window.addEventListener("blur", onWindowBlur)

      // Hidden iframe: hands the link to the OS without top-level navigation.
      const frame = document.createElement("iframe")
      frame.setAttribute("aria-hidden", "true")
      frame.setAttribute("tabindex", "-1")
      frame.style.cssText =
        "position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none;"
      frame.src = deepLink
      document.body.appendChild(frame)
      window.setTimeout(() => frame.remove(), 5000)

      // Still here after the wait → app didn't open. Show an inline hint
      // with a manual download link instead of redirecting anywhere.
      waitTimerRef.current = window.setTimeout(() => {
        document.removeEventListener("visibilitychange", onVisibilityChange)
        window.removeEventListener("blur", onWindowBlur)
        if (!settledRef.current && document.visibilityState === "visible") {
          settledRef.current = true
          setShowInstallHint(true)
        }
      }, APP_OPEN_WAIT_MS)
    },
    [wallpaperId, clearWaitTimer]
  )

  return (
    <span className={cn("relative inline-flex flex-col", className)}>
      <a
        href={macwallWallpaperDeepLink(wallpaperId)}
        title={`Open “${wallpaperName}” in MacWall`}
        className={GALLERY_PRIMARY_CTA_CLASS}
        onClick={handleClick}
      >
        Set on Mac
      </a>
      {showInstallHint ? (
        <span
          role="status"
          className="absolute top-full z-30 mt-2 w-64 rounded-2xl border border-white/10 bg-[#141414] p-3.5 text-left shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        >
          <span className="block text-[13px] font-medium text-white">
            MacWall didn&rsquo;t open?
          </span>
          <span className="mt-1 block text-[13px] leading-snug text-white/65">
            Install the app first, then click Set on Mac again.
          </span>
          <span className="mt-2.5 flex gap-2">
            <a
              href={macwallInstallerLatestPath}
              className="inline-flex h-8 items-center rounded-full bg-white px-3.5 text-[13px] font-medium text-black transition-opacity hover:opacity-90"
            >
              Download
            </a>
            <button
              type="button"
              onClick={() => setShowInstallHint(false)}
              className="inline-flex h-8 items-center rounded-full px-3 text-[13px] text-white/65 transition hover:text-white"
            >
              Dismiss
            </button>
          </span>
        </span>
      ) : null}
    </span>
  )
}
