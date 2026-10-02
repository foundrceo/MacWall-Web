import { cookies, headers } from "next/headers"
import { connection } from "next/server"

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
 * India → $4.99 Pro / $7.99 Pro+, everyone else → $12.99 / $19.99. All
 * charged in USD; shown in the local currency at the live FX rate.
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

    // India on Cashfree: fixed rupee prices, no live conversion.
    if (isIndiaCountry(country) && isCashfreeIndiaEnabled()) {
      return buildMarketingPricingFromLocalized({
        country,
        permanentLocal: null,
        proPlusLocal: null,
        fixedIndiaInr: true,
      })
    }

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
  } catch (error) {
    console.error(
      "[pricing] resolveMarketingPricing failed",
      error instanceof Error ? error.message : "unknown"
    )
    return buildDefaultMarketingPricing()
  }
}
