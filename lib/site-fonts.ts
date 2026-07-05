/**
 * Prefer Tailwind `font-sans` / `font-mono` (Geist from Google Fonts in root layout + `globals.css`).
 * Use this when you need an inline `fontFamily` and cannot rely on class utilities.
 */
export const siteFontSans =
  "var(--site-font-sans), ui-sans-serif, system-ui, sans-serif" as const

export const siteFontMono =
  "var(--site-font-mono), ui-monospace, monospace" as const
