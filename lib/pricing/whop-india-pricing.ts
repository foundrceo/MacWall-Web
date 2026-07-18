import { macwallProCheckoutURL } from "@/lib/macwall-site"
import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"

const WHOP_CHECKOUT_FETCH_TIMEOUT_MS = 12_000
const DEFAULT_PLAN_ID = "plan_XburB7qWsnvR8"

export type WhopIndiaQuote = {
  currency: "inr"
  planId: string
  promoCode: string
  discountPercent: number
  /** Full adaptive INR price from Whop checkout (before promo). */
  fullAmount: number
  /** 50% off amount derived from Whop's live INR price. */
  saleAmount: number
  /** Whole rupee display values — no decimals. */
  fullDisplay: string
  saleDisplay: string
  ctaLabel: string
  fetchedAt: string
  source: "whop_checkout"
}

export function extractWhopPlanId(
  checkoutUrl: string = macwallProCheckoutURL
): string {
  const match = checkoutUrl.match(/plan_[A-Za-z0-9]+/)
  return match?.[0] ?? DEFAULT_PLAN_ID
}

export function formatInrWhole(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`
}

function parseWhopInrInitialPrice(html: string): number | null {
  const patterns = [
    /raw_price\\":\{\\"initial\\":(\d+(?:\.\d+)?)/,
    /\\"raw_price\\":\{\\"initial\\":(\d+(?:\.\d+)?)/,
    /"raw_price":\{"initial":(\d+(?:\.\d+)?)/,
  ]

  const hasInr =
    /currency\\":\\"inr\\"/.test(html) || /"currency":"inr"/i.test(html)
  if (!hasInr) return null

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) {
      const value = Number.parseFloat(match[1] ?? "")
      if (Number.isFinite(value) && value > 0) return value
    }
  }

  return null
}

export async function fetchWhopIndiaQuote(
  planId: string = extractWhopPlanId()
): Promise<WhopIndiaQuote | null> {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    WHOP_CHECKOUT_FETCH_TIMEOUT_MS
  )

  try {
    const response = await fetch(`https://whop.com/checkout/${planId}/`, {
      headers: {
        "x-vercel-ip-country": "IN",
        Accept: "text/html",
        "User-Agent": "MacWallPricing/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) return null

    const html = await response.text()
    const fullAmount = parseWhopInrInitialPrice(html)
    if (fullAmount === null) return null

    const saleAmount = fullAmount * (1 - indiaPromo.discountPercent / 100)

    return {
      currency: "inr",
      planId,
      promoCode: INDIA_PROMO_CODE,
      discountPercent: indiaPromo.discountPercent,
      fullAmount,
      saleAmount,
      fullDisplay: formatInrWhole(fullAmount),
      saleDisplay: formatInrWhole(saleAmount),
      ctaLabel: `Get Pro for ${formatInrWhole(saleAmount)}`,
      fetchedAt: new Date().toISOString(),
      source: "whop_checkout",
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
