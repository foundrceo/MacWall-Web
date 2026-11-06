/**
 * Plain colour names for hex values. Kept apart from the palette data so the
 * browser tools can import it without the per-wallpaper JSON.
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
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

const HUES = [
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
] as const

export type HueName = (typeof HUES)[number][1]

/** Plain colour name for a hex value, e.g. "deep blue", "pale pink", "charcoal". */
export function colorName(hex: string): string {
  const { h, s, l } = hexToHsl(hex)
  if (l < 0.1) return "black"
  if (l > 0.93) return "white"
  // Very light, barely tinted colours read as off-white, not "pale lime".
  if (l > 0.82 && s < 0.3) return "off-white"
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

/** The hue a colour name is built on ("deep blue" → "blue"); null for neutrals, brown and beige. */
export function colorNameHue(name: string): HueName | null {
  const base = name.replace(/^(?:deep|pale) /, "")
  return HUES.some(([, hue]) => hue === base) ? (base as HueName) : null
}

const LIGHT_NAMES: ReadonlySet<string> = new Set([
  "white",
  "off-white",
  "light grey",
])

/** White, off-white and light grey: the swatches a light wallpaper leads with. */
export function isLightColorName(name: string): boolean {
  return LIGHT_NAMES.has(name)
}

/** Near-black swatches, which are often letterboxing rather than the picture. */
const DARK_NAMES: ReadonlySet<string> = new Set(["black", "charcoal"])

/**
 * How a colour collection picks wallpapers from their measured palettes:
 * - `hue`: one of the hues leads the palette;
 * - `light`: a white or light frame;
 * - `pastel`: soft, light colours (lightness over 0.6, saturation 0.2 to 0.6).
 */
export type PaletteRule =
  | { kind: "hue"; hues: readonly HueName[] }
  | { kind: "light" }
  | { kind: "pastel" }

/** A swatch this pale or grey doesn't make a wallpaper "blue" or "green". */
const HUE_MIN_SATURATION = 0.25

/**
 * The swatches that describe a wallpaper's colour, from a palette listed most
 * common first: the first two after dropping black and charcoal swatches,
 * which are usually letterbox bars. The palette has no shares, so a frame that
 * leads with two dark swatches counts as mostly dark: its dark swatches stand,
 * and only the first colour after them is used.
 */
export function leadingPaletteColors(hexes: readonly string[]): string[] {
  const names = hexes.map(colorName)
  const mostlyDark =
    names.length > 1 && DARK_NAMES.has(names[0]) && DARK_NAMES.has(names[1])
  const colors = hexes.filter((_, index) => !DARK_NAMES.has(names[index]))
  return colors.slice(0, mostlyDark ? 1 : 2)
}

function isPastel(hex: string): boolean {
  const { s, l } = hexToHsl(hex)
  return l > 0.6 && s >= 0.2 && s <= 0.6
}

/** Whether a measured palette (most common colour first) fits a colour collection. */
export function paletteMatches(
  hexes: readonly string[],
  rule: PaletteRule
): boolean {
  const leading = leadingPaletteColors(hexes)
  switch (rule.kind) {
    case "hue":
      return leading.some((hex) => {
        const hue = colorNameHue(colorName(hex))
        return (
          hue !== null &&
          rule.hues.includes(hue) &&
          hexToHsl(hex).s >= HUE_MIN_SATURATION
        )
      })
    case "light":
      return (
        leading.length === 2 &&
        isLightColorName(colorName(leading[0])) &&
        leading.every((hex) => hexToHsl(hex).l >= 0.7)
      )
    case "pastel":
      return leading.length === 2 && leading.every(isPastel)
  }
}
