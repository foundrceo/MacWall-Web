import { macwallProCheckoutURL } from "@/lib/macwall-site"
import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"

const WHOP_CHECKOUT_FETCH_TIMEOUT_MS = 12_000
const DEFAULT_PLAN_ID = "plan_XburB7qWsnvR8"

/** Last-known Whop adaptive INR for the Pro plan — used only when live scrape fails. */
const INDIA_FALLBACK_FULL_INR = 771

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
  source: "whop_checkout" | "fallback"
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

function htmlLooksLikeInrPricing(html: string): boolean {
  return (
    /currency\\":\\"inr\\"/.test(html) ||
    /"currency":"inr"/i.test(html) ||
    /currency":"inr"/i.test(html) ||
    /₹\d/.test(html)
  )
}

export function parseWhopInrInitialPrice(html: string): number | null {
  if (!htmlLooksLikeInrPricing(html)) return null

  const initialPatterns = [
    /raw_price\\":\{\\"initial\\":(\d+(?:\.\d+)?)/,
    /raw_price":\{"initial":(\d+(?:\.\d+)?)/,
    /"raw_price":\{"initial":(\d+(?:\.\d+)?)/,
    /raw_price[^}]*initial[^0-9]*(\d+(?:\.\d+)?)/i,
  ]

  for (const pattern of initialPatterns) {
    const match = html.match(pattern)
    if (match) {
      const value = Number.parseFloat(match[1] ?? "")
      if (Number.isFinite(value) && value > 0) return value
    }
  }

  const rupeeDisplay = html.match(/₹(\d[\d,]*)/)
  if (rupeeDisplay) {
    const value = Number.parseFloat(rupeeDisplay[1].replace(/,/g, ""))
    if (Number.isFinite(value) && value > 0) return value
  }

  return null
}

function buildQuoteFromAmount(
  planId: string,
  fullAmount: number,
  source: WhopIndiaQuote["source"]
): WhopIndiaQuote {
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
    source,
  }
}

export function buildIndiaFallbackQuote(
  planId: string = extractWhopPlanId()
): WhopIndiaQuote {
  return buildQuoteFromAmount(planId, INDIA_FALLBACK_FULL_INR, "fallback")
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
        Accept: "text/html,application/xhtml+xml",
        // Whop serves adaptive INR pricing when the request locale is India.
        "Accept-Language": "en-IN,en;q=0.9,hi-IN;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) return null

    const html = await response.text()
    const fullAmount = parseWhopInrInitialPrice(html)
    if (fullAmount === null) return null

    return buildQuoteFromAmount(planId, fullAmount, "whop_checkout")
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
