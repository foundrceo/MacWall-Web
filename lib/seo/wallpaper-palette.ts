import palettes from "@/lib/seo/wallpaper-palettes.json"

/**
 * Colours measured from each wallpaper's poster by
 * scripts/generate-wallpaper-palettes.mjs, most common first. Wallpapers added
 * after the last run have no entry until the script runs again.
 */
const byId = palettes as Record<string, string[]>

export type WallpaperColor = { hex: string; name: string }

function hsl(hex: string): { h: number; s: number; l: number } {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  const s = d / (1 - Math.abs(2 * l - 1))
  let h =
    max === r
      ? ((g - b) / d) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4
  h *= 60
  if (h < 0) h += 360
  return { h, s, l }
}

const HUES: [number, string][] = [
  [15, "red"],
  [40, "orange"],
  [55, "amber"],
  [70, "yellow"],
  [95, "lime"],
  [160, "green"],
  [190, "teal"],
  [215, "blue"],
  [250, "indigo"],
  [285, "purple"],
  [330, "magenta"],
  [345, "pink"],
  [360, "red"],
]

/** Plain colour name for a hex value, e.g. "deep blue", "pale pink", "charcoal". */
export function colorName(hex: string): string {
  const { h, s, l } = hsl(hex)
  if (l < 0.1) return "black"
  if (l > 0.93) return "white"
  if (s < 0.15) {
    if (l > 0.7) return "light grey"
    if (l > 0.35) return "grey"
    return "charcoal"
  }
  const hue = HUES.find(([limit]) => h < limit)?.[1] ?? "red"
  // Dark oranges read as brown, light ones as beige.
  if (hue === "orange" || hue === "amber") {
    if (l < 0.35) return "brown"
    if (l > 0.75 && s < 0.6) return "beige"
  }
  if (l < 0.25) return `deep ${hue}`
  if (l > 0.75) return `pale ${hue}`
  return hue
}

/** Up to five measured colours with names, duplicates by name removed. */
export function wallpaperColors(id: string): WallpaperColor[] {
  const seen = new Set<string>()
  const out: WallpaperColor[] = []
  for (const hex of byId[id] ?? []) {
    const name = colorName(hex)
    if (seen.has(name)) continue
    seen.add(name)
    out.push({ hex, name })
  }
  return out
}
