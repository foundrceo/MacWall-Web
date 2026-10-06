import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { isZeroDecimalCurrency } from "@/lib/pricing/money"
import { getStripe } from "@/lib/stripe/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 30, windowMs: 60_000 })

/**
 * Verifies a Stripe Checkout Session is paid before the client deep-links
 * a license key or fires purchase conversions.
 *
 * Prefer Adaptive Pricing presentment (what the customer paid) for ads value.
 * Fall back to integration currency (USD) when presentment is absent.
 */
export async function GET(request: Request) {
  const rate = checkRateLimit(clientIpFromRequest(request))
  if (rate.limited) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim()
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 })
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const paid = session.payment_status === "paid"

    if (!paid) {
      return NextResponse.json(
        { ok: false, paid: false, error: "not_paid" },
        { status: 402 }
      )
    }

    const licenseKey = session.metadata?.license_key?.trim() || null
    const presentment = session.presentment_details
    const amountMinor =
      typeof presentment?.presentment_amount === "number"
        ? presentment.presentment_amount
        : session.amount_total
    const currency = (
      presentment?.presentment_currency ||
      session.currency ||
      "usd"
    ).toLowerCase()
    const amountMajor =
      typeof amountMinor === "number"
        ? isZeroDecimalCurrency(currency)
          ? amountMinor
          : amountMinor / 100
        : null

    return NextResponse.json({
      ok: true,
      paid: true,
      licenseKey,
      /** Minor units (cents / paise). Prefer presentment when Adaptive Pricing applied. */
      amountTotal: amountMinor,
      /** Major units ready for ads pixels (handles zero-decimal currencies). */
      amountMajor,
      currency: currency.toUpperCase(),
      offerSlug: session.metadata?.offer_slug ?? null,
    })
  } catch (error) {
    console.error(
      "[checkout/verify]",
      error instanceof Error ? error.message : "verify failed"
    )
    return NextResponse.json({ error: "verify_failed" }, { status: 502 })
  }
}
