import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"

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

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

async function resolvePricing(): Promise<MarketingPricing> {
  try {
    const headerStore = await headers()
    const cookieStore = await cookies()
    const country = await resolveVisitorCountry({
      headers: headerStore,
      cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
      skipIpLookup: true,
    })

    const india = isIndiaCountry(country)
    const permanentCents = india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS
    const proPlusCents = india ? PRO_PLUS_INDIA_USD_CENTS : PRO_PLUS_USD_CENTS

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

/** Localized marketing prices for client hydration (keeps HTML pages static/ISR). */
export async function GET() {
  const pricing = await resolvePricing()
  return NextResponse.json(pricing, {
    headers: {
      "Cache-Control": "private, max-age=60",
    },
  })
}
