"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  trackSiteEventClient,
  withAnalyticsSessionHref,
} from "@/lib/analytics/client"
import { SendToMacButton } from "@/components/macwall-marketing/send-to-mac-dialog"
import {
  cannotOpenInstaller,
  installerPlatformFromUserAgent,
} from "@/lib/installer-platform"
import { hasDownloadedInstaller } from "@/lib/installer-seen"
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

/**
 * - `send`: phones and Windows can't run MacWall, so share this page to a Mac.
 * - `download`: a Mac that never downloaded MacWall here; most wallpaper-page
 *   visitors come from search and don't have the app yet.
 * - `open`: the app is probably installed; open the wallpaper in it.
 */
type Mode = "open" | "download" | "send"

function detectMode(): Mode {
  const platform = installerPlatformFromUserAgent(navigator.userAgent)
  // The platform script also tags iPads, which report a Mac user agent.
  const isMobile = document.documentElement.dataset.platform === "mobile"
  if (isMobile || cannotOpenInstaller(platform)) return "send"
  return hasDownloadedInstaller() ? "open" : "download"
}

export function WallpaperSetOnMacButton({
  wallpaperId,
  wallpaperName,
  className,
}: Readonly<{
  wallpaperId: string
  wallpaperName: string
  className?: string
}>) {
  const [mode, setMode] = useState<Mode>("open")
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

  useEffect(() => {
    // Client-only: the server can't know the visitor's device.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(detectMode())
  }, [])


  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Open the scheme ourselves, inside the click: browsers only launch an
      // app from a top-level navigation with a user gesture (a hidden iframe
      // is ignored by Safari and blocked by Chrome). A custom scheme never
      // unloads the page, and a missing app never downloads anything.
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

      window.location.href = deepLink

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

  if (mode === "send") {
    return (
      <SendToMacButton
        location="wallpaper_detail_send_to_mac"
        shareUrl={window.location.href}
        wallpaperName={wallpaperName}
        wallpaperPath={window.location.pathname}
        className={cn(GALLERY_PRIMARY_CTA_CLASS, className)}
      />
    )
  }

  if (mode === "download") {
    return (
      <span className={cn("inline-flex items-center gap-3", className)}>
        <a
          href={macwallInstallerLatestPath}
          className={GALLERY_PRIMARY_CTA_CLASS}
          onClick={(event) => {
            event.currentTarget.href = withAnalyticsSessionHref(
              macwallInstallerLatestPath
            )
            trackSiteEventClient("download_click", {
              location: "wallpaper_detail_download",
              wallpaper_id: wallpaperId,
            })
          }}
        >
          Download free
        </a>
        <a
          href={macwallWallpaperDeepLink(wallpaperId)}
          title={`Open “${wallpaperName}” in MacWall`}
          className="text-[13px] text-white/60 underline-offset-4 transition hover:text-white hover:underline"
          onClick={handleClick}
        >
          Have MacWall? Open it
        </a>
      </span>
    )
  }

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
