"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { useState } from "react"

import { SendToMacForm } from "@/components/macwall-marketing/send-to-mac-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

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
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackSiteEventClient("cta_click", { location, action: "send_to_mac_open" })
          setOpen(true)
        }}
        className={className}
        aria-haspopup="dialog"
      >
        <AppleIcon />
        Send to my Mac
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(calc(100%-2rem),380px)] max-w-[min(calc(100%-2rem),380px)] gap-0 rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0 sm:max-w-[min(calc(100%-2rem),380px)]"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} />
          </button>

          <div className="flex flex-col items-center px-5 pt-7 pb-5 text-center sm:px-6">
            <Image
              src={macwallAppIconPath}
              alt=""
              width={56}
              height={56}
              className={cn("size-14", macwallAppIconRadiusClass)}
            />
            <DialogTitle className="font-display mt-3 text-2xl leading-tight font-normal tracking-tight text-foreground">
              Send {macwall.name} to your Mac
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-snug text-marketing-muted">
              We&rsquo;ll email you the download link. Open it on your Mac to
              install. Free for 24 hours.
            </DialogDescription>

            <SendToMacForm
              location={location}
              shareUrl={shareUrl}
              wallpaperName={wallpaperName}
              wallpaperPath={wallpaperPath}
              className="mt-5"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
