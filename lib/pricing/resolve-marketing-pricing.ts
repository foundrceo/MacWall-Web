import { cookies, headers } from "next/headers"
import { connection } from "next/server"

import { COUNTRY_COOKIE } from "@/lib/geo/country"
import { resolveVisitorCountry } from "@/lib/geo/resolve-visitor-country"
import {
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
 * Catalog prices stay USD. Non-US visitors get a local ≈ hint under the card price.
 * Checkout Adaptive Pricing remains the charge authority.
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
        PRO_USD_CENTS,
        fx.currency,
        fx.locale,
        fx.usdPerUnit
      ),
      proPlusLocal: toLocalMoney(
        PRO_PLUS_USD_CENTS,
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
