import { macwallProCheckoutURL } from "@/lib/macwall-site"

/** Whop discount code — create this in Whop dashboard for 50% off Pro. */
export const INDIA_PROMO_CODE = "INDIA50" as const

/** Personal 24-hour window from first India promo impression. */
export const INDIA_PROMO_DURATION_MS = 24 * 60 * 60 * 1000

export const INDIA_PROMO_START_KEY = "mw_india_promo_start" as const

export const indiaPromo = {
  code: INDIA_PROMO_CODE,
  discountPercent: 50,
  checkoutUrl: macwallProCheckoutURL,
  pricingAnchor: "india-offer",
  banner: {
    headline: "🇮🇳 India-only flash sale — 50% OFF MacWall Pro",
    subline: (code: string, countdown: string, salePrice?: string) =>
      salePrice
        ? `${salePrice} with ${code} · ${countdown} left · Tap to claim →`
        : `Use code ${code} · ${countdown} left · Tap to claim →`,
  },
  pricing: {
    badge: "🇮🇳 India exclusive",
    title: "Your 24-hour flash deal",
    hook: "We dropped the price for India — great Mac wallpapers shouldn't break the bank.",
    ctaFallback: "Get Pro — 50% off",
    ctaAria: `Buy MacWall Pro with India discount code ${INDIA_PROMO_CODE}`,
    copyLabel: "Copy code",
    copiedLabel: "Copied!",
    checkoutNote: "Apply INDIA50 at Whop checkout",
    lifetimeNote: "Lifetime license · up to 3 Macs",
  },
} as const

export function indiaPromoPricingHref(): string {
  return `/pricing#${indiaPromo.pricingAnchor}`
}

export function getIndiaPromoDeadlineMs(startMs: number): number {
  return startMs + INDIA_PROMO_DURATION_MS
}

export function formatPromoCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "Expired"

  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
}
