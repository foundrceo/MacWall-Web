import { NextResponse } from "next/server"

import { processTrialEndedEmails } from "@/lib/email/process-trial-ended"
import { secretsEqual } from "@/lib/http/secrets"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

async function proxyToEdge(cronSecret: string): Promise<NextResponse> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  if (!supabaseUrl) {
    return NextResponse.json({ ok: false, error: "missing_supabase_url" }, { status: 500 })
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/process-trial-ended-emails`
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret,
      },
      body: "{}",
      cache: "no-store",
    })
    const body = (await res.json().catch(() => null)) as unknown
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body }, { status: 502 })
    }
    return NextResponse.json({ ok: true, via: "edge", body })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "cron_proxy_failed",
      },
      { status: 502 }
    )
  }
}

/**
 * Vercel Cron: mail Continue-free trial leads who did not buy.
 * Prefers Resend + React Email on this host. Falls back to the Edge Function
 * if RESEND_API_KEY is not set here.
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

  if (!process.env.RESEND_API_KEY?.trim()) {
    return proxyToEdge(cronSecret)
  }

  try {
    const body = await processTrialEndedEmails()
    return NextResponse.json({ ...body, via: "resend" })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "trial_ended_failed",
      },
      { status: 500 }
    )
  }
}
