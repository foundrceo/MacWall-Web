import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"

import { isIndiaCountry } from "@/lib/geo/country"
import {
  PRO_INDIA_USD_CENTS,
  PRO_PLUS_INDIA_USD_CENTS,
  PRO_PLUS_USD_CENTS,
  PRO_USD_CENTS,
  buildDefaultMarketingPricing,
  buildMarketingPricingFromLocalized,
  type MarketingPricing,
} from "@/lib/pricing/marketing-pricing"
import {
  convertUsdCentsWithRate,
  formatMoney,
  getStripeUsdPerUnitForCountry,
  type LocalizedMoney,
} from "@/lib/pricing/stripe-fx"

export const runtime = "nodejs"

function toLocalMoney(
  usdCents: number,
  currency: string,
  locale: string,
  usdPerUnit: number
): LocalizedMoney {
  const major = convertUsdCentsWithRate(usdCents, currency, usdPerUnit)
  return {
    currency,
    locale,
    major,
    formatted: formatMoney(major, currency, locale),
    isLocalized: currency !== "usd",
  }
}

function normalizeCountryParam(value: string | null): string | null {
  const code = value?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

async function resolvePricingForCountry(
  country: string | null
): Promise<MarketingPricing> {
  try {
    const india = isIndiaCountry(country)
    const permanentCents = india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS
    const proPlusCents = india ? PRO_PLUS_INDIA_USD_CENTS : PRO_PLUS_USD_CENTS

    if (!country || country === "US") {
      return buildMarketingPricingFromLocalized({
        country: country ?? "US",
        permanentLocal: null,
        proPlusLocal: null,
      })
    }

    const fx = await getStripeUsdPerUnitForCountry(country)
    if (!fx || fx.currency === "usd") {
      return buildMarketingPricingFromLocalized({
        country,
        permanentLocal: null,
        proPlusLocal: null,
      })
    }

    return buildMarketingPricingFromLocalized({
      country,
      permanentLocal: toLocalMoney(
        permanentCents,
        fx.currency,
        fx.locale,
        fx.usdPerUnit
      ),
      proPlusLocal: toLocalMoney(
        proPlusCents,
        fx.currency,
        fx.locale,
        fx.usdPerUnit
      ),
      fx: {
        currency: fx.currency,
        locale: fx.locale,
        usdPerUnit: fx.usdPerUnit,
      },
    })
  } catch {
    return buildDefaultMarketingPricing()
  }
}

const cachedPricingForCountry = unstable_cache(
  async (countryKey: string) =>
    resolvePricingForCountry(countryKey === "_" ? null : countryKey),
  ["marketing-pricing-by-country"],
  { revalidate: 300 }
)

/**
 * Localized marketing prices for client hydration (keeps HTML pages static/ISR).
 * Cache key = `?c=XX` so Vercel CDN can share responses per country bucket.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const fromQuery = normalizeCountryParam(url.searchParams.get("c"))
  const fromHeader = normalizeCountryParam(
    request.headers.get("x-vercel-ip-country")
  )
  const country = fromQuery ?? fromHeader
  const cacheKey = country ?? "_"

  const pricing = await cachedPricingForCountry(cacheKey)

  return NextResponse.json(pricing, {
    headers: {
      // Per-country URL variant — safe to CDN-cache (no cookies/session).
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "Vercel-CDN-Cache-Control": "max-age=300, stale-while-revalidate=3600",
      Vary: "x-vercel-ip-country",
    },
  })
}
