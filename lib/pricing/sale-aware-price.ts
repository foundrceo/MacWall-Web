import {
  LICENSE_OFFERS,
  formatUsd,
  licenseOfferPriceCents,
  type LicenseOfferSlug,
  type PricingRegion,
} from "@/lib/license/offers.shared"
import {
  SITE_SALES,
  activeSiteSale,
  applySaleCents,
  type SiteSale,
} from "@/lib/sale.shared"

/**
 * Sale-aware MacWall prices for server-rendered copy, llms.txt / Markdown
 * twins and JSON-LD. Every MacWall price a crawler or AI engine can read
 * comes from here, so it always matches the visible sale banner: the catalog
 * is `LICENSE_OFFERS`, the sale calendar is `SITE_SALES`.
 *
 * A price is right for the moment the page renders. Cached pages re-render
 * within one cron tick of a sale starting or ending: /api/cron/sale-boundary
 * revalidates the site when `saleBoundariesBetween` finds a boundary.
 *
 * Interactive prices in the visitor's local currency come from
 * lib/pricing/marketing-pricing.ts on the client instead.
 */

/** Packs sold today, smallest first. Annual and 15/20-Mac packs are retired. */
export const CURRENT_OFFER_SLUGS = [
  "permanent",
  "permanent_5",
  "permanent_10",
] as const satisfies readonly LicenseOfferSlug[]

export type SaleAwarePrice = {
  slug: LicenseOfferSlug
  /** Catalog name: "Pro", "Pro+ (5 Macs)", "Pro+ (10 Macs)". */
  name: string
  /** Macs one license activates. */
  macs: number
  region: PricingRegion
  /** Full price, USD cents. */
  regularCents: number
  /** Price while a sale runs (Stripe's rounding), USD cents; null otherwise. */
  saleCents: number | null
  /** What checkout charges right now: `saleCents ?? regularCents`. */
  currentCents: number
  /** Sale end, ISO UTC. Null outside a sale. */
  endsAt: string | null
  /** Promotion code checkout applies on its own. Null outside a sale. */
  code: string | null
  /** Sale name for copy, e.g. "Black Friday". Null outside a sale. */
  label: string | null
  percentOff: number | null
  /** End date as the banner says it, e.g. "Dec 1". Null outside a sale. */
  endsLabel: string | null
}

/** Price of one pack for a region at `now`, with the running sale applied. */
export function offerPriceFor(
  slug: LicenseOfferSlug,
  region: PricingRegion = "default",
  now: number = Date.now()
): SaleAwarePrice {
  return priceWithSale(slug, region, activeSiteSale(region, now))
}

/** Pro (3 Macs): the headline price. */
export function proPriceFor(
  region: PricingRegion = "default",
  now: number = Date.now()
): SaleAwarePrice {
  return offerPriceFor("permanent", region, now)
}

/** Pro, Pro+ (5 Macs) and Pro+ (10 Macs), in that order. */
export function offersFor(
  region: PricingRegion = "default",
  now: number = Date.now()
): SaleAwarePrice[] {
  const sale = activeSiteSale(region, now)
  return CURRENT_OFFER_SLUGS.map((slug) => priceWithSale(slug, region, sale))
}

function priceWithSale(
  slug: LicenseOfferSlug,
  region: PricingRegion,
  sale: SiteSale | null
): SaleAwarePrice {
  const offer = LICENSE_OFFERS[slug]
  const regularCents = licenseOfferPriceCents(offer, region)
  const saleCents = sale ? applySaleCents(regularCents, sale.percentOff) : null
  return {
    slug,
    name: offer.name,
    macs: offer.maxDevices,
    region,
    regularCents,
    saleCents,
    currentCents: saleCents ?? regularCents,
    endsAt: sale?.endsAt ?? null,
    code: sale?.code ?? null,
    label: sale?.name ?? null,
    percentOff: sale?.percentOff ?? null,
    endsLabel: sale?.endsLabel ?? null,
  }
}

/** "$12.99". Every MacWall price is set in USD. */
export function formatPriceCents(cents: number): string {
  return formatUsd(cents)
}

/** "12.99", the form schema.org `price` takes. */
export function schemaPriceAmount(cents: number): string {
  return (cents / 100).toFixed(2)
}

/** "Pro (3 Macs)", "Pro+ (5 Macs)". */
export function offerPackLabel(price: SaleAwarePrice): string {
  return /\bMacs?\b/.test(price.name)
    ? price.name
    : `${price.name} (${price.macs} Macs)`
}

/**
 * Last calendar day a sale runs anywhere on Earth (UTC-12), as YYYY-MM-DD.
 * Matches the banner's `endsLabel`: BLACKFRIDAY ends 2026-12-02T08:00Z,
 * which is still Dec 1 in the Americas.
 */
export function saleLastDay(endsAt: string): string {
  const lastMoment = Date.parse(endsAt) - 1
  return new Date(lastMoment - 12 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** "Dec 1, 2026": the banner's end date with its year, for prose. */
function saleEndsText(price: SaleAwarePrice): string | null {
  if (!price.endsAt || !price.endsLabel) return null
  return `${price.endsLabel}, ${saleLastDay(price.endsAt).slice(0, 4)}`
}

/**
 * The current price for prose, with its sale context while one runs:
 * "$9.09 (Black Friday price, 30% off until Dec 1, 2026; regular $12.99)",
 * or "$12.99". Callers still say "one-time" or "paid once" next to it.
 */
export function priceWithSaleText(price: SaleAwarePrice): string {
  const current = formatPriceCents(price.currentCents)
  const ends = saleEndsText(price)
  if (price.saleCents === null || !ends) return current
  return `${current} (${price.label} price, ${price.percentOff}% off until ${ends}; regular ${formatPriceCents(price.regularCents)})`
}

/**
 * One line on the running sale for llms.txt, /ai-info and pricing.md, or
 * null when no sale runs for the region:
 * "Black Friday: 30% off Pro and Pro+ until Dec 1, 2026 (code BLACKFRIDAY,
 * applied automatically at checkout). Pro (3 Macs) $9.09 instead of $12.99;
 * Pro+ (5 Macs) $13.99 instead of $19.99; Pro+ (10 Macs) $24.49 instead of
 * $34.99."
 */
export function currentPromotionLine(
  region: PricingRegion = "default",
  now: number = Date.now()
): string | null {
  const offers = offersFor(region, now)
  const [pro] = offers
  const ends = pro ? saleEndsText(pro) : null
  if (!pro || pro.saleCents === null || !ends) return null
  const packs = offers
    .map(
      (price) =>
        `${offerPackLabel(price)} ${formatPriceCents(price.currentCents)} instead of ${formatPriceCents(price.regularCents)}`
    )
    .join("; ")
  return `${pro.label}: ${pro.percentOff}% off Pro and Pro+ until ${ends} (code ${pro.code}, applied automatically at checkout). ${packs}.`
}

/**
 * schema.org `Offer` price fields. While a sale runs, `price` is the sale
 * price (what checkout charges), `priceValidUntil` its last day, and the
 * regular price rides along as a StrikethroughPrice; otherwise only the
 * regular price. Spread into an Offer next to its name, url and seller.
 */
export function schemaOfferPricing(price: SaleAwarePrice):
  | { price: string; priceCurrency: "USD" }
  | {
      price: string
      priceCurrency: "USD"
      priceValidUntil: string
      priceSpecification: {
        "@type": "UnitPriceSpecification"
        priceType: "https://schema.org/StrikethroughPrice"
        price: string
        priceCurrency: "USD"
      }
    } {
  const base = {
    price: schemaPriceAmount(price.currentCents),
    priceCurrency: "USD" as const,
  }
  if (price.saleCents === null || !price.endsAt) return base
  return {
    ...base,
    priceValidUntil: saleLastDay(price.endsAt),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/StrikethroughPrice",
      price: schemaPriceAmount(price.regularCents),
      priceCurrency: "USD",
    },
  }
}

export type SaleBoundary = {
  saleId: string
  name: string
  kind: "start" | "end"
  /** ISO UTC instant the price changes. */
  at: string
  regions: readonly PricingRegion[]
}

/**
 * How far back /api/cron/sale-boundary looks on each run: its 5-minute
 * schedule plus a minute of slack, so every boundary lands in one run.
 */
export const SALE_BOUNDARY_LOOKBACK_MS = 6 * 60 * 1000

/**
 * Sale starts and ends in `(fromMs, toMs]`, oldest first: the boundaries a
 * run at `toMs` acts on. Windows are start-inclusive and end-exclusive
 * (`isSaleLive`), so at the boundary instant itself prices have changed.
 */
export function saleBoundariesBetween(
  fromMs: number,
  toMs: number,
  sales: readonly SiteSale[] = SITE_SALES
): SaleBoundary[] {
  const boundaries: SaleBoundary[] = []
  for (const sale of sales) {
    for (const kind of ["start", "end"] as const) {
      const at = kind === "start" ? sale.startsAt : sale.endsAt
      const ms = Date.parse(at)
      if (ms > fromMs && ms <= toMs) {
        boundaries.push({
          saleId: sale.id,
          name: sale.name,
          kind,
          at,
          regions: sale.regions,
        })
      }
    }
  }
  return boundaries.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}
