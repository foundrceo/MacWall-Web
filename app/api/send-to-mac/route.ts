import { after, NextResponse } from "next/server"

import { trackSiteEvent } from "@/lib/analytics/track-server"
import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"
import { readBoundedJson, RequestBodyError } from "@/lib/http/bounded-json"
import { consumePublicQuota, consumePublicSubjectQuota } from "@/lib/http/public-quota"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Each request sends real email: keep it tight per IP and per address.
const checkIpLimit = createInMemoryRateLimiter({ max: 5, windowMs: 60 * 60_000 })

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i

/**
 * "Email me the link" for phones and Windows, which can't open the DMG. The
 * Supabase `send-to-mac` function sends it (it holds the Resend key and the
 * suppression checks) plus one reminder a day later.
 */
export async function POST(request: Request) {
  if (checkIpLimit(clientIpFromRequest(request)).limited) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  let body: { email?: unknown; wallpaperName?: unknown; wallpaperPath?: unknown; sessionId?: unknown }
  try {
    body = await readBoundedJson(request, 4096)
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof RequestBodyError ? error.message : "invalid_json" },
      { status: error instanceof RequestBodyError ? error.status : 400 }
    )
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  const origin = getCatalogSupabaseOrigin()
  const secret = process.env.CRON_SECRET?.trim()
  if (!origin || !secret) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 })
  }

  // Shared counters survive cold starts and concurrent Vercel instances.
  try {
    if (!(await consumePublicQuota(request, "send_to_mac_ip", 5, 3600))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
    }
    if (!(await consumePublicSubjectQuota(`email:${email}`, "send_to_mac_email", 3, 86400))) {
      return NextResponse.json({ ok: false, error: "too_many" }, { status: 429 })
    }
  } catch {
    return NextResponse.json({ ok: false, error: "temporarily_unavailable" }, { status: 503 })
  }

  const res = await fetch(`${origin}/functions/v1/send-to-mac`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": secret },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      email,
      wallpaperName: body.wallpaperName,
      wallpaperPath: body.wallpaperPath,
    }),
  }).catch(() => null)

  if (!res?.ok) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 })
  }
  // The function answers 200 with `sent: false` when the address can't get mail.
  const result = (await res.json().catch(() => null)) as { sent?: boolean; reason?: string } | null
  if (result?.sent !== true) {
    return NextResponse.json(
      { ok: false, error: result?.reason === "undeliverable" ? "undeliverable" : "send_failed" },
      { status: 422 }
    )
  }

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.length <= 64 ? body.sessionId : null
  after(() =>
    trackSiteEvent({
      eventName: "send_to_mac_email",
      path: "/api/send-to-mac",
      userAgent: request.headers.get("user-agent"),
      sessionId,
      metadata: { has_wallpaper: typeof body.wallpaperPath === "string" },
    })
  )

  return NextResponse.json({ ok: true })
}
