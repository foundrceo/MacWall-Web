"use client"

import { useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Shared pieces for the /tools client components. */

export const SAMPLE_IMAGE = {
  src: "/tools/sample-wallpaper.jpg",
  name: "Blue Mountain Lake Stag (sample)",
}

export const segmentedClass = (active: boolean) =>
  cn(
    "inline-flex h-9 items-center rounded-full px-4 text-[14px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none",
    active
      ? "bg-white text-black"
      : "bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink"
  )

export const actionPrimary =
  "inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-[14px] font-medium text-black transition-colors duration-150 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none disabled:opacity-50"

export const actionSecondary =
  "inline-flex h-10 items-center justify-center rounded-full bg-surface-2 px-5 text-[14px] text-ink transition-colors duration-150 hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"

/** Loads a File into an <img>, entirely in the browser. */
export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("This file couldn't be opened as an image."))
    }
    img.src = url
  })
}

export function loadImageUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("The sample image didn't load."))
    img.src = src
  })
}

/**
 * Wraps a preview so a dropped image file replaces the current one, with a
 * visible state while a file is dragged over it.
 */
export function ImageDropTarget({
  onFile,
  children,
  className,
}: Readonly<{
  onFile: (file: File) => void
  children: ReactNode
  className?: string
}>) {
  const [over, setOver] = useState(false)
  return (
    <div
      className={cn("relative", className)}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      }}
    >
      {children}
      {over ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-[20px] bg-black/60 text-[15px] text-white ring-2 ring-white/70 ring-inset">
          Drop to use this image
        </div>
      ) : null}
    </div>
  )
}

/** A button that opens the file picker for images. */
export function ChooseImageButton({
  onFile,
  label = "Choose image",
}: Readonly<{ onFile: (file: File) => void; label?: string }>) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button
        type="button"
        className={actionSecondary}
        onClick={() => input.current?.click()}
      >
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ""
        }}
      />
    </>
  )
}
