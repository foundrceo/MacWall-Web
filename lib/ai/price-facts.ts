import type { PricingRegion } from "@/lib/license/offers.shared"
import {
  currentPromotionLine,
  formatPriceCents,
  offerPackLabel,
  offersFor,
  priceWithSaleText,
  proPriceFor,
  type SaleAwarePrice,
} from "@/lib/pricing/sale-aware-price"

/**
 * Price sentences for the machine-readable surfaces (/llms.txt, /ai-info,
 * pricing.md, index.md). Built from the sale-aware helper at render time, so
 * they agree with the banner; the sale-boundary cron revalidates every page
 * that uses them when a sale starts or ends. No MacWall price is written here.
 */

/** How Stripe Checkout charges: Adaptive Pricing can bill in local currency, so never say USD-only. */
export const CURRENCY_NOTE =
  "Prices are set in USD; Stripe Checkout may show and charge your local currency, and the total is shown before you pay."

/**
 * The running sales, one line per region, each only while it is live:
 * "Current promotion: Black Friday: 30% off Pro and Pro+ until Dec 1, 2026
 * (code BLACKFRIDAY, …)" and "In India: Black Friday: …". Empty outside a sale.
 */
export function currentPromotionLines(now: number = Date.now()): string[] {
  const lines: string[] = []
  const global = currentPromotionLine("default", now)
  if (global) lines.push(`Current promotion: ${global}`)
  const india = currentPromotionLine("india", now)
  if (india) lines.push(`In India: ${india}`)
  return lines
}

/**
 * "$12.99" outside a sale, or "$9.09 (Black Friday price, 30% off until
 * Dec 1, 2026; regular $12.99)" during one.
 */
export function proPriceText(
  region: PricingRegion = "default",
  now: number = Date.now()
): string {
  return priceWithSaleText(proPriceFor(region, now))
}

/** The regular (non-sale) Pro price for a region: "$12.99", "$4.99". */
export function proRegularPriceText(region: PricingRegion = "default"): string {
  return formatPriceCents(proPriceFor(region, 0).regularCents)
}

/**
 * One sentence on Pro and Pro+ for summaries:
 * "Pro is a one-time $12.99 for up to 3 Macs (India $4.99); Pro+ covers 5
 * Macs for $19.99 or 10 Macs for $34.99 (India $7.99 and $12.99)."
 * During a sale every figure is the sale price, and the sentence says so.
 */
export function licenseSummarySentence(now: number = Date.now()): string {
  const global = offersFor("default", now)
  const india = offersFor("india", now)
  const [pro, five, ten] = global
  const [indiaPro, indiaFive, indiaTen] = india
  if (!pro || !five || !ten || !indiaPro || !indiaFive || !indiaTen) return ""
  const price = (p: SaleAwarePrice) => formatPriceCents(p.currentCents)
  const base = `Pro is a one-time ${price(pro)} for up to ${pro.macs} Macs (India ${price(indiaPro)}); Pro+ covers ${five.macs} Macs for ${price(five)} or ${ten.macs} Macs for ${price(ten)} (India ${price(indiaFive)} and ${price(indiaTen)}).`
  const onSale = [...global, ...india].some((p) => p.saleCents !== null)
  return onSale
    ? `${base} These are current sale prices; the regular prices and the end date are under Current promotion.`
    : base
}

/**
 * Markdown table of every pack sold today, with the price now and the
 * regular price for both regions, so the regular figures are always present.
 */
export function licenseTableRows(now: number = Date.now()): string[][] {
  const global = offersFor("default", now)
  const india = offersFor("india", now)
  return global.map((price, index) => {
    const indiaPrice = india[index] ?? price
    const shown = (p: SaleAwarePrice) =>
      p.saleCents === null
        ? formatPriceCents(p.currentCents)
        : `${formatPriceCents(p.currentCents)} (${p.label})`
    return [
      offerPackLabel(price),
      String(price.macs),
      shown(price),
      formatPriceCents(price.regularCents),
      shown(indiaPrice),
      formatPriceCents(indiaPrice.regularCents),
    ]
  })
}

export const LICENSE_TABLE_COLUMNS = [
  "Pack",
  "Macs",
  "Price now",
  "Regular price",
  "India, now",
  "India, regular",
] as const
