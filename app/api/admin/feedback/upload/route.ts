import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const checkRateLimit = createInMemoryRateLimiter({ max: 30, windowMs: 60_000 })
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

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  const form = await request.formData()
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

  const ticketIdRaw =
    typeof form.get("ticketId") === "string"
      ? String(form.get("ticketId")).trim()
      : ""
  const folder =
    ticketIdRaw && /^[a-zA-Z0-9_-]{8,64}$/.test(ticketIdRaw)
      ? ticketIdRaw
      : "admin"

  try {
    const uploadId = crypto.randomUUID().toLowerCase()
    const imageKey = `support-chat/${folder}/${uploadId}.${ext}`
    const bytes = Buffer.from(await file.arrayBuffer())
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage
      .from("support-attachments")
      .upload(imageKey, bytes, {
        contentType,
        upsert: false,
        cacheControl: "3600",
      })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from("support-attachments")
      .getPublicUrl(imageKey)

    return NextResponse.json({
      publicUrl: data.publicUrl,
      imageKey,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed"
    return bad(500, message)
  }
}
