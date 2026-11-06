"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { trackSiteEventAfterPaint } from "@/lib/analytics/client"
import { cn } from "@/lib/utils"

const loadSendToMacPanel = () =>
  import("@/components/macwall-marketing/send-to-mac-panel").then(
    (m) => m.SendToMacPanel
  )

const SendToMacPanel = dynamic(loadSendToMacPanel, { ssr: false })

/** Warm the pop-up's chunk so the first tap doesn't wait on the network. */
export function preloadSendToMacDialog() {
  loadSendToMacPanel().catch(() => {
    // Offline or a stale deploy: the tap retries the import.
  })
}

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

/**
 * A single "Send to my Mac" button for phones and Windows. The email field
 * lives in a pop-up so the page stays clean until someone wants it.
 *
 * The tap only flips state: the pop-up's code (send-to-mac-panel.tsx) loads
 * when the browser is idle while this button is on screen, or on hover,
 * focus or pointerdown at the latest, and the click is tracked after the
 * next paint. Once opened it stays mounted so the close animation plays.
 */
export function SendToMacButton({
  location,
  className,
  shareUrl,
  wallpaperName,
  wallpaperPath,
}: Readonly<{
  location: string
  className?: string
  shareUrl?: string
  wallpaperName?: string
  wallpaperPath?: string
}>) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    const button = buttonRef.current
    // The hidden half of a CSS platform switch (mw-when-*) has no boxes.
    if (!button || button.getClientRects().length === 0) return
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preloadSendToMacDialog, {
        timeout: 5000,
      })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(preloadSendToMacDialog, 2500)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={preloadSendToMacDialog}
        onPointerEnter={preloadSendToMacDialog}
        onFocus={preloadSendToMacDialog}
        onClick={() => {
          setHasOpened(true)
          setOpen(true)
          trackSiteEventAfterPaint("cta_click", {
            location,
            action: "send_to_mac_open",
          })
        }}
        className={className}
        aria-haspopup="dialog"
      >
        <AppleIcon />
        Send to my Mac
      </button>

      {hasOpened ? (
        <SendToMacPanel
          open={open}
          onOpenChange={setOpen}
          location={location}
          shareUrl={shareUrl}
          wallpaperName={wallpaperName}
          wallpaperPath={wallpaperPath}
        />
      ) : null}
    </>
  )
}
