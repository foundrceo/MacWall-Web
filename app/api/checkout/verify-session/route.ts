import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { getStripe } from "@/lib/stripe/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 30, windowMs: 60_000 })

/**
 * Verifies a Stripe Checkout Session is paid before the client deep-links
 * a license key or fires purchase conversions.
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
    const paid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"

    if (!paid) {
      return NextResponse.json(
        { ok: false, paid: false, error: "not_paid" },
        { status: 402 }
      )
    }

    const licenseKey = session.metadata?.license_key?.trim() || null
    const amountTotal = session.amount_total
    const currency = session.currency?.toUpperCase() || "USD"

    return NextResponse.json({
      ok: true,
      paid: true,
      licenseKey,
      amountTotal,
      currency,
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
