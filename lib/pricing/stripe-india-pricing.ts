import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"

/** Fixed USD→INR estimate for internal quote math only (India site never displays INR). */
const USD_TO_INR = 84

const PRO_PRICE_USD = 7.99

export type IndiaQuote = {
  currency: "inr"
  promoCode: string
  discountPercent: number
  /** Full INR price estimate before promo. */
  fullAmount: number
  /** 50% off amount. */
  saleAmount: number
  fullDisplay: string
  saleDisplay: string
  ctaLabel: string
  fetchedAt: string
  source: "stripe_pricing"
}

/** @deprecated Use `IndiaQuote`. */
export type WhopIndiaQuote = IndiaQuote

export function formatInrWhole(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`
}

export function buildStripeIndiaQuote(): IndiaQuote {
  const fullAmount = PRO_PRICE_USD * USD_TO_INR
  const saleAmount = fullAmount * (1 - indiaPromo.discountPercent / 100)

  return {
    currency: "inr",
    promoCode: INDIA_PROMO_CODE,
    discountPercent: indiaPromo.discountPercent,
    fullAmount,
    saleAmount,
    fullDisplay: formatInrWhole(fullAmount),
    saleDisplay: formatInrWhole(saleAmount),
    ctaLabel: `Get Pro for ${formatInrWhole(saleAmount)}`,
    fetchedAt: new Date().toISOString(),
    source: "stripe_pricing",
  }
}

export async function fetchStripeIndiaQuote(): Promise<IndiaQuote | null> {
  return buildStripeIndiaQuote()
}

/** @deprecated Use `fetchStripeIndiaQuote`. */
export const fetchWhopIndiaQuote = fetchStripeIndiaQuote
