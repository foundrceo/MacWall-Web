import { NextResponse } from "next/server"

import {
  abortCommunityMultipartUpload,
  completeCommunityMultipartUpload,
  createCommunityMultipartUpload,
} from "@/lib/community/community-multipart"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Community R2 multipart API (create / complete / abort).
 * Large videos upload parts in parallel directly to R2.
 * @see https://developers.cloudflare.com/r2/objects/upload-objects/
 */

const RATE_LIMIT_WINDOW_MS = 60_000
/** create + complete per video; allow a short batch of large uploads. */
const RATE_LIMIT_MAX = 40
const checkRateLimit = createInMemoryRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

type MultipartBody = {
  action?: unknown
  uploadId?: unknown
  videoExtension?: unknown
  videoContentType?: unknown
  sizeBytes?: unknown
  key?: unknown
  parts?: unknown
}

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

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

  let body: MultipartBody
  try {
    body = (await request.json()) as MultipartBody
  } catch {
    return bad(400, "invalid_json")
  }

  const action = typeof body.action === "string" ? body.action.trim() : ""

  try {
    if (action === "create") {
      const result = await createCommunityMultipartUpload({
        uploadId: body.uploadId,
        videoExtension: body.videoExtension,
        videoContentType: body.videoContentType,
        sizeBytes: body.sizeBytes,
      })
      return NextResponse.json(result)
    }

    if (action === "complete") {
      const result = await completeCommunityMultipartUpload({
        key: body.key,
        uploadId: body.uploadId,
        parts: body.parts,
      })
      return NextResponse.json(result)
    }

    if (action === "abort") {
      const result = await abortCommunityMultipartUpload({
        key: body.key,
        uploadId: body.uploadId,
      })
      return NextResponse.json(result)
    }

    return bad(400, "unknown_action")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Multipart upload failed"
    console.error("[community] multipart failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
