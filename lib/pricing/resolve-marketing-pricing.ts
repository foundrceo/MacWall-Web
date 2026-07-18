import { cookies, headers } from "next/headers"

import { getCachedIndiaQuote } from "@/lib/pricing/get-cached-india-quote"
import {
  buildDefaultMarketingPricing,
  buildIndiaMarketingPricing,
  buildIndiaMarketingPricingFallback,
  type MarketingPricing,
} from "@/lib/pricing/marketing-pricing"
import { COUNTRY_COOKIE } from "@/lib/geo/country"
import {
  isIndiaCountry,
  resolveVisitorCountry,
} from "@/lib/geo/resolve-visitor-country"

export async function resolveMarketingPricing(): Promise<MarketingPricing> {
  const hdrs = await headers()
  const cookieStore = await cookies()

  const country = await resolveVisitorCountry({
    headers: hdrs,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
  })

  if (!isIndiaCountry(country)) {
    return buildDefaultMarketingPricing()
  }

  const quote = await getCachedIndiaQuote()
  if (!quote) return buildIndiaMarketingPricingFallback()

  return buildIndiaMarketingPricing(quote)
}
