import { Instrument_Sans } from "next/font/google"
import localFont from "next/font/local"

/** Pricing card amounts: clean numerals next to PP Neue Montreal UI copy. */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: true,
})

export const ppNeueMontreal = localFont({
  src: [
    {
      path: "./fonts/ppneuemontreal-book.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ppneuemontreal-medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ppneuemontreal-bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pp-neue-montreal",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
})

export const ppNeueMontrealExtra = localFont({
  src: [
    {
      path: "./fonts/ppneuemontreal-thin.woff",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/ppneuemontreal-italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/ppneuemontreal-semibolditalic.woff",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-pp-neue-montreal-extra",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
})
