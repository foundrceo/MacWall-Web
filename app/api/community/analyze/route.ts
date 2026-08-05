import { NextResponse } from "next/server"

import { analyzeWallpaperMetadataBatch } from "@/lib/admin/wallpaper-ai-metadata"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const checkRateLimit = createInMemoryRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

const TITLE_MAX = 140
const THUMB_DATA_URL_MAX_CHARS = 400_000

type AnalyzeRequest = {
  thumbDataUrl?: unknown
  sourceFileName?: unknown
  initialName?: unknown
  initialCategory?: unknown
  /** When true (default), invent a fresh title from the thumbnail instead of polishing a draft. */
  generate?: unknown
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
 * the server. Failures are intentionally opaque so clients can fall back to
 * manual entry without leaking provider details.
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
  if (
    !thumbDataUrl.startsWith("data:image/") ||
    thumbDataUrl.length > THUMB_DATA_URL_MAX_CHARS
  ) {
    return NextResponse.json({ error: "invalid_thumbnail" }, { status: 400 })
  }

  // Default = generate a fresh catalog title from the thumbnail.
  // Only pass a title draft through when the client opts out of generate
  // (e.g. user already typed a name they want the model to respect).
  const generate =
    body.generate === undefined || body.generate === null
      ? true
      : Boolean(body.generate)
  const userTitle = optionalString(body.initialName, TITLE_MAX)
  const categoryHint = optionalString(body.initialCategory, 64)

  try {
    const result = await analyzeWallpaperMetadataBatch([
      {
        clientId: "community",
        sourceFileName: optionalString(body.sourceFileName, 200),
        initialName: generate ? "" : userTitle,
        initialCategory: generate ? "" : categoryHint,
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
  } catch {
    return NextResponse.json({ error: "analysis_failed" }, { status: 502 })
  }
}
