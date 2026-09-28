import {
  currencyForCountry,
  isZeroDecimalCurrency,
  localeForCountry,
} from "@/lib/pricing/country-currency"

export type LocalizedMoney = {
  currency: string
  locale: string
  /** Major units for NumberFlow / display math. */
  major: number
  /** Locale-formatted string, e.g. ₹962.05 or $9.99 */
  formatted: string
  /** True when currency differs from USD integration currency. */
  isLocalized: boolean
}

/** Whole amounts drop the decimals (₹499, not ₹499.00); others keep 2. */
export function moneyFractionDigits(major: number, currency: string): number {
  return isZeroDecimalCurrency(currency) || Number.isInteger(major) ? 0 : 2
}

/** Signs locals use where the English default is only the ISO code. */
const PREFERRED_CURRENCY_SYMBOLS: Record<string, string> = { SGD: "S$" }

/** English-style sign (CA$, A$, HK$, NZ$, S$ …), where only USD is a bare "$". */
function unambiguousCurrencySymbol(code: string): string {
  const preferred = PREFERRED_CURRENCY_SYMBOLS[code]
  if (preferred) return preferred
  try {
    return (
      new Intl.NumberFormat("en-US", { style: "currency", currency: code })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? code
    )
  } catch {
    return code
  }
}

/**
 * True when `locale` writes a non-US currency with a bare "$" (SGD in en-SG,
 * CAD in en-CA, AUD in en-AU …), which reads as US dollars.
 */
export function hasAmbiguousDollarSign(currency: string, locale: string): boolean {
  const code = currency.toUpperCase()
  if (code === "USD") return false
  try {
    const sign = new Intl.NumberFormat(locale, { style: "currency", currency: code })
      .formatToParts(1)
      .find((part) => part.type === "currency")?.value
    return sign?.trim() === "$"
  } catch {
    return false
  }
}

export function formatMoney(
  major: number,
  currency: string,
  locale: string
): string {
  const digits = moneyFractionDigits(major, currency)
  const code = currency.toUpperCase()
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    if (!hasAmbiguousDollarSign(code, locale)) return formatter.format(major)

    // Keep the locale's layout; only swap the bare "$" for a sign that names the currency.
    const symbol = unambiguousCurrencySymbol(code)
    const parts = formatter.formatToParts(major)
    return parts
      .map((part, index) => {
        if (part.type !== "currency") return part.value
        const next = parts[index + 1]
        const needsSpace = /^[A-Z]{3}$/.test(symbol) && next !== undefined && next.type !== "literal"
        return needsSpace ? `${symbol}\u00a0` : symbol
      })
      .join("")
  } catch {
    return `${code} ${major.toFixed(digits)}`
  }
}

/** Convert USD minor units → local major using Stripe FX Quotes rate. */
export function convertUsdCentsWithRate(
  usdCents: number,
  currency: string,
  usdPerUnit: number
): number {
  const code = currency.toLowerCase()
  if (code === "usd" || usdPerUnit <= 0) return usdCents / 100

  const major = usdCents / 100 / usdPerUnit
  if (isZeroDecimalCurrency(code)) return Math.round(major)
  return Math.round(major * 100) / 100
}

export { currencyForCountry, isZeroDecimalCurrency, localeForCountry }
