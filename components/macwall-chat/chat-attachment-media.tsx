"use client"

/**
 * Apple Messages–style chat attachment: hero media with hairline edge,
 * aspect-fit, shimmer while loading, graceful failure, and a dark lightbox.
 */

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type Tone = "dark" | "light"

type ChatAttachmentMediaProps = {
  src: string
  alt?: string
  /** Visual context for hairline + shimmer. Chat widget = dark; admin transcript = light. */
  tone?: Tone
  className?: string
  /** Max width in px — keeps media from dominating the panel. */
  maxWidth?: number
}

function PhotoGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.4" />
      <path d="M3.5 16.5 9 12l3.5 3.5L16 12.5l4.5 4" />
    </svg>
  )
}

export function ChatAttachmentMedia({
  src,
  alt = "Photo attachment",
  tone = "dark",
  className,
  maxWidth = 248,
}: ChatAttachmentMediaProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setStatus("loading")
  }, [src])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [lightboxOpen, closeLightbox])

  const hairline =
    tone === "dark" ? "ring-1 ring-inset ring-white/14" : "ring-1 ring-inset ring-black/10"

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (status !== "error") setLightboxOpen(true)
        }}
        disabled={status === "error"}
        aria-label={status === "error" ? "Image failed to load" : "View photo"}
        className={cn(
          "group relative block overflow-hidden rounded-[17px] text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
          status !== "error" && "cursor-zoom-in",
          hairline,
          className
        )}
        style={{ maxWidth }}
      >
        {status === "loading" ? (
          <div
            className={cn(
              "animate-pulse rounded-[17px]",
              tone === "dark" ? "bg-white/[0.07]" : "bg-black/[0.06]"
            )}
            style={{ aspectRatio: "3 / 2", width: maxWidth }}
            aria-hidden
          />
        ) : null}

        {status === "error" ? (
          <div
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-[17px]",
              tone === "dark" ? "bg-white/[0.05] text-white/40" : "bg-black/[0.04] text-black/40"
            )}
            style={{ aspectRatio: "3 / 2", width: maxWidth }}
          >
            <PhotoGlyph className="size-6 opacity-70" />
            <span className="text-[11px] font-medium tracking-wide">
              Couldn&apos;t load image
            </span>
          </div>
        ) : null}

        {/* Keep img mounted so onLoad/onError fire; hide until ready. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
          className={cn(
            "block h-auto max-h-[300px] w-auto max-w-full object-contain",
            status === "ready" ? "opacity-100" : "pointer-events-none absolute h-px w-px opacity-0"
          )}
          style={{ maxWidth }}
        />
      </button>

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/88 p-4 backdrop-blur-[2px]"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close preview"
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-xl leading-none text-white/80 transition hover:bg-white/16 hover:text-white"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[min(88vh,860px)] max-w-[min(92vw,920px)] rounded-2xl object-contain shadow-[0_24px_64px_rgba(0,0,0,0.45)] ring-1 ring-white/12"
          />
        </div>
      ) : null}
    </>
  )
}
