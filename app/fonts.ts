import { Geist } from "next/font/google"
import { GeistPixelSquare } from "geist/font/pixel"

/** Site-wide type: Geist 400 only. */
export const geistSans = Geist({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["Geist Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: true,
})

/** Display pixel face for category labels. */
export const geistPixelSquare = GeistPixelSquare
