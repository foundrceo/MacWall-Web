import { Geist } from "next/font/google"
import localFont from "next/font/local"

/** Site-wide type: Geist 400 only. */
export const geistSans = Geist({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["Geist Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: true,
})

/**
 * Display pixel face for category labels. Declared here instead of importing
 * `geist/font/pixel`, which registers all five pixel faces and preloads every
 * one on every page. Only the home page's category cloud uses this face, below
 * the fold, so it stays off the preload list.
 */
export const geistPixelSquare = localFont({
  src: "../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel-square",
  weight: "500",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
})
