"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/** Stealth recipe from 21st.dev community ASCII (dots + pulse). */
export const STEALTH_ASCII_PARAMS = {
  renderMode: "dots" as const,
  bgMode: "solid" as const,
  bgBlur: 12,
  bgOpacity: 100,
  cellSize: 10,
  coverage: 100,
  invert: false,
  styleBlend: "source-over" as GlobalCompositeOperation,
  brightness: 0,
  contrast: 115,
  edgeEmphasis: 0,
  density: 0,
  tint: "#ff3b1f",
  tintOpacity: 32,
  overlayBlend: "overlay" as GlobalCompositeOperation,
  saturation: 100,
  grayscale: 0,
  blurType: "off" as const,
  blurAmount: 35,
  pfx: {
    vignette: { enabled: true, intensity: 55 },
    bloom: { enabled: true, intensity: 45 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: "pulse" as const,
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
} as const

type StealthAsciiCanvasProps = Readonly<{
  src: string
  className?: string
  /** Solid fill behind the effect when bgMode is solid. */
  solidColor?: string
}>

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  const v = Number.parseInt(n, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

function applyTone(
  r: number,
  g: number,
  b: number,
  brightness: number,
  contrast: number,
  saturation: number,
  grayscale: number,
  invert: boolean
): [number, number, number] {
  let rr = r
  let gg = g
  let bb = b
  if (invert) {
    rr = 255 - rr
    gg = 255 - gg
    bb = 255 - bb
  }
  const bShift = (brightness / 100) * 255
  rr = rr + bShift
  gg = gg + bShift
  bb = bb + bShift
  const c = contrast / 100
  rr = (rr - 128) * c + 128
  gg = (gg - 128) * c + 128
  bb = (bb - 128) * c + 128
  const lum = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
  const sat = saturation / 100
  rr = lum + (rr - lum) * sat
  gg = lum + (gg - lum) * sat
  bb = lum + (bb - lum) * sat
  const gs = Math.min(1, Math.max(0, grayscale / 100))
  rr = rr * (1 - gs) + lum * gs
  gg = gg * (1 - gs) + lum * gs
  bb = bb * (1 - gs) + lum * gs
  return [
    Math.min(255, Math.max(0, rr)),
    Math.min(255, Math.max(0, gg)),
    Math.min(255, Math.max(0, bb)),
  ]
}

function overlayChannel(base: number, blend: number): number {
  const a = base / 255
  const b = blend / 255
  const out = a < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b)
  return Math.round(out * 255)
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const ir = img.naturalWidth / img.naturalHeight
  const cr = w / h
  let dw = w
  let dh = h
  let dx = 0
  let dy = 0
  if (ir > cr) {
    dh = h
    dw = h * ir
    dx = (w - dw) / 2
  } else {
    dw = w
    dh = w / ir
    dy = (h - dh) / 2
  }
  ctx.drawImage(img, dx, dy, dw, dh)
}

/**
 * Canvas2D Stealth look: sample cells → dots sized by luminance,
 * tint overlay, vignette + bloom, pulse animation.
 */
export default function StealthAsciiCanvas({
  src,
  className,
  solidColor = "#000000",
}: StealthAsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const params = STEALTH_ASCII_PARAMS
    let raf = 0
    let alive = true
    let sample: Float32Array | null = null
    let cols = 0
    let rows = 0
    let cssW = 0
    let cssH = 0
    let dpr = 1
    const tintRgb = parseHex(params.tint)

    const img = new Image()
    img.decoding = "async"
    img.src = src

    const off = document.createElement("canvas")
    const offCtx = off.getContext("2d", { willReadFrequently: true })
    if (!offCtx) return
    const bloomBuf = document.createElement("canvas")
    const bloomCtx = bloomBuf.getContext("2d")
    if (!bloomCtx) return

    const rebuildSample = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      cssW = Math.max(1, Math.floor(rect.width))
      cssH = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bloomBuf.width = canvas.width
      bloomBuf.height = canvas.height
      bloomCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cell = params.cellSize
      cols = Math.ceil(cssW / cell)
      rows = Math.ceil(cssH / cell)
      off.width = cols
      off.height = rows
      offCtx.fillStyle = solidColor
      offCtx.fillRect(0, 0, cols, rows)
      coverDraw(offCtx, img, cols, rows)
      const data = offCtx.getImageData(0, 0, cols, rows).data
      sample = new Float32Array(cols * rows * 4)
      for (let i = 0; i < cols * rows; i++) {
        const o = i * 4
        const [r, g, b] = applyTone(
          data[o]!,
          data[o + 1]!,
          data[o + 2]!,
          params.brightness,
          params.contrast,
          params.saturation,
          params.grayscale,
          params.invert
        )
        sample[o] = r
        sample[o + 1] = g
        sample[o + 2] = b
        sample[o + 3] = 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
    }

    const drawFrame = (tMs: number) => {
      if (!sample || !alive) return
      const cell = params.cellSize
      const speed =
        params.animSpeed.enabled ? params.animSpeed.intensity / 100 : 1
      const intensity =
        params.animIntensity.enabled
          ? params.animIntensity.intensity / 100
          : 0
      const phase = params.animated
        ? Math.sin((tMs / 1000) * Math.PI * 1.2 * speed) * intensity
        : 0
      const pulse = 1 + phase * 0.35
      const dens = 1 + params.density / 100

      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = solidColor
      ctx.globalAlpha = params.bgOpacity / 100
      ctx.fillRect(0, 0, cssW, cssH)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = params.styleBlend

      const coverage = params.coverage / 100
      const tintA = params.tintOpacity / 100
      const maxR = (cell * 0.48 * dens) / 2

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (coverage < 1) {
            const h = ((x * 73856093) ^ (y * 19349663)) >>> 0
            if (h / 0xffffffff > coverage) continue
          }
          const o = (y * cols + x) * 4
          let lum = sample[o + 3]! / 255
          if (params.edgeEmphasis > 0 && x > 0 && y > 0 && x < cols - 1 && y < rows - 1) {
            const l = sample[((y * cols + (x - 1)) * 4) + 3]! / 255
            const r = sample[((y * cols + (x + 1)) * 4) + 3]! / 255
            const u = sample[(((y - 1) * cols + x) * 4) + 3]! / 255
            const d = sample[(((y + 1) * cols + x) * 4) + 3]! / 255
            const edge = Math.min(1, Math.abs(lum - l) + Math.abs(lum - r) + Math.abs(lum - u) + Math.abs(lum - d))
            lum = Math.min(1, lum + edge * (params.edgeEmphasis / 100))
          }

          const radius = Math.max(0.4, lum * maxR * pulse)
          if (radius < 0.35) continue

          let r = sample[o]!
          let g = sample[o + 1]!
          let b = sample[o + 2]!
          if (tintA > 0) {
            const tr = overlayChannel(r, tintRgb[0])
            const tg = overlayChannel(g, tintRgb[1])
            const tb = overlayChannel(b, tintRgb[2])
            r = r * (1 - tintA) + tr * tintA
            g = g * (1 - tintA) + tg * tintA
            b = b * (1 - tintA) + tb * tintA
          }

          const cx = x * cell + cell / 2
          const cy = y * cell + cell / 2
          ctx.beginPath()
          ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`
          ctx.globalAlpha = 0.55 + lum * 0.45
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      if (params.pfx.bloom.enabled) {
        const bi = params.pfx.bloom.intensity / 100
        bloomCtx.clearRect(0, 0, cssW, cssH)
        bloomCtx.filter = `blur(${4 + bi * 10}px)`
        bloomCtx.drawImage(canvas, 0, 0, cssW, cssH)
        bloomCtx.filter = "none"
        ctx.save()
        ctx.globalCompositeOperation = "screen"
        ctx.globalAlpha = 0.18 + bi * 0.35
        ctx.drawImage(bloomBuf, 0, 0, cssW, cssH)
        ctx.restore()
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 1
      }

      if (params.pfx.vignette.enabled) {
        const vi = params.pfx.vignette.intensity / 100
        const g = ctx.createRadialGradient(
          cssW / 2,
          cssH / 2,
          Math.min(cssW, cssH) * (0.35 - vi * 0.12),
          cssW / 2,
          cssH / 2,
          Math.max(cssW, cssH) * 0.72
        )
        g.addColorStop(0, "rgba(0,0,0,0)")
        g.addColorStop(1, `rgba(0,0,0,${0.35 + vi * 0.55})`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, cssW, cssH)
      }

      if (params.pfx.scanLines.enabled) {
        const si = params.pfx.scanLines.intensity / 100
        ctx.fillStyle = `rgba(0,0,0,${0.12 + si * 0.25})`
        for (let y = 0; y < cssH; y += 3) {
          ctx.fillRect(0, y, cssW, 1)
        }
      }
    }

    const loop = (t: number) => {
      drawFrame(t)
      if (params.animated && alive) {
        raf = requestAnimationFrame(loop)
      }
    }

    const onReady = () => {
      if (!alive) return
      rebuildSample()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }

    if (img.complete && img.naturalWidth > 0) onReady()
    else img.addEventListener("load", onReady)

    const ro = new ResizeObserver(() => {
      if (!img.complete || img.naturalWidth === 0) return
      rebuildSample()
    })
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      img.removeEventListener("load", onReady)
    }
  }, [src, solidColor])

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    />
  )
}
