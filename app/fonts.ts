import localFont from "next/font/local"

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
