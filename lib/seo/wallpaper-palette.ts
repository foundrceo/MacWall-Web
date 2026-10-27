import { colorName } from "@/lib/seo/color-name"
import palettes from "@/lib/seo/wallpaper-palettes.json"

export { colorName }

/**
 * Colours measured from each wallpaper's poster by
 * scripts/generate-wallpaper-palettes.mjs, most common first. Wallpapers added
 * after the last run have no entry until the script runs again.
 */
const byId = palettes as Record<string, string[]>

export type WallpaperColor = { hex: string; name: string }

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
