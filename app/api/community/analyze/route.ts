import { NextResponse } from "next/server"

import { analyzeWallpaperMetadataBatch } from "@/lib/admin/wallpaper-ai-metadata"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 12
const checkRateLimit = createInMemoryRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

const TITLE_MAX = 140

type AnalyzeRequest = {
  thumbDataUrl?: unknown
  sourceFileName?: unknown
  initialName?: unknown
  initialCategory?: unknown
}

function optionalString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

/**
 * Public, key-safe AI metadata suggestion for community submissions.
 *
 * Reuses the same OpenAI vision pipeline as the admin bulk uploader, but is
 * rate limited per IP, requires no admin auth, and only ever accepts a single
 * client-captured thumbnail (never the full video). The OpenAI key stays on
 * the server. Failures are intentionally surfaced as plain errors so the
 * client can fall back to manual entry without blocking the upload.
 */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    )
  }

  let body: AnalyzeRequest
  try {
    body = (await request.json()) as AnalyzeRequest
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const thumbDataUrl =
    typeof body.thumbDataUrl === "string" ? body.thumbDataUrl : ""
  if (!thumbDataUrl) {
    return NextResponse.json({ error: "thumbnail_required" }, { status: 400 })
  }

  try {
    const result = await analyzeWallpaperMetadataBatch([
      {
        clientId: "community",
        sourceFileName: optionalString(body.sourceFileName, 200),
        initialName: optionalString(body.initialName, TITLE_MAX),
        initialCategory: optionalString(body.initialCategory, 64),
        initialTags: [],
        thumbDataUrl,
      },
    ])

    const item = result.items[0]
    if (!item) {
      return NextResponse.json({ error: "no_suggestion" }, { status: 502 })
    }

    return NextResponse.json({
      name: item.name,
      category: item.category,
      tags: item.tags,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "analysis_failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
