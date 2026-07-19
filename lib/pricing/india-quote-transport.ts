import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"

import {
  formatInrWhole,
  type IndiaQuote,
  type WhopIndiaQuote,
} from "@/lib/pricing/stripe-india-pricing"

/** Short-lived cache for India pricing display. */
export const INDIA_QUOTE_COOKIE = "mw_india_quote" as const

/** Forwarded by Edge middleware on the same request as the page render. */
export const MW_INDIA_QUOTE_HEADER = "x-mw-india-quote" as const

export const INDIA_QUOTE_MAX_AGE_SECONDS = 300

type IndiaQuotePayload = {
  sa: number
  fa: number
  t: number
  /** @deprecated Legacy cookies may include preformatted INR strings. */
  s?: string
  f?: string
}

/** ASCII-only JSON for cookies and request headers (HTTP headers reject Unicode like ₹). */
export function serializeIndiaQuote(
  quote: IndiaQuote | WhopIndiaQuote
): string {
  const payload: IndiaQuotePayload = {
    sa: quote.saleAmount,
    fa: quote.fullAmount,
    t: Date.now(),
  }
  return JSON.stringify(payload)
}

export function parseIndiaQuotePayload(
  raw: string | null | undefined
): IndiaQuote | null {
  if (!raw?.trim()) return null

  try {
    const data = JSON.parse(raw) as IndiaQuotePayload
    if (
      !Number.isFinite(data.sa) ||
      !Number.isFinite(data.fa) ||
      !Number.isFinite(data.t)
    ) {
      return null
    }

    const ageMs = Date.now() - data.t
    if (ageMs < 0 || ageMs > INDIA_QUOTE_MAX_AGE_SECONDS * 1000) return null

    const saleDisplay = data.s ?? formatInrWhole(data.sa)
    const fullDisplay = data.f ?? formatInrWhole(data.fa)

    return {
      currency: "inr",
      promoCode: INDIA_PROMO_CODE,
      discountPercent: indiaPromo.discountPercent,
      fullAmount: data.fa,
      saleAmount: data.sa,
      fullDisplay,
      saleDisplay,
      ctaLabel: `Get Pro for ${saleDisplay}`,
      fetchedAt: new Date(data.t).toISOString(),
      source: "stripe_pricing",
    }
  } catch {
    return null
  }
}
