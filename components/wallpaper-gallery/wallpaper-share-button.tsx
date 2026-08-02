"use client"

import { useState } from "react"
import { CheckIcon, Share01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { GALLERY_CAPSULE_BTN_CLASS } from "@/lib/public-catalog/chrome"
import { cn } from "@/lib/utils"

const CTA_CLASS = cn(
  GALLERY_CAPSULE_BTN_CLASS,
  "h-10 min-w-[7.5rem] px-5 text-white/80 hover:text-white"
)

export function WallpaperShareButton({
  url,
  title,
  className,
}: Readonly<{
  url: string
  title: string
  className?: string
}>) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const reduceMotion = useReducedMotion()

  const onShare = async () => {
    if (busy) return
    setBusy(true)

    const absoluteUrl = (() => {
      try {
        return new URL(url, window.location.origin).toString()
      } catch {
        return url
      }
    })()

    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      const shareData: ShareData = { url: absoluteUrl }
      try {
        if (
          typeof navigator !== "undefined" &&
          typeof navigator.share === "function" &&
          (!navigator.canShare || navigator.canShare(shareData))
        ) {
          await navigator.share(shareData)
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={busy}
      onClick={() => void onShare()}
      className={cn(CTA_CLASS, className)}
      aria-label={copied ? "Link copied to clipboard" : `Share ${title}`}
      aria-live="polite"
    >
      <motion.span
        key={copied ? "copied" : "share"}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2"
      >
        <HugeiconsIcon
          icon={copied ? CheckIcon : Share01Icon}
          size={14}
          strokeWidth={1.75}
          aria-hidden
        />
        {copied ? "Copied" : "Share"}
      </motion.span>
    </Button>
  )
}
