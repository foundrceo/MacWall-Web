import { macwall } from "@/lib/macwall-site"
import {
  type LicensePlanSlug,
  licensePlanCheckoutPath,
} from "@/lib/license/plans.shared"

/** Stripe promotion code — 50% off all MacWall plans at checkout (India). */
export const INDIA_PROMO_CODE = "INDIA50" as const

/** Personal 24-hour window from first India promo impression. */
export const INDIA_PROMO_DURATION_MS = 24 * 60 * 60 * 1000

export const INDIA_PROMO_START_KEY = "mw_india_promo_start" as const

export function indiaCheckoutPath(plan: LicensePlanSlug = "pro"): string {
  return licensePlanCheckoutPath(plan, { promo: INDIA_PROMO_CODE })
}

export const indiaPromo = {
  code: INDIA_PROMO_CODE,
  discountPercent: 50,
  checkoutUrl: indiaCheckoutPath("pro"),
  proPlusCheckoutUrl: indiaCheckoutPath("pro_plus"),
  pricingAnchor: "india-offer",
  banner: {
    headline: "🇮🇳 India-only flash sale — 50% OFF everything",
    subline: (code: string, countdown: string, salePrice?: string) =>
      salePrice
        ? `${salePrice} with ${code} · ${countdown} left · Tap to claim →`
        : `Use code ${code} on Pro & Pro Plus · ${countdown} left · Tap to claim →`,
  },
  pricing: {
    badge: "🇮🇳 India exclusive",
    title: "Your 24-hour flash deal",
    hook: "We dropped the price for India — 50% off Pro and Pro Plus at checkout.",
    ctaFallback: "Get Pro — 50% off",
    proPlusCtaFallback: "Get Pro Plus — 50% off",
    ctaAria: `Buy MacWall with India discount code ${INDIA_PROMO_CODE}`,
    proPlusCtaAria: `Buy MacWall Pro Plus with India discount code ${INDIA_PROMO_CODE}`,
    copyLabel: "Copy code",
    copiedLabel: "Copied!",
    checkoutNote: "Apply INDIA50 at Stripe checkout — works on Pro & Pro Plus",
    lifetimeNote: `Lifetime license · up to ${macwall.maxLicensedMacs} Macs on Pro`,
  },
} as const

export function indiaPromoPricingHref(): string {
  return `/pricing#${indiaPromo.pricingAnchor}`
}

export function getIndiaPromoDeadlineMs(startMs: number): number {
  return startMs + INDIA_PROMO_DURATION_MS
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