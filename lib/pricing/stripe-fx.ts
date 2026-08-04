import "server-only"

import { getStripe } from "@/lib/stripe/server"
import {
  convertUsdCentsWithRate,
  currencyForCountry,
  formatMoney,
  localeForCountry,
  type LocalizedMoney,
} from "@/lib/pricing/money"

const FX_CACHE_TTL_MS = 60 * 60 * 1000
const FX_QUOTES_PREVIEW_VERSION = "2025-07-30.preview"

type FxRateEntry = {
  /** USD per 1 unit of presentment currency (Stripe FX Quotes exchange_rate). */
  usdPerUnit: number
  expiresAt: number
}

const rateCache = new Map<string, FxRateEntry>()

type FxQuoteRate = {
  exchange_rate?: number
}

type FxQuoteResponse = {
  rates?: Record<string, FxQuoteRate>
}

function cacheRate(code: string, usdPerUnit: number): number {
  rateCache.set(code, {
    usdPerUnit,
    expiresAt: Date.now() + FX_CACHE_TTL_MS,
  })
  return usdPerUnit
}

/**
 * Public mid-market fallback when Stripe FX Quotes is unavailable
 * (expired key, preview API disabled, etc.). Display-only — checkout still
 * charges in the Stripe Price currency.
 */
async function fetchUsdPerPresentmentUnitFallback(
  currency: string
): Promise<number | null> {
  const code = currency.toLowerCase()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2500)

  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    )
    if (!response.ok) return null

    const data = (await response.json()) as {
      usd?: Record<string, number>
    }
    const unitsPerUsd = data.usd?.[code]
    if (!unitsPerUsd || !Number.isFinite(unitsPerUsd) || unitsPerUsd <= 0) {
      return null
    }

    // Convert "local per 1 USD" → Stripe-shaped "USD per 1 local".
    return cacheRate(code, 1 / unitsPerUsd)
  } catch (error) {
    console.error(
      "[pricing] FX fallback failed",
      code,
      error instanceof Error ? error.message : "unknown"
    )
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Stripe FX Quotes (preview): presentment → USD rate including FX fee path.
 * localMajor = usdMajor / usdPerUnit
 */
async function fetchUsdPerPresentmentUnit(
  currency: string
): Promise<number | null> {
  const code = currency.toLowerCase()
  if (code === "usd") return 1

  const cached = rateCache.get(code)
  if (cached && cached.expiresAt > Date.now()) return cached.usdPerUnit

  try {
    const stripe = getStripe()
    const quote = (await stripe.rawRequest(
      "POST",
      "/v1/fx_quotes",
      {
        to_currency: "usd",
        from_currencies: [code],
        lock_duration: "none",
        usage: { type: "payment" },
      },
      {
        additionalHeaders: {
          "Stripe-Version": FX_QUOTES_PREVIEW_VERSION,
        },
      }
    )) as FxQuoteResponse

    const usdPerUnit = quote.rates?.[code]?.exchange_rate
    if (!usdPerUnit || !Number.isFinite(usdPerUnit) || usdPerUnit <= 0) {
      return fetchUsdPerPresentmentUnitFallback(code)
    }

    return cacheRate(code, usdPerUnit)
  } catch (error) {
    console.error(
      "[pricing] Stripe FX Quotes failed",
      code,
      error instanceof Error ? error.message : "unknown"
    )
    if (cached?.usdPerUnit) return cached.usdPerUnit
    return fetchUsdPerPresentmentUnitFallback(code)
  }
}

/**
 * Resolve FX rate for a country (1 call per currency, cached 1h).
 * Prefers Stripe FX Quotes; falls back to a public mid-market rate for display.
 * Returns null when localization isn't available → caller keeps USD.
 */
export async function getStripeUsdPerUnitForCountry(
  country: string | null | undefined
): Promise<{ currency: string; locale: string; usdPerUnit: number } | null> {
  const currency = currencyForCountry(country)
  const locale = localeForCountry(country)
  if (currency === "usd") {
    return { currency: "usd", locale, usdPerUnit: 1 }
  }

  const usdPerUnit = await fetchUsdPerPresentmentUnit(currency)
  if (!usdPerUnit) return null

  return { currency, locale, usdPerUnit }
}

export async function localizeUsdCents(
  usdCents: number,
  country: string | null | undefined
): Promise<LocalizedMoney> {
  const locale = localeForCountry(country)
  const fx = await getStripeUsdPerUnitForCountry(country)

  if (!fx || fx.currency === "usd") {
    const major = usdCents / 100
    return {
      currency: "usd",
      locale: fx?.locale ?? locale,
      major,
      formatted: formatMoney(major, "usd", fx?.locale ?? locale),
      isLocalized: false,
    }
  }

  const major = convertUsdCentsWithRate(
    usdCents,
    fx.currency,
    fx.usdPerUnit
  )

  return {
    currency: fx.currency,
    locale: fx.locale,
    major,
    formatted: formatMoney(major, fx.currency, fx.locale),
    isLocalized: true,
  }
}

export type { LocalizedMoney }
export { convertUsdCentsWithRate, formatMoney }
