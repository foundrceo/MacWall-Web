import "server-only"

import type Stripe from "stripe"

import { netRevenueForAmount } from "@/lib/admin/sales-math"
import { withTtlCache } from "@/lib/admin/ttl-cache"
import { getStripe } from "@/lib/stripe/server"

const CHARGE_CACHE_MS = 60_000
const SMALL_CACHE_MS = 30_000
const MAX_SESSIONS = 2_000

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function centsToUsd(cents: number): number {
  return round2(cents / 100)
}

function metadataString(
  metadata: Stripe.Metadata | null | undefined,
  key: string
): string | null {
  const value = metadata?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export type StripePaidCharge = {
  id: string
  sent_at: string
  amountUsd: number
  netUsd: number
  feeUsd: number
  paymentIntentId: string | null
  checkoutSessionId: string | null
  promoCode: string | null
  planSlug: string | null
  region: string | null
  country: string | null
  recoveredFrom: string | null
}

export type StripePromotionRow = {
  id: string
  code: string
  active: boolean
  timesRedeemed: number
  maxRedemptions: number | null
}

export type StripeBalanceLive = {
  availableUsd: number
  pendingUsd: number
  instantAvailableUsd: number
}

export type StripeLivePayload = {
  charges: StripePaidCharge[]
  promotions: StripePromotionRow[]
  balance: StripeBalanceLive | null
  error?: string
}

/**
 * Checkout Session amount_total is what the customer paid.
 * Adaptive Pricing may present INR, but Stripe still stores these totals in USD.
 */
function sessionAmountUsd(session: Stripe.Checkout.Session): number | null {
  const conversion = session.currency_conversion
  if (
    conversion?.source_currency === "usd" &&
    typeof conversion.amount_total === "number"
  ) {
    return centsToUsd(conversion.amount_total)
  }

  if (typeof session.amount_total !== "number" || session.amount_total <= 0) {
    return null
  }

  if (session.currency === "usd") {
    return centsToUsd(session.amount_total)
  }

  const fxRate = Number(conversion?.fx_rate)
  if (Number.isFinite(fxRate) && fxRate > 0) {
    return round2(session.amount_total / fxRate / 100)
  }

  return null
}

function sessionToPaid(session: Stripe.Checkout.Session): StripePaidCharge | null {
  if (session.status !== "complete" || session.payment_status !== "paid") {
    return null
  }

  const amountUsd = sessionAmountUsd(session)
  if (amountUsd == null || amountUsd <= 0) return null

  const netUsd = netRevenueForAmount(amountUsd)
  const country =
    metadataString(session.metadata, "visitor_country") ??
    session.customer_details?.address?.country ??
    null

  return {
    id: session.id,
    sent_at: new Date(session.created * 1000).toISOString(),
    amountUsd,
    netUsd,
    feeUsd: round2(amountUsd - netUsd),
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    checkoutSessionId: session.id,
    promoCode: metadataString(session.metadata, "promo_code"),
    planSlug: metadataString(session.metadata, "plan_slug"),
    region: metadataString(session.metadata, "pricing_region"),
    country: country ? country.toUpperCase() : null,
    recoveredFrom:
      typeof session.recovered_from === "string" ? session.recovered_from : null,
  }
}

async function listPaidCheckoutSessions(): Promise<StripePaidCharge[]> {
  const stripe = getStripe()
  const paid: StripePaidCharge[] = []

  for await (const session of stripe.checkout.sessions.list({
    limit: 100,
    status: "complete",
  })) {
    const row = sessionToPaid(session)
    if (row) paid.push(row)
    if (paid.length >= MAX_SESSIONS) break
  }

  return paid.sort((a, b) => a.sent_at.localeCompare(b.sent_at))
}

async function listPromotionCodes(): Promise<StripePromotionRow[]> {
  const stripe = getStripe()
  const rows: StripePromotionRow[] = []

  for await (const promo of stripe.promotionCodes.list({ limit: 100 })) {
    rows.push({
      id: promo.id,
      code: promo.code,
      active: promo.active,
      timesRedeemed: promo.times_redeemed,
      maxRedemptions: promo.max_redemptions,
    })
  }

  return rows.sort((a, b) => b.timesRedeemed - a.timesRedeemed)
}

function sumBalance(
  amounts: Array<{ amount: number; currency: string }> | undefined
): number {
  return centsToUsd(
    (amounts ?? [])
      .filter((row) => row.currency === "usd")
      .reduce((sum, row) => sum + row.amount, 0)
  )
}

async function readBalance(): Promise<StripeBalanceLive> {
  const stripe = getStripe()
  const balance = await stripe.balance.retrieve()
  return {
    availableUsd: sumBalance(balance.available),
    pendingUsd: sumBalance(balance.pending),
    instantAvailableUsd: sumBalance(balance.instant_available),
  }
}

export async function fetchStripeLive(): Promise<StripeLivePayload> {
  return withTtlCache("stripe-live", CHARGE_CACHE_MS, async () => {
    try {
      const [charges, promotions, balance] = await Promise.all([
        listPaidCheckoutSessions(),
        withTtlCache("stripe-promos", SMALL_CACHE_MS, listPromotionCodes),
        withTtlCache("stripe-balance", SMALL_CACHE_MS, readBalance).catch(
          () => null
        ),
      ])
      return { charges, promotions, balance }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Stripe request failed"
      return { charges: [], promotions: [], balance: null, error: message }
    }
  })
}
