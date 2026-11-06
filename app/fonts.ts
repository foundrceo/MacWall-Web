import { Averia_Serif_Libre, Geist } from "next/font/google"

/** Site-wide type: Geist 400 only. */
export const geistSans = Geist({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["Geist Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: true,
})

/** Display serif for big headings (hero, page titles, section titles). */
export const averiaSerif = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-averia-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
})
