import { cookies, headers } from "next/headers"

import {
  INDIA_QUOTE_COOKIE,
  MW_INDIA_QUOTE_HEADER,
  parseIndiaQuotePayload,
} from "@/lib/pricing/india-quote-transport"
import { fetchWhopIndiaQuote, type WhopIndiaQuote } from "@/lib/pricing/whop-india-pricing"

/**
 * Whop adaptive INR is keyed off the buyer IP. Edge middleware fetches near the
 * visitor and forwards the quote; Node fallbacks only help on later requests.
 */
export async function resolveIndiaQuote(): Promise<WhopIndiaQuote | null> {
  const hdrs = await headers()
  const cookieStore = await cookies()

  const fromMiddleware = parseIndiaQuotePayload(
    hdrs.get(MW_INDIA_QUOTE_HEADER)
  )
  if (fromMiddleware) return fromMiddleware

  const fromCookie = parseIndiaQuotePayload(
    cookieStore.get(INDIA_QUOTE_COOKIE)?.value
  )
  if (fromCookie) return fromCookie

  // Last resort — often USD from US datacenter egress; kept for local dev.
  return fetchWhopIndiaQuote()
}
