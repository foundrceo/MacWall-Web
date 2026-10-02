/** App + email conversion codes that may auto-apply at Checkout. */

export const CONVERSION_PROMO_CODES = [
  "MAC10",
  "WALL10",
  "WALL50",
  "X9K4Q2MH",
  "R7N2WP8J",
  "T4V8CL6Y",
  "B3H9KF5Q",
] as const

export type ConversionPromoCode = (typeof CONVERSION_PROMO_CODES)[number]

const ALLOWLIST = new Set<string>(CONVERSION_PROMO_CODES)

/**
 * Percent off per code, matching the live Stripe coupons and Whop promo codes
 * (checked 2026-10-02). Stripe and Whop apply codes themselves; Cashfree has
 * no coupon field, so India's order amount is discounted with this table.
 * WALL50 exists on neither gateway, so it gives nothing anywhere.
 */
export const CONVERSION_PROMO_PERCENT_OFF: Partial<
  Record<ConversionPromoCode, number>
> = {
  MAC10: 10,
  WALL10: 10,
  X9K4Q2MH: 20,
  R7N2WP8J: 20,
  T4V8CL6Y: 30,
  B3H9KF5Q: 30,
}

export function conversionPromoPercentOff(code: string | null): number {
  if (!code) return 0
  return CONVERSION_PROMO_PERCENT_OFF[code as ConversionPromoCode] ?? 0
}

const TIMED_PROMOS = new Set(["X9K4Q2MH", "R7N2WP8J", "T4V8CL6Y", "B3H9KF5Q"])

const FLOOR_PROMO = "MAC10"

const EMAIL_TWENTY = "R7N2WP8J"
const EMAIL_THIRTY = "B3H9KF5Q"

export function normalizeConversionPromo(
  raw: string | null | undefined,
  offerUntil?: Date | null
): string | null {
  const code = raw?.trim().toUpperCase() || ""
  if (!code || !ALLOWLIST.has(code)) return null
  if (TIMED_PROMOS.has(code) && (!offerUntil || offerUntil.getTime() < Date.now())) {
    return FLOOR_PROMO
  }
  return code
}

export function parseOfferUntil(raw: string | null | undefined): Date | null {
  if (!raw?.trim()) return null
  const n = Number(raw)
  if (Number.isFinite(n) && n > 1_000_000_000) {
    return new Date(n > 1e12 ? n : n * 1000)
  }
  const parsed = Date.parse(raw)
  return Number.isNaN(parsed) ? null : new Date(parsed)
}

export function ladderTierFromReason(
  reason: string | null | undefined
): { code: ConversionPromoCode; percent: string; expiresHours: number } | null {
  const match = reason?.match(/ladder:(WALL20|WALL30|R7N2WP8J|B3H9KF5Q)/i)
  if (!match) return null
  const raw = match[1].toUpperCase()
  if (raw === "WALL20" || raw === EMAIL_TWENTY) {
    return { code: EMAIL_TWENTY, percent: "20%", expiresHours: 24 }
  }
  return { code: EMAIL_THIRTY, percent: "30%", expiresHours: 12 }
}
