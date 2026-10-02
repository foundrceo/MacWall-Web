import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { getCashfreeOrder } from "@/lib/cashfree/server"
import { isZeroDecimalCurrency } from "@/lib/pricing/money"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 30, windowMs: 60_000 })

const LICENSE_KEY = /^MW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

/**
 * Whop checkouts return to /activate?key=…&provider=whop. The
 * `whop-license-email` webhook flips the license to `active` once Whop
 * confirms payment, so the page polls here while it is still `pending`.
 */
async function verifyWhopLicense(rawKey: string | null) {
  const licenseKey = rawKey?.trim().toUpperCase() ?? ""
  if (!LICENSE_KEY.test(licenseKey)) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from("macwall_licenses")
    .select("status, source")
    .eq("license_key", licenseKey)
    .maybeSingle()
  if (error) {
    console.error("[checkout/verify] whop lookup", error.message)
    return NextResponse.json({ error: "verify_failed" }, { status: 502 })
  }
  if (data?.status === "active") {
    return NextResponse.json({
      ok: true,
      paid: true,
      licenseKey,
      amountTotal: null,
      amountMajor: null,
      currency: null,
      offerSlug: null,
    })
  }
  if (!data || data.status === "pending") {
    // Not confirmed yet (or the pending row is still being written).
    return NextResponse.json({ ok: false, paid: false, pending: true }, { status: 202 })
  }
  return NextResponse.json(
    { ok: false, paid: false, error: "not_paid" },
    { status: 402 }
  )
}

/**
 * Cashfree (India) returns to /activate?key=…&provider=cashfree after the
 * return route has confirmed and activated the order. Reports the rupees
 * actually paid so purchase pixels get the real value.
 */
async function verifyCashfreeLicense(rawKey: string | null) {
  const licenseKey = rawKey?.trim().toUpperCase() ?? ""
  if (!LICENSE_KEY.test(licenseKey)) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from("macwall_licenses")
    .select("status, cashfree_order_id")
    .eq("license_key", licenseKey)
    .eq("source", "cashfree")
    .maybeSingle()
  if (error) {
    console.error("[checkout/verify] cashfree lookup", error.message)
    return NextResponse.json({ error: "verify_failed" }, { status: 502 })
  }
  if (!data || data.status === "pending") {
    return NextResponse.json({ ok: false, paid: false, pending: true }, { status: 202 })
  }
  if (data.status !== "active") {
    return NextResponse.json(
      { ok: false, paid: false, error: "not_paid" },
      { status: 402 }
    )
  }

  let amountMajor: number | null = null
  let currency: string | null = null
  if (data.cashfree_order_id) {
    try {
      const order = await getCashfreeOrder(data.cashfree_order_id)
      amountMajor = order.order_amount
      currency = order.order_currency
    } catch {
      // Value is a nice-to-have for pixels; the purchase is confirmed.
    }
  }
  return NextResponse.json({
    ok: true,
    paid: true,
    licenseKey,
    amountTotal: amountMajor == null ? null : Math.round(amountMajor * 100),
    amountMajor,
    currency,
    offerSlug: null,
  })
}

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

  const params = new URL(request.url).searchParams
  const provider = params.get("provider")
  if (provider === "whop") return verifyWhopLicense(params.get("key"))
  if (provider === "cashfree") return verifyCashfreeLicense(params.get("key"))

  const sessionId = params.get("session_id")?.trim()
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
