"use client"

import { useEffect, useMemo, useState } from "react"

import {
  ChooseImageButton,
  ImageDropTarget,
  loadImageFile,
  loadImageUrl,
  SAMPLE_IMAGE,
} from "@/components/tools/tool-controls"
import { colorName } from "@/lib/seo/color-name"
import { cn } from "@/lib/utils"

type Swatch = { hex: string; rgb: [number, number, number]; share: number }

const toHex = (rgb: number[]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`

/**
 * Six main colours by k-means on a 96 px wide copy, seeded from evenly spaced
 * pixels so the same image always gives the same palette. Same approach as
 * scripts/generate-wallpaper-palettes.mjs.
 */
function extract(img: HTMLImageElement, k = 6): Swatch[] {
  const width = 96
  const height = Math.max(
    1,
    Math.round((img.naturalHeight / img.naturalWidth) * width)
  )
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return []
  ctx.drawImage(img, 0, 0, width, height)
  const data = ctx.getImageData(0, 0, width, height).data
  const pixels: number[][] = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    pixels.push([data[i], data[i + 1], data[i + 2]])
  }
  if (pixels.length === 0) return []

  let centers = Array.from(
    { length: k },
    (_, i) => pixels[Math.floor(((i + 0.5) * pixels.length) / k)]
  )
  let counts = new Array(k).fill(0)
  for (let iter = 0; iter < 12; iter += 1) {
    const sums = centers.map(() => [0, 0, 0])
    counts = new Array(k).fill(0)
    for (const p of pixels) {
      let best = 0
      let bestDist = Infinity
      for (let c = 0; c < k; c += 1) {
        const q = centers[c]
        const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2
        if (d < bestDist) {
          bestDist = d
          best = c
        }
      }
      sums[best][0] += p[0]
      sums[best][1] += p[1]
      sums[best][2] += p[2]
      counts[best] += 1
    }
    centers = centers.map((c, i) =>
      counts[i] ? sums[i].map((s) => s / counts[i]) : c
    )
  }

  const seen = new Set<string>()
  return centers
    .map((c, i) => ({
      hex: toHex(c),
      rgb: c.map(Math.round) as [number, number, number],
      share: counts[i] / pixels.length,
    }))
    .filter((s) => s.share > 0)
    .sort((a, b) => b.share - a.share)
    .filter((s) => (seen.has(s.hex) ? false : (seen.add(s.hex), true)))
}

function CopyValue({ value }: Readonly<{ value: string }>) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          setCopied(false)
        }
      }}
      className="rounded-md px-1.5 py-0.5 text-left font-mono text-[13px] text-ink-2 tabular-nums transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
      aria-label={`Copy ${value}`}
    >
      {copied ? "Copied" : value}
    </button>
  )
}

/** Palette from any image, worked out in the browser. */
export function ColorPalette() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageName, setImageName] = useState(SAMPLE_IMAGE.name)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadImageUrl(SAMPLE_IMAGE.src)
      .then(setImage)
      .catch((e: Error) => setError(e.message))
  }, [])

  // Images only exist in the browser, so this never runs during server render.
  const swatches = useMemo<Swatch[]>(
    () => (image ? extract(image) : []),
    [image]
  )

  const handleFile = async (file: File) => {
    setError(null)
    try {
      setImage(await loadImageFile(file))
      setImageName(file.name)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <section
      aria-label="Colour palette extractor"
      className="flex flex-col gap-5 rounded-[28px] bg-surface-1 p-4 squircle sm:p-6"
    >
      <ImageDropTarget onFile={handleFile}>
        <div className="overflow-hidden rounded-[20px] bg-black squircle">
          {image ? (
            // A local object URL or the bundled sample; next/image can't take either.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.src}
              alt={`Image being analysed: ${imageName}`}
              width={image.naturalWidth}
              height={image.naturalHeight}
              className="block aspect-video w-full object-cover"
            />
          ) : (
            <div className="aspect-video w-full" />
          )}
          {swatches.length > 0 ? (
            <div aria-hidden className="flex h-3 w-full">
              {swatches.map((s) => (
                <span
                  key={s.hex}
                  style={{ backgroundColor: s.hex, flexGrow: s.share }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </ImageDropTarget>

      <p className="text-[13px] leading-5 text-ink-3">
        {imageName} · Drop another image on the preview to replace it.
      </p>

      {error ? (
        <p role="alert" className="text-[14px] text-red-300">
          {error}
        </p>
      ) : null}

      <ul
        aria-live="polite"
        className="rounded-[20px] bg-surface-2 px-3 squircle sm:px-4"
      >
        {swatches.map((s, i) => (
          <li
            key={s.hex}
            className={cn(
              "flex items-center gap-3 py-3",
              i > 0 && "border-t border-hairline"
            )}
          >
            <span
              aria-hidden
              className="size-9 shrink-0 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: s.hex }}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] leading-6 text-white capitalize">
                {colorName(s.hex)}
              </span>
              <span className="block text-[13px] leading-5 text-ink-3 tabular-nums">
                {Math.round(s.share * 100)}% of the image
              </span>
            </span>
            <span className="flex flex-col items-end sm:flex-row sm:items-center sm:gap-1">
              <CopyValue value={s.hex.toUpperCase()} />
              <CopyValue value={`rgb(${s.rgb.join(", ")})`} />
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <ChooseImageButton onFile={handleFile} />
      </div>
    </section>
  )
}
