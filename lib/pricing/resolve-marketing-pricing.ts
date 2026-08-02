import { cookies, headers } from "next/headers"
import { connection } from "next/server"

import { COUNTRY_COOKIE, isIndiaCountry } from "@/lib/geo/country"
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

/**
 * Catalog prices stay USD. India → $3.99 Pro / $6.99 Pro+ (separate Prices).
 * Everyone else → $7.99 / $12.99. No coupon.
 */
export async function resolveMarketingPricing(): Promise<MarketingPricing> {
  await connection()

  try {
    const headerStore = await headers()
    const cookieStore = await cookies()
    const country = await resolveVisitorCountry({
      headers: headerStore,
      cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
    })

    const india = isIndiaCountry(country)
    const permanentCents = india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS
    const proPlusCents = india ? PRO_PLUS_INDIA_USD_CENTS : PRO_PLUS_USD_CENTS

    // US (and unknown→USD) — no local hint.
    if (!country || country.toUpperCase() === "US") {
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
    })
  } catch (error) {
    console.error(
      "[pricing] resolveMarketingPricing failed",
      error instanceof Error ? error.message : "unknown"
    )
    return buildDefaultMarketingPricing()
  }
}
