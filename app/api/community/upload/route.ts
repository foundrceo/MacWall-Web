import { NextResponse } from "next/server"

import {
  COMMUNITY_VIDEO_CONTENT_TYPES,
  validateVideoExtension,
  videoContentTypeForExtension,
} from "@/lib/community/submit-validation"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { r2PresignPutUrl } from "@/lib/storage/r2"

export const runtime = "nodejs"
export const maxDuration = 30

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Short-lived presign — the client uploads immediately after requesting it. */
const PRESIGN_EXPIRY_SECONDS = 15 * 60

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const checkRateLimit = createInMemoryRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

type PresignRequest = {
  uploadId?: unknown
  videoExtension?: unknown
  videoContentType?: unknown
}

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

/** Presigned R2 PUT URLs for community upload video + thumbnail. */
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

  let body: PresignRequest
  try {
    body = (await request.json()) as PresignRequest
  } catch {
    return bad(400, "invalid_json")
  }

  const uploadId =
    typeof body.uploadId === "string" ? body.uploadId.trim().toLowerCase() : ""
  if (!UUID_RE.test(uploadId)) {
    return bad(400, "invalid_upload_id")
  }

  const extResult = validateVideoExtension(
    typeof body.videoExtension === "string" ? body.videoExtension : ""
  )
  if (!extResult.ok) {
    return bad(400, "invalid_video_extension")
  }
  const ext = extResult.ext

  const rawContentType =
    typeof body.videoContentType === "string" && body.videoContentType.trim()
      ? body.videoContentType.trim()
      : videoContentTypeForExtension("", ext)
  const videoContentType = videoContentTypeForExtension(rawContentType, ext)
  if (!COMMUNITY_VIDEO_CONTENT_TYPES.has(videoContentType)) {
    return bad(400, "invalid_video_content_type")
  }

  const videoKey = `community-pending/${uploadId}/video.${ext}`
  const thumbKey = `community-pending/${uploadId}/thumb.jpg`

  try {
    const [videoUploadUrl, thumbUploadUrl] = await Promise.all([
      r2PresignPutUrl(videoKey, PRESIGN_EXPIRY_SECONDS),
      r2PresignPutUrl(thumbKey, PRESIGN_EXPIRY_SECONDS),
    ])

    return NextResponse.json({
      mode: "r2" as const,
      videoKey,
      thumbKey,
      videoUploadUrl,
      thumbUploadUrl,
      videoContentType,
      thumbContentType: "image/jpeg",
      expiresAt: new Date(
        Date.now() + PRESIGN_EXPIRY_SECONDS * 1000
      ).toISOString(),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to presign upload"
    return bad(500, message)
  }
}
