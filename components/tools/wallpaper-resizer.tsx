"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  actionPrimary,
  ChooseImageButton,
  ImageDropTarget,
  loadImageFile,
  loadImageUrl,
  SAMPLE_IMAGE,
  segmentedClass,
} from "@/components/tools/tool-controls"
import { displayResolutionLabel, macDisplays } from "@/lib/seo/mac-displays"
import { cn } from "@/lib/utils"

type Mode = "fill" | "fit"
type Format = "jpeg" | "png"

/** Where the crop sits, 0..1 on each axis (0.5 = centred). */
type Focus = { x: number; y: number }

function draw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  mode: Mode,
  focus: Focus
) {
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingQuality = "high"
  const scale =
    mode === "fill"
      ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
      : Math.min(width / img.naturalWidth, height / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  const x = (width - w) * (mode === "fill" ? focus.x : 0.5)
  const y = (height - h) * (mode === "fill" ? focus.y : 0.5)
  ctx.drawImage(img, x, y, w, h)
}

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Crops an image to a Mac's native resolution on a canvas, in the browser.
 * The preview and the download use the same drawing, at preview size and at
 * full size.
 */
export function WallpaperResizer() {
  const current = macDisplays.filter((d) => d.current)
  const [displayId, setDisplayId] = useState(current[0].id)
  const [mode, setMode] = useState<Mode>("fill")
  const [format, setFormat] = useState<Format>("jpeg")
  const [focus, setFocus] = useState<Focus>({ x: 0.5, y: 0.5 })
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageName, setImageName] = useState(SAMPLE_IMAGE.name)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number; focus: Focus } | null>(null)

  const display = macDisplays.find((d) => d.id === displayId) ?? current[0]

  useEffect(() => {
    loadImageUrl(SAMPLE_IMAGE.src)
      .then(setImage)
      .catch((e: Error) => setError(e.message))
  }, [])

  const render = useCallback(() => {
    const el = canvas.current
    if (!el || !image) return
    const cssWidth = el.clientWidth
    const cssHeight = (cssWidth * display.height) / display.width
    const dpr = window.devicePixelRatio || 1
    el.width = Math.round(cssWidth * dpr)
    el.height = Math.round(cssHeight * dpr)
    el.style.height = `${cssHeight}px`
    const ctx = el.getContext("2d")
    if (ctx) draw(ctx, image, el.width, el.height, mode, focus)
  }, [image, display, mode, focus])

  useEffect(() => {
    render()
    window.addEventListener("resize", render)
    return () => window.removeEventListener("resize", render)
  }, [render])

  const handleFile = async (file: File) => {
    setError(null)
    try {
      const img = await loadImageFile(file)
      setImage(img)
      setImageName(file.name)
      setFocus({ x: 0.5, y: 0.5 })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const download = () => {
    if (!image) return
    setBusy(true)
    const out = document.createElement("canvas")
    out.width = display.width
    out.height = display.height
    const ctx = out.getContext("2d")
    if (!ctx) return setBusy(false)
    draw(ctx, image, out.width, out.height, mode, focus)
    out.toBlob(
      (blob) => {
        setBusy(false)
        if (!blob) return setError("Your browser couldn't create the file.")
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `wallpaper-${display.id}-${display.width}x${display.height}.${format === "jpeg" ? "jpg" : "png"}`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 2000)
      },
      format === "jpeg" ? "image/jpeg" : "image/png",
      0.92
    )
  }

  // How much the image is enlarged to cover the screen; above 1 looks softer.
  const upscale = image
    ? (mode === "fill" ? Math.max : Math.min)(
        display.width / image.naturalWidth,
        display.height / image.naturalHeight
      )
    : 1

  return (
    <section
      aria-label="Wallpaper resizer"
      className="flex flex-col gap-5 rounded-[28px] bg-white/[0.035] p-4 ring-1 ring-white/[0.08] ring-inset sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="resizer-mac" className="text-[13px] text-white/45">
          Mac
        </label>
        <select
          id="resizer-mac"
          value={displayId}
          onChange={(event) => setDisplayId(event.target.value)}
          className="h-11 rounded-[14px] bg-white/[0.06] px-3 text-[15px] text-white ring-1 ring-white/[0.08] outline-none ring-inset focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {macDisplays.map((d) => (
            <option key={d.id} value={d.id} className="bg-neutral-900">
              {d.name}, {displayResolutionLabel(d)}
            </option>
          ))}
        </select>
      </div>

      <ImageDropTarget onFile={handleFile}>
        <canvas
          ref={canvas}
          role="img"
          aria-label={`Preview of ${imageName} cropped to ${displayResolutionLabel(display)}`}
          tabIndex={mode === "fill" ? 0 : -1}
          className={cn(
            "block w-full rounded-[20px] bg-black ring-1 ring-white/[0.08] outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            mode === "fill" && "cursor-grab touch-none active:cursor-grabbing"
          )}
          onPointerDown={(event) => {
            if (mode !== "fill") return
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = { x: event.clientX, y: event.clientY, focus }
          }}
          onPointerMove={(event) => {
            const start = drag.current
            const el = canvas.current
            if (!start || !el || !image) return
            // Dragging right shows more of the left side, like moving a photo.
            const scale = Math.max(
              display.width / image.naturalWidth,
              display.height / image.naturalHeight
            )
            const ratio = el.clientWidth / display.width
            const spareX = (image.naturalWidth * scale - display.width) * ratio
            const spareY =
              (image.naturalHeight * scale - display.height) * ratio
            setFocus({
              x:
                spareX > 0
                  ? clamp(start.focus.x - (event.clientX - start.x) / spareX)
                  : 0.5,
              y:
                spareY > 0
                  ? clamp(start.focus.y - (event.clientY - start.y) / spareY)
                  : 0.5,
            })
          }}
          onPointerUp={() => (drag.current = null)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0.1 : 0.02
            const moves: Record<string, Focus> = {
              ArrowLeft: { x: focus.x - step, y: focus.y },
              ArrowRight: { x: focus.x + step, y: focus.y },
              ArrowUp: { x: focus.x, y: focus.y - step },
              ArrowDown: { x: focus.x, y: focus.y + step },
            }
            const next = moves[event.key]
            if (!next) return
            event.preventDefault()
            setFocus({ x: clamp(next.x), y: clamp(next.y) })
          }}
        />
      </ImageDropTarget>

      <p className="text-[13px] leading-5 text-white/45">
        {imageName}
        {image ? ` · ${image.naturalWidth} × ${image.naturalHeight}` : ""}
        {mode === "fill"
          ? " · Drag the preview, or use the arrow keys, to frame it."
          : ""}
      </p>

      {upscale > 1.05 ? (
        <p className="rounded-[14px] bg-white/[0.05] px-4 py-3 text-[14px] leading-6 text-white/75">
          This image is smaller than the screen, so it&apos;s enlarged{" "}
          {upscale.toFixed(1)}× and will look softer. For a sharp wallpaper, use
          an image at least {displayResolutionLabel(display)}.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-[14px] text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Framing" className="flex gap-1.5">
          <button
            type="button"
            className={segmentedClass(mode === "fill")}
            aria-pressed={mode === "fill"}
            onClick={() => setMode("fill")}
          >
            Fill
          </button>
          <button
            type="button"
            className={segmentedClass(mode === "fit")}
            aria-pressed={mode === "fit"}
            onClick={() => setMode("fit")}
          >
            Fit
          </button>
        </div>
        <div role="group" aria-label="File format" className="flex gap-1.5">
          <button
            type="button"
            className={segmentedClass(format === "jpeg")}
            aria-pressed={format === "jpeg"}
            onClick={() => setFormat("jpeg")}
          >
            JPEG
          </button>
          <button
            type="button"
            className={segmentedClass(format === "png")}
            aria-pressed={format === "png"}
            onClick={() => setFormat("png")}
          >
            PNG
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={actionPrimary}
          onClick={download}
          disabled={!image || busy}
        >
          {busy ? "Saving…" : `Download ${display.width} × ${display.height}`}
        </button>
        <ChooseImageButton onFile={handleFile} />
      </div>
    </section>
  )
}
