/**
 * Sitewide sale. While it runs, every price on the site shows the discount
 * and Stripe Checkout applies `code` on its own (unless the buyer brings a
 * bigger code). The window is enforced on both ends: the Stripe promotion
 * code expires at `endsAt` too, so a stale page can't undercharge.
 *
 * To run another sale, create the coupon + promotion code in Stripe and
 * change this object. Set it to `null` to turn sales off.
 */
export type SiteSale = {
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
}

export const SITE_SALE: SiteSale | null = {
  name: "Black Friday",
  code: "BLACKFRIDAY",
  percentOff: 30,
  startsAt: "2026-11-05T00:00:00Z",
  // End of Dec 1, Pacific time. Matches the Stripe promotion code expiry.
  endsAt: "2026-12-02T08:00:00Z",
  endsLabel: "Dec 1",
}

export function isSaleLive(
  sale: Pick<SiteSale, "startsAt" | "endsAt"> | null | undefined,
  now: number = Date.now()
): boolean {
  if (!sale) return false
  return now >= Date.parse(sale.startsAt) && now < Date.parse(sale.endsAt)
}

/** The sale running right now, if any. */
export function activeSiteSale(now: number = Date.now()): SiteSale | null {
  return isSaleLive(SITE_SALE, now) ? SITE_SALE : null
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
