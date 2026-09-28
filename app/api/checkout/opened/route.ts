import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 20, windowMs: 60_000 })

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]{10,200}$/

/**
 * The buyer clicked through to Stripe Checkout. Sessions warmed on hover are
 * created as "prefetch"; this marks the one they actually opened so that, if
 * it expires unpaid, the checkout-recovery email is allowed.
 */
export async function POST(request: Request) {
  if (checkRateLimit(clientIpFromRequest(request)).limited) {
    return new NextResponse(null, { status: 429 })
  }

  let sessionId = ""
  try {
    const body = (await request.json()) as { session_id?: unknown }
    sessionId = typeof body.session_id === "string" ? body.session_id.trim() : ""
  } catch {
    sessionId = ""
  }
  if (!SESSION_ID.test(sessionId)) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin()
    .from("macwall_checkout_opens")
    .upsert(
      { checkout_session_id: sessionId },
      { onConflict: "checkout_session_id", ignoreDuplicates: true }
    )
  if (error) {
    console.error("[checkout/opened]", error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
