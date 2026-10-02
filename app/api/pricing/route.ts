import { cookies } from "next/headers"
import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"

import { isCashfreeIndiaEnabled } from "@/lib/cashfree/server"
import { COUNTRY_COOKIE, isIndiaCountry } from "@/lib/geo/country"
import { resolveVisitorCountry } from "@/lib/geo/resolve-visitor-country"
import {
  PRO_INDIA_USD_CENTS,
  PRO_PLUS_INDIA_USD_CENTS,
  PRO_PLUS_USD_CENTS,
  PRO_USD_CENTS,
  buildDefaultMarketingPricing,
  buildMarketingPricingFromLocalized,
  type MarketingPriceBundle,
  type MarketingPricing,
} from "@/lib/pricing/marketing-pricing"
import {
  conversionPromoPercentOff,
  normalizeConversionPromo,
  parseOfferUntil,
} from "@/lib/stripe/conversion-promos"
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

type PricingPromo = MarketingPriceBundle["promo"]

async function resolvePricingForCountry(
  country: string | null,
  promo: PricingPromo = null
): Promise<MarketingPricing> {
  try {
    // India on Cashfree: fixed rupee prices, no live conversion.
    if (isIndiaCountry(country) && isCashfreeIndiaEnabled()) {
      return buildMarketingPricingFromLocalized({
        country,
        permanentLocal: null,
        proPlusLocal: null,
        fixedIndiaInr: true,
        promo,
      })
    }

    if (!country || country === "US") {
      return buildMarketingPricingFromLocalized({
        country: country ?? "US",
        permanentLocal: null,
        proPlusLocal: null,
        promo,
      })
    }

    const fx = await getStripeUsdPerUnitForCountry(country)
    if (!fx || fx.currency === "usd") {
      return buildMarketingPricingFromLocalized({
        country,
        permanentLocal: null,
        proPlusLocal: null,
        promo,
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
      promo,
    })
  } catch {
    return buildDefaultMarketingPricing()
  }
}

const cachedPricingForCountry = unstable_cache(
  async (countryKey: string) => {
    const country = countryKey.split(":")[0]!
    return resolvePricingForCountry(country === "_" ? null : country)
  },
  ["marketing-pricing-by-country-v11"],
  { revalidate: 300 }
)

/**
 * Localized marketing prices for client hydration (keeps HTML pages static/ISR).
 * Cache key = resolved country so Vercel CDN can share responses per bucket.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const fromQuery = normalizeCountryParam(url.searchParams.get("c"))
  const cookieStore = await cookies()

  // Prefer explicit `?c=`, else resolve from cookie / Vercel geo / IP / egress.
  // Previously we only read the query + Vercel header, so localhost + missing
  // cookie always returned USD with no local hint — even for India visitors.
  const country =
    fromQuery ??
    (await resolveVisitorCountry({
      headers: request.headers,
      cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
    }))

  // ?promo= links: the same validation as checkout (allowlist + expiry for
  // timed codes), so shown prices always match what is charged.
  const promoCode = normalizeConversionPromo(
    url.searchParams.get("promo"),
    parseOfferUntil(url.searchParams.get("until"))
  )
  const promo: PricingPromo = promoCode
    ? {
        code: promoCode,
        percentOff: conversionPromoPercentOff(promoCode),
        until: url.searchParams.get("until")?.trim().slice(0, 40) || null,
      }
    : null

  // The India price depends on the gateway, so it is part of the key.
  // Coupon responses are per-link and skip the shared cache.
  const cacheKey =
    isIndiaCountry(country) && isCashfreeIndiaEnabled()
      ? `${country}:cashfree`
      : (country ?? "_")
  const pricing = promo
    ? await resolvePricingForCountry(country, promo)
    : await cachedPricingForCountry(cacheKey)

  return NextResponse.json(pricing, {
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "cookie, x-vercel-ip-country, accept-language",
    },
  })
}
