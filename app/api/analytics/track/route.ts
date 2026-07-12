import { NextResponse } from "next/server"

import {
  isSiteAnalyticsEventName,
  type SiteAnalyticsMetadata,
} from "@/lib/analytics/events"
import { trackSiteEvent } from "@/lib/analytics/track-server"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 120
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

    const body = (await readTrackRequestBody(request)) as {
      eventName?: string
      path?: string
      referrer?: string
      sessionId?: string
      metadata?: SiteAnalyticsMetadata
    }

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
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

async function readTrackRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return request.json()
  }

  const raw = await request.text()
  if (!raw.trim()) return {}
  return JSON.parse(raw) as unknown
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
      clean[key] =
        typeof value === "string" ? value.slice(0, 256) : (value as never)
    }
  }
  return clean
}
