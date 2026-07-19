import { cookies, headers } from "next/headers"

import {
  INDIA_QUOTE_COOKIE,
  MW_INDIA_QUOTE_HEADER,
  parseIndiaQuotePayload,
} from "@/lib/pricing/india-quote-transport"
import {
  fetchStripeIndiaQuote,
  type IndiaQuote,
} from "@/lib/pricing/stripe-india-pricing"

/** India quote from Edge middleware cookie/header, or static Stripe estimate. */
export async function resolveIndiaQuote(): Promise<IndiaQuote | null> {
  const hdrs = await headers()
  const cookieStore = await cookies()

  const fromMiddleware = parseIndiaQuotePayload(hdrs.get(MW_INDIA_QUOTE_HEADER))
  if (fromMiddleware) return fromMiddleware

  const fromCookie = parseIndiaQuotePayload(
    cookieStore.get(INDIA_QUOTE_COOKIE)?.value
  )
  if (fromCookie) return fromCookie

  return fetchStripeIndiaQuote()
}
