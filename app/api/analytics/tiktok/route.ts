import { NextResponse } from "next/server"

import { isTikTokTrackEvent } from "@/lib/analytics/tiktok-shared"
import { sendTikTokServerEvent } from "@/lib/analytics/tiktok-server"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { HttpRequestError, readJsonRequestBody } from "@/lib/http/request"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 60
const MAX_BODY_BYTES = 16 * 1024
const checkRateLimit = createInMemoryRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

export async function POST(request: Request) {
  try {
    const ip = clientIpFromRequest(request)
    const rateLimit = checkRateLimit(ip)

    if (rateLimit.limited) {
      return NextResponse.json(
        { ok: false },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const body = await readJsonRequestBody<{
      event?: string
      eventId?: string
      url?: string
      sessionId?: string
      email?: string
      phone?: string
      ttclid?: string
      ttp?: string
      searchString?: string
    }>(request, { maxBytes: MAX_BODY_BYTES })

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
      return NextResponse.json({ ok: false }, { status: 502 })
    }

    return NextResponse.json({ ok: true, skipped: result.skipped ?? false })
  } catch (error) {
    if (error instanceof HttpRequestError) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: error.status }
      )
    }
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
