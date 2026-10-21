import { cookies } from "next/headers"
import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"

import {
  applyCountryCookie,
  COUNTRY_COOKIE,
  isIndiaCountry,
} from "@/lib/geo/country"
import { resolveVisitorCountry } from "@/lib/geo/resolve-visitor-country"
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

    const india = isIndiaCountry(country)
    return buildMarketingPricingFromLocalized({
      country,
      permanentLocal: toLocalMoney(
        india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS,
        fx.currency,
        fx.locale,
        fx.usdPerUnit
      ),
      proPlusLocal: toLocalMoney(
        india ? PRO_PLUS_INDIA_USD_CENTS : PRO_PLUS_USD_CENTS,
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
  ["marketing-pricing-by-country-v10"],
  // Display-only local prices (Stripe converts at checkout), so a 6h FX
  // refresh is plenty; each refresh is a KV write per active country.
  { revalidate: 6 * 60 * 60 }
)

/**
 * Localized marketing prices for client hydration (keeps HTML pages static/ISR).
 *
 * `?c=XX` (the client sends its country cookie) depends on nothing but the
 * URL, so the CDN answers it without invoking this function. The bare
 * call resolves geo per visitor, stays private, and sets the country cookie so
 * every later call takes the cached `?c=` path. The proxy skips this route.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const fromQuery = normalizeCountryParam(url.searchParams.get("c"))

  if (fromQuery) {
    return NextResponse.json(await cachedPricingForCountry(fromQuery), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    })
  }

  const cookieStore = await cookies()
  const cookieCountry = cookieStore.get(COUNTRY_COOKIE)?.value
  // Cookie / geo header / IP / egress. Localhost has no geo header, so the IP
  // fallback is what still gives India visitors an INR hint there.
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry,
  })

  const response = NextResponse.json(
    await cachedPricingForCountry(country ?? "_"),
    { headers: { "Cache-Control": "private, no-store" } }
  )
  return country === cookieCountry
    ? response
    : applyCountryCookie(response, country)
}
