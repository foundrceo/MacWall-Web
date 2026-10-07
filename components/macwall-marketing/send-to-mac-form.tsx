"use client"

import { useState } from "react"

import {
  getAnalyticsSessionId,
  trackSiteEventClient,
} from "@/lib/analytics/client"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type Status = "idle" | "sending" | "sent" | "error"

/**
 * Phones and Windows can't install MacWall. Email the download link so the
 * visitor can open it on their Mac later (plus one reminder the next day).
 * Sharing the link stays as a fallback.
 */
export function SendToMacForm({
  location,
  shareUrl,
  wallpaperName,
  wallpaperPath,
  className,
}: Readonly<{
  location: string
  /** What the share fallback sends (the download page by default). */
  shareUrl?: string
  wallpaperName?: string
  wallpaperPath?: string
  className?: string
}>) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [copied, setCopied] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    trackSiteEventClient("cta_click", { location, action: "email_link" })
    try {
      const res = await fetch("/api/send-to-mac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          wallpaperName,
          wallpaperPath,
          sessionId: getAnalyticsSessionId(),
        }),
      })
      setStatus(res.ok ? "sent" : "error")
    } catch {
      setStatus("error")
    }
  }

  const onShare = async () => {
    trackSiteEventClient("cta_click", { location, action: "send_link" })
    const url = shareUrl ?? `${macwall.website}/download`
    const shareData: ShareData = {
      title: `${macwall.name} — ${macwall.tagline}`,
      text: `Get ${macwall.name} for your Mac`,
      url,
    }
    try {
      if (
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare(shareData))
      ) {
        await navigator.share(shareData)
        return
      }
      throw new Error("share-unavailable")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      } catch {
        // Clipboard blocked: nothing else to do inline.
      }
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className={cn(
          "w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-center",
          className
        )}
      >
        <p className="text-[15px] font-medium text-foreground">
          Sent. Open it on your Mac.
        </p>
        <p className="mt-1 text-[13px] text-marketing-muted">
          Check {email} for the download link.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={(event) => void onSubmit(event)} className="flex w-full flex-col gap-2">
        <label htmlFor={`send-to-mac-${location}`} className="sr-only">
          Your email
        </label>
        <input
          id={`send-to-mac-${location}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="Your email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status === "error") setStatus("idle")
          }}
          className="h-12 w-full rounded-full bg-white/10 px-5 text-[16px] text-foreground placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[15px] font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-70"
        >
          {status === "sending" ? "Sending…" : "Email me the link for my Mac"}
        </button>
      </form>
      {status === "error" ? (
        <p role="alert" className="mt-2 text-center text-[13px] text-red-300">
          Couldn&rsquo;t send it. Check the address or try again.
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void onShare()}
        className="mt-2 w-full text-center text-[13px] text-marketing-muted underline-offset-4 hover:text-foreground hover:underline"
        aria-live="polite"
      >
        {copied ? "Link copied. Open it on your Mac" : "Or share the link instead"}
      </button>
    </div>
  )
}
