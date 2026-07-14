import { NextResponse } from "next/server"

import { isTikTokTrackEvent } from "@/lib/analytics/tiktok-shared"
import { sendTikTokServerEvent } from "@/lib/analytics/tiktok-server"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 60
const hits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body = (await request.json()) as {
      event?: string
      eventId?: string
      url?: string
      sessionId?: string
      email?: string
      phone?: string
      ttclid?: string
      ttp?: string
      searchString?: string
    }

    const event = body.event?.trim() ?? ""
    if (!isTikTokTrackEvent(event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 })
    }

    const eventId = body.eventId?.trim() ?? ""
    const url = body.url?.trim() ?? ""
    if (!eventId || !url) {
      return NextResponse.json(
        { error: "Missing eventId or url" },
        { status: 400 }
      )
    }

    const result = await sendTikTokServerEvent({
      event,
      eventId: eventId.slice(0, 128),
      url: url.slice(0, 2048),
      ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
      referrer: request.headers.get("referer")?.slice(0, 512) ?? null,
      sessionId: body.sessionId?.slice(0, 128) ?? null,
      email: body.email?.slice(0, 256) ?? null,
      phone: body.phone?.slice(0, 64) ?? null,
      ttclid: body.ttclid?.slice(0, 512) ?? null,
      ttp: body.ttp?.slice(0, 512) ?? null,
      searchString: body.searchString?.slice(0, 256) ?? null,
    })

    if (!result.ok && !result.skipped) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, skipped: result.skipped ?? false })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
