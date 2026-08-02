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

export function formatMoney(
  major: number,
  currency: string,
  locale: string
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: isZeroDecimalCurrency(currency) ? 0 : 2,
      maximumFractionDigits: isZeroDecimalCurrency(currency) ? 0 : 2,
    }).format(major)
  } catch {
    return `${currency.toUpperCase()} ${major.toFixed(
      isZeroDecimalCurrency(currency) ? 0 : 2
    )}`
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
