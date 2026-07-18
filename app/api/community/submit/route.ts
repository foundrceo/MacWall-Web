import { NextResponse } from "next/server"

import {
  COMMUNITY_MAX_DURATION_SECONDS,
  COMMUNITY_MAX_VIDEO_BYTES,
  validateResolutionString,
  validateSubmitCategory,
  validateSubmitTitle,
  validateVideoExtension,
} from "@/lib/community/submit-validation"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { r2ObjectExists } from "@/lib/storage/r2"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const maxDuration = 30

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const checkRateLimit = createInMemoryRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

type SubmitRequest = {
  uploadId?: unknown
  visitorId?: unknown
  title?: unknown
  category?: unknown
  videoExtension?: unknown
  resolution?: unknown
  durationSeconds?: unknown
  fileSizeBytes?: unknown
}

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

/** Register an anonymous community wallpaper submission after the R2 upload completes. */
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

  let body: SubmitRequest
  try {
    body = (await request.json()) as SubmitRequest
  } catch {
    return bad(400, "invalid_json")
  }

  const uploadId =
    typeof body.uploadId === "string" ? body.uploadId.trim().toLowerCase() : ""
  if (!UUID_RE.test(uploadId)) {
    return bad(400, "invalid_upload_id")
  }

  const visitorId =
    typeof body.visitorId === "string" ? body.visitorId.trim().toLowerCase() : ""
  if (!UUID_RE.test(visitorId)) {
    return bad(400, "invalid_visitor_id")
  }

  const titleInput = typeof body.title === "string" ? body.title : ""
  const titleResult = validateSubmitTitle(titleInput)
  if (!titleResult.ok) {
    return bad(400, "invalid_title")
  }

  const category =
    typeof body.category === "string" ? body.category.trim() : ""
  if (!validateSubmitCategory(category)) {
    return bad(400, "invalid_category")
  }

  const extResult = validateVideoExtension(
    typeof body.videoExtension === "string" ? body.videoExtension : ""
  )
  if (!extResult.ok) {
    return bad(400, "invalid_video_extension")
  }
  const ext = extResult.ext

  const resolution =
    typeof body.resolution === "string" ? body.resolution.trim() : ""
  const resolutionResult = validateResolutionString(resolution)
  if (!resolutionResult.ok) {
    return bad(400, "invalid_resolution")
  }

  const durationSeconds = Number(body.durationSeconds)
  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0 ||
    durationSeconds > COMMUNITY_MAX_DURATION_SECONDS
  ) {
    return bad(400, "invalid_duration")
  }

  const fileSizeBytes = Number(body.fileSizeBytes)
  if (
    !Number.isSafeInteger(fileSizeBytes) ||
    fileSizeBytes <= 0 ||
    fileSizeBytes > COMMUNITY_MAX_VIDEO_BYTES
  ) {
    return bad(400, "invalid_file_size")
  }

  const videoKey = `community-pending/${uploadId}/video.${ext}`
  const thumbKey = `community-pending/${uploadId}/thumb.jpg`

  try {
    const [videoExists, thumbExists] = await Promise.all([
      r2ObjectExists(videoKey),
      r2ObjectExists(thumbKey),
    ])
    if (!videoExists || !thumbExists) {
      return bad(400, "upload_not_found")
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("community_uploads").upsert(
      {
        id: uploadId,
        submitter_id: visitorId,
        title: titleResult.normalized,
        category,
        video_key: videoKey,
        thumb_key: thumbKey,
        resolution,
        duration_seconds: Math.round(durationSeconds),
        file_size_bytes: fileSizeBytes,
        status: "pending",
      },
      { onConflict: "id", ignoreDuplicates: true }
    )

    if (error) {
      return bad(500, error.message)
    }

    return NextResponse.json({ ok: true, uploadId, status: "pending" })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to register submission"
    return bad(500, message)
  }
}
