/** Shared fee math. Kept out of sales.ts so Stripe live can import it. */

export function netRevenueForAmount(
  amountUsd: number,
  feePercent = Number.parseFloat(process.env.STRIPE_FEE_PERCENT ?? "2.9"),
  feeFixed = Number.parseFloat(process.env.STRIPE_FEE_FIXED ?? "0.30")
): number {
  const fee = amountUsd * (feePercent / 100) + feeFixed
  return Math.max(0, amountUsd - fee)
}
