import localFont from "next/font/local"

/**
 * Geist Pixel Square, used on genre tiles and display labels.
 *
 * Declared here rather than imported from `geist/font/pixel`, which calls
 * `localFont()` for all five variants and makes next/font preload every one.
 * `preload: false` because these labels sit below the fold.
 */
export const geistPixelSquare = localFont({
  src: "../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel-square",
  weight: "500",
  display: "swap",
  preload: false,
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  adjustFontFallback: false,
})
