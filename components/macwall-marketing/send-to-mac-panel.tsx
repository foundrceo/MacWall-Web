"use client"

import Image from "next/image"
import { X } from "lucide-react"

import { SendToMacForm } from "@/components/macwall-marketing/send-to-mac-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * The "Send to my Mac" pop-up: email the download link, or share it. Loaded on
 * demand by `SendToMacButton` (send-to-mac-dialog.tsx), so Radix Dialog and
 * the form stay out of the first page load.
 */
export function SendToMacPanel({
  open,
  onOpenChange,
  location,
  shareUrl,
  wallpaperName,
  wallpaperPath,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  location: string
  shareUrl?: string
  wallpaperName?: string
  wallpaperPath?: string
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(calc(100%-2rem),380px)] max-w-[min(calc(100%-2rem),380px)] gap-0 rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0 sm:max-w-[min(calc(100%-2rem),380px)]"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
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
          <DialogTitle className="mt-3 font-display text-2xl leading-tight font-normal tracking-tight text-foreground">
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
  )
}
