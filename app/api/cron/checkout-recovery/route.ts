import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Vercel Cron → Supabase `process-checkout-recovery`.
 * Sends WALL10 conversion mail for abandoned / failed / incomplete checkouts.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "missing_cron_secret" }, { status: 500 })
  }

  const auth = request.headers.get("authorization")?.trim()
  const vercelCron = request.headers.get("x-vercel-cron")?.trim()
  const authorized =
    vercelCron === "1" ||
    (auth?.startsWith("Bearer ") && auth.slice(7) === cronSecret)

  if (!authorized) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  if (!supabaseUrl) {
    return NextResponse.json({ ok: false, error: "missing_supabase_url" }, { status: 500 })
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/process-checkout-recovery`

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
      return NextResponse.json(
        { ok: false, status: res.status, body },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, body })
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
