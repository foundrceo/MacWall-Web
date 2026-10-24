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
 * How long to wait for MacWall to take focus before concluding it isn't
 * installed. Only then do we show the inline download hint — never
 * auto-navigate or auto-download. 2 s was too short: a cold launch, or the
 * browser's own "Open MacWall?" prompt waiting for a click, often takes
 * longer, so the hint flashed even though the app opened.
 */
const APP_OPEN_WAIT_MS = 3500

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
  /** Stops listening for MacWall taking focus (set while a click waits). */
  const stopListeningRef = useRef<(() => void) | null>(null)

  const clearWaitTimer = useCallback(() => {
    if (waitTimerRef.current != null) {
      window.clearTimeout(waitTimerRef.current)
      waitTimerRef.current = null
    }
  }, [])

  useEffect(
    () => () => {
      clearWaitTimer()
      stopListeningRef.current?.()
    },
    [clearWaitTimer]
  )

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
      stopListeningRef.current?.()

      trackSiteEventClient("download_click", {
        location: "wallpaper_detail_set_on_mac",
        wallpaper_id: wallpaperId,
      })

      const deepLink = macwallWallpaperDeepLink(wallpaperId)

      // MacWall taking focus from this page (blur / hidden) means it opened.
      // That can come after the hint is up (a slow cold launch), so it also
      // takes the hint away again.
      const stopListening = () => {
        document.removeEventListener("visibilitychange", onVisibilityChange)
        window.removeEventListener("blur", settleOpened)
        stopListeningRef.current = null
      }

      function settleOpened() {
        settledRef.current = true
        clearWaitTimer()
        setShowInstallHint(false)
        stopListening()
      }

      function onVisibilityChange() {
        if (document.visibilityState === "hidden") settleOpened()
      }

      document.addEventListener("visibilitychange", onVisibilityChange)
      window.addEventListener("blur", settleOpened)
      stopListeningRef.current = stopListening

      window.location.href = deepLink

      // Still here, visible and focused after the wait → the app didn't open.
      // Show an inline hint with a manual download link instead of
      // redirecting anywhere; keep listening in case it opens late.
      waitTimerRef.current = window.setTimeout(() => {
        waitTimerRef.current = null
        if (settledRef.current) return
        if (document.visibilityState === "visible" && document.hasFocus()) {
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
