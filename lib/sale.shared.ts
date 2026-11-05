import type { PricingRegion } from "@/lib/license/offers.shared"

/**
 * Sitewide sales, per pricing region. While one runs for a region, every
 * price that region sees shows the discount and Stripe Checkout applies
 * `code` on its own (unless the buyer brings a bigger code). Each window
 * matches its Stripe promotion code's expiry, so a stale page can't
 * undercharge, and a stated deadline is a real one.
 *
 * To run another sale, create the coupon + promotion code in Stripe and
 * add an entry here. Overlapping entries for one region: the first wins.
 */
export type SiteSaleTheme = "black-friday" | "diwali"

export type SiteSale = {
  id: string
  /** Short label for banners and badges. */
  name: string
  /** Stripe promotion code (customer-facing). */
  code: string
  percentOff: number
  /** ISO timestamps (UTC). */
  startsAt: string
  endsAt: string
  /** Human end date for copy, e.g. "Dec 1". */
  endsLabel: string
  regions: readonly PricingRegion[]
  /** Look of the banner and sale accents. */
  theme: SiteSaleTheme
}

export const SITE_SALES: readonly SiteSale[] = [
  {
    id: "diwali-2026",
    name: "Diwali Sale",
    code: "DIWALI",
    percentOff: 30,
    startsAt: "2026-11-05T00:00:00Z",
    // End of Nov 10, India time. Matches the DIWALI promotion code expiry.
    endsAt: "2026-11-10T18:30:00Z",
    endsLabel: "Nov 10",
    regions: ["india"],
    theme: "diwali",
  },
  {
    id: "black-friday-2026",
    name: "Black Friday",
    code: "BLACKFRIDAY",
    percentOff: 30,
    startsAt: "2026-11-05T00:00:00Z",
    // End of Dec 1, Pacific time. Matches the BLACKFRIDAY code expiry.
    endsAt: "2026-12-02T08:00:00Z",
    endsLabel: "Dec 1",
    regions: ["default"],
    theme: "black-friday",
  },
  {
    // India's Black Friday starts on Black Friday itself (00:00 IST), after
    // the Diwali sale and a gap at full price.
    id: "black-friday-2026-india",
    name: "Black Friday",
    code: "BLACKFRIDAY",
    percentOff: 30,
    startsAt: "2026-11-26T18:30:00Z",
    endsAt: "2026-12-02T08:00:00Z",
    endsLabel: "Dec 1",
    regions: ["india"],
    theme: "black-friday",
  },
]

export function isSaleLive(
  sale: Pick<SiteSale, "startsAt" | "endsAt"> | null | undefined,
  now: number = Date.now()
): boolean {
  if (!sale) return false
  return now >= Date.parse(sale.startsAt) && now < Date.parse(sale.endsAt)
}

/** The sale running right now for a pricing region, if any. */
export function activeSiteSale(
  region: PricingRegion,
  now: number = Date.now()
): SiteSale | null {
  return (
    SITE_SALES.find(
      (sale) => sale.regions.includes(region) && isSaleLive(sale, now)
    ) ?? null
  )
}

/** True while any region has a sale (reserves the banner slot). */
export function anySiteSaleLive(now: number = Date.now()): boolean {
  return SITE_SALES.some((sale) => isSaleLive(sale, now))
}

/**
 * USD cents after the sale discount. Rounds the same way Stripe rounds a
 * percent-off coupon (discount to the nearest cent), so the site and
 * Checkout show the same total.
 */
export function applySaleCents(cents: number, percentOff: number): number {
  if (percentOff <= 0) return cents
  return cents - Math.round((cents * percentOff) / 100)
}
