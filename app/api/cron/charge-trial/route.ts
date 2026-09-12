import { NextResponse } from "next/server"

import { secretsEqual } from "@/lib/http/secrets"
import { chargeDueMacWallTrials } from "@/lib/stripe/charge-due-trials"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Vercel Cron — create one off-session PaymentIntent per expired 24h trial.
 * Auth is CRON_SECRET only.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "missing_cron_secret" }, { status: 500 })
  }

  const auth = request.headers.get("authorization")?.trim()
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token || !secretsEqual(token, cronSecret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  try {
    const result = await chargeDueMacWallTrials()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "charge_trial_failed",
      },
      { status: 502 }
    )
  }
}
