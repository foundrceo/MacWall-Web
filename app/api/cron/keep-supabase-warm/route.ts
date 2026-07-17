import { NextResponse } from "next/server"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const maxDuration = 30
export const dynamic = "force-dynamic"

/**
 * Daily keep-alive for the Supabase Free project (prevents the 1-week
 * inactivity pause) plus rolling analytics pruning to stay under the 500 MB
 * Free-tier database limit. Triggered by a Vercel cron (see vercel.json).
 *
 * Protected by `CRON_SECRET` when set (Vercel sends it as a Bearer token).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (secret) {
    const auth = request.headers.get("authorization")?.trim()
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  }

  const result: Record<string, unknown> = {
    ok: true,
    at: new Date().toISOString(),
  }

  try {
    const supabase = getSupabaseAdmin()

    const ping = await supabase.from("wallpapers").select("id").limit(1)
    result.ping = ping.error ? `error: ${ping.error.message}` : "ok"

    const pruned = await supabase.rpc("prune_site_analytics_events", {
      p_retention_days: 90,
    })
    result.pruned = pruned.error ? `error: ${pruned.error.message}` : pruned.data
  } catch (error) {
    result.ok = false
    result.error = error instanceof Error ? error.message : String(error)
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result)
}
