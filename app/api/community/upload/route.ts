import { NextResponse } from "next/server"

import { r2PresignPutUrl } from "@/lib/storage/r2"

export const runtime = "nodejs"
export const maxDuration = 30

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm"])
const VIDEO_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
])
const PRESIGN_EXPIRY_SECONDS = 60 * 60

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

  const ext =
    typeof body.videoExtension === "string"
      ? body.videoExtension.trim().toLowerCase().replace(/^\./, "")
      : ""
  if (!VIDEO_EXTENSIONS.has(ext)) {
    return bad(400, "invalid_video_extension")
  }

  const videoContentType =
    typeof body.videoContentType === "string" && body.videoContentType.trim()
      ? body.videoContentType.trim()
      : "video/mp4"
  if (!VIDEO_CONTENT_TYPES.has(videoContentType)) {
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
