/** Stripe promotion code — India flash offer messaging. */
export const INDIA_PROMO_CODE = "INDIA" as const

/** Personal 24-hour window from first India promo impression. */
export const INDIA_PROMO_DURATION_MS = 24 * 60 * 60 * 1000

export const INDIA_PROMO_START_KEY = "mw_india_promo_start" as const

export const indiaPromo = {
  code: INDIA_PROMO_CODE,
  discountPercent: 20,
  pricingAnchor: "india-offer",
  banner: {
    headline: "🇮🇳 India-only flash sale — 20% OFF MacWall Pro",
    subline: (code: string, countdown: string) =>
      `Use code ${code} · ${countdown} left · Tap to claim`,
  },
} as const

export function indiaPromoPricingHref(): string {
  return `/pricing#${indiaPromo.pricingAnchor}`
}

/**
 * Rolling 24h countdown — when one 24h window elapses, a fresh one begins.
 * The timer always shows time remaining and never permanently expires.
 */
export function getRollingPromoRemainingMs(
  startMs: number,
  nowMs: number = Date.now()
): number {
  const elapsed = nowMs - startMs
  if (elapsed <= 0) return INDIA_PROMO_DURATION_MS

  const intoCurrentWindow = elapsed % INDIA_PROMO_DURATION_MS
  const remaining = INDIA_PROMO_DURATION_MS - intoCurrentWindow
  return remaining === 0 ? INDIA_PROMO_DURATION_MS : remaining
}

export function formatPromoCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "Expired"

  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
}
