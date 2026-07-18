import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"

import {
  extractWhopPlanId,
  type WhopIndiaQuote,
} from "@/lib/pricing/whop-india-pricing"

/** Short-lived cache — Whop adaptive INR moves with FX. */
export const INDIA_QUOTE_COOKIE = "mw_india_quote" as const

/** Forwarded by Edge middleware on the same request as the page render. */
export const MW_INDIA_QUOTE_HEADER = "x-mw-india-quote" as const

export const INDIA_QUOTE_MAX_AGE_SECONDS = 300

type IndiaQuotePayload = {
  s: string
  f: string
  sa: number
  fa: number
  t: number
}

export function serializeIndiaQuote(quote: WhopIndiaQuote): string {
  const payload: IndiaQuotePayload = {
    s: quote.saleDisplay,
    f: quote.fullDisplay,
    sa: quote.saleAmount,
    fa: quote.fullAmount,
    t: Date.now(),
  }
  return JSON.stringify(payload)
}

export function parseIndiaQuotePayload(
  raw: string | null | undefined
): WhopIndiaQuote | null {
  if (!raw?.trim()) return null

  try {
    const data = JSON.parse(raw) as IndiaQuotePayload
    if (
      !data.s ||
      !data.f ||
      !Number.isFinite(data.sa) ||
      !Number.isFinite(data.fa) ||
      !Number.isFinite(data.t)
    ) {
      return null
    }

    const ageMs = Date.now() - data.t
    if (ageMs < 0 || ageMs > INDIA_QUOTE_MAX_AGE_SECONDS * 1000) return null

    return {
      currency: "inr",
      planId: extractWhopPlanId(),
      promoCode: INDIA_PROMO_CODE,
      discountPercent: indiaPromo.discountPercent,
      fullAmount: data.fa,
      saleAmount: data.sa,
      fullDisplay: data.f,
      saleDisplay: data.s,
      ctaLabel: `Get Pro for ${data.s}`,
      fetchedAt: new Date(data.t).toISOString(),
      source: "whop_checkout",
    }
  } catch {
    return null
  }
}
