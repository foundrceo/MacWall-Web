import { NextResponse } from "next/server"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { isR2WriteEnabled, r2PresignPutUrl } from "@/lib/storage/r2"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import {
  isValidSupportSessionId,
  normalizeSupportSessionId,
} from "@/lib/support/shared"

export const runtime = "nodejs"

const PRESIGN_EXPIRY_SECONDS = 15 * 60
const checkRateLimit = createInMemoryRateLimiter({ max: 20, windowMs: 60_000 })
const MAX_BYTES = 4 * 1024 * 1024

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

function contentTypeForExtension(ext: string) {
  switch (ext) {
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    default:
      return "image/jpeg"
  }
}

async function uploadToSupabaseStorage(
  sessionId: string,
  bytes: Buffer,
  contentType: string,
  ext: string
) {
  const uploadId = crypto.randomUUID().toLowerCase()
  const imageKey = `support-chat/${sessionId}/${uploadId}.${ext === "jpeg" ? "jpg" : ext}`
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage
    .from("support-attachments")
    .upload(imageKey, bytes, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from("support-attachments").getPublicUrl(imageKey)
  return { publicUrl: data.publicUrl, imageKey }
}

/** Direct multipart upload (web client) — stores in Supabase Storage. */
async function handleDirectUpload(request: Request) {
  const form = await request.formData()
  const sessionId = normalizeSupportSessionId(String(form.get("sessionId") ?? ""))
  if (!isValidSupportSessionId(sessionId)) {
    return bad(400, "invalid_session")
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return bad(400, "file_required")
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return bad(400, "invalid_file_size")
  }

  const extRaw = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const ext = extRaw === "jpeg" ? "jpg" : extRaw
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return bad(400, "invalid_extension")
  }

  const contentType = ALLOWED_CONTENT_TYPES.has(file.type)
    ? file.type
    : contentTypeForExtension(ext)

  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadToSupabaseStorage(sessionId, bytes, contentType, ext)
    return NextResponse.json(uploaded)
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed"
    return bad(500, message)
  }
}

/** Presigned R2 PUT URL for support chat image attachment (optional path). */
async function handlePresign(request: Request) {
  let body: {
    sessionId?: unknown
    extension?: unknown
    contentType?: unknown
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return bad(400, "invalid_json")
  }

  const sessionId =
    typeof body.sessionId === "string"
      ? normalizeSupportSessionId(body.sessionId)
      : ""
  if (!isValidSupportSessionId(sessionId)) {
    return bad(400, "invalid_session")
  }

  const extRaw =
    typeof body.extension === "string" ? body.extension.trim().toLowerCase() : "jpg"
  const ext = extRaw === "jpeg" ? "jpg" : extRaw
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return bad(400, "invalid_extension")
  }

  const rawContentType =
    typeof body.contentType === "string" && body.contentType.trim()
      ? body.contentType.trim().toLowerCase()
      : contentTypeForExtension(ext)
  const contentType = ALLOWED_CONTENT_TYPES.has(rawContentType)
    ? rawContentType
    : contentTypeForExtension(ext)

  const uploadId = crypto.randomUUID().toLowerCase()
  const imageKey = `support-chat/${sessionId}/${uploadId}.${ext === "jpg" ? "jpg" : ext}`

  try {
    if (isR2WriteEnabled()) {
      const uploadUrl = await r2PresignPutUrl(imageKey, PRESIGN_EXPIRY_SECONDS)
      const publicUrl = `${getR2PublicBaseUrl()}/${imageKey}`

      return NextResponse.json({
        uploadUrl,
        publicUrl,
        imageKey,
        contentType,
        expiresAt: new Date(
          Date.now() + PRESIGN_EXPIRY_SECONDS * 1000
        ).toISOString(),
      })
    }

    return bad(503, "presign_unavailable")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to presign upload"
    return bad(500, message)
  }
}

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("multipart/form-data")) {
    return handleDirectUpload(request)
  }

  return handlePresign(request)
}
