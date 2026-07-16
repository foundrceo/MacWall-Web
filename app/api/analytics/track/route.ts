import { NextResponse } from "next/server"

import {
  isSiteAnalyticsEventName,
  type SiteAnalyticsMetadata,
} from "@/lib/analytics/events"
import { trackSiteEvent } from "@/lib/analytics/track-server"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { HttpRequestError, readJsonRequestBody } from "@/lib/http/request"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 120
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
      eventName?: string
      path?: string
      referrer?: string
      sessionId?: string
      metadata?: SiteAnalyticsMetadata
    }>(request, { maxBytes: MAX_BODY_BYTES })

    const eventName = body.eventName?.trim() ?? ""
    if (!isSiteAnalyticsEventName(eventName)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 })
    }

    await trackSiteEvent({
      eventName,
      path: body.path?.slice(0, 512) ?? null,
      referrer: body.referrer?.slice(0, 512) ?? null,
      userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
      sessionId: body.sessionId?.slice(0, 128) ?? null,
      metadata: sanitizeMetadata(body.metadata),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof HttpRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

function sanitizeMetadata(
  metadata: SiteAnalyticsMetadata | undefined
): SiteAnalyticsMetadata {
  if (!metadata || typeof metadata !== "object") return {}

  const clean: SiteAnalyticsMetadata = {}
  for (const [key, value] of Object.entries(metadata).slice(0, 12)) {
    if (key.length > 48) continue
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      clean[key] = typeof value === "string" ? value.slice(0, 256) : value
    }
  }
  return clean
}
