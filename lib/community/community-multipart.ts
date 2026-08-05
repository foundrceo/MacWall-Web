import "server-only"

import { COMMUNITY_MULTIPART_PART_SIZE_BYTES } from "@/lib/community/community-multipart-constants"
import {
  COMMUNITY_MAX_VIDEO_BYTES,
  COMMUNITY_VIDEO_CONTENT_TYPES,
  validateVideoExtension,
  videoContentTypeForExtension,
} from "@/lib/community/submit-validation"
import {
  r2AbortMultipartUpload,
  r2CompleteMultipartUpload,
  r2CreateMultipartUpload,
  r2PresignPutUrl,
  r2PresignUploadPartUrl,
  type R2CompletedPart,
} from "@/lib/storage/r2"

export {
  COMMUNITY_MULTIPART_PART_SIZE_BYTES,
  COMMUNITY_MULTIPART_THRESHOLD_BYTES,
} from "@/lib/community/community-multipart-constants"

/**
 * Community video multipart — mirrors admin catalog MPU settings.
 * @see https://developers.cloudflare.com/r2/objects/upload-objects/
 */

const MAX_PARTS = 10_000
const PART_URL_CONCURRENCY = 24
/** Longer than single-PUT — parts upload in parallel and may retry. */
const PART_PRESIGN_EXPIRES_SECONDS = 2 * 60 * 60
const THUMB_PRESIGN_EXPIRES_SECONDS = 15 * 60

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const COMMUNITY_VIDEO_KEY_RE =
  /^community-pending\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/video\.(mp4|mov|m4v|webm)$/i

function assertCommunityVideoKey(key: string) {
  if (!COMMUNITY_VIDEO_KEY_RE.test(key)) {
    throw new Error("Multipart uploads are only allowed for community pending video keys.")
  }
}

function normalizeUploadUuid(raw: unknown): string {
  if (typeof raw !== "string") throw new Error("uploadId is required.")
  const id = raw.trim().toLowerCase()
  if (!UUID_RE.test(id)) throw new Error("uploadId must be a UUID.")
  return id
}

function normalizeUploadId(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("R2 multipart uploadId is required.")
  }
  return raw.trim()
}

function normalizeKey(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Object key is required.")
  }
  const key = raw.trim().replace(/^\/+/, "")
  assertCommunityVideoKey(key)
  return key
}

function normalizeSizeBytes(raw: unknown): number {
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("Video size is out of range.")
  }
  if (value > COMMUNITY_MAX_VIDEO_BYTES) {
    throw new Error("Video exceeds the community size limit.")
  }
  return value
}

function partCountForSize(sizeBytes: number, partSizeBytes: number): number {
  const count = Math.ceil(sizeBytes / partSizeBytes)
  if (count < 1 || count > MAX_PARTS) {
    throw new Error(
      `File requires ${count} parts; multipart supports 1-${MAX_PARTS}.`
    )
  }
  return count
}

async function asyncPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const workers = Array.from({
    length: Math.min(limit, items.length),
  }).map(async () => {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index])
    }
  })
  await Promise.all(workers)
  return results
}

function normalizeParts(raw: unknown): R2CompletedPart[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  return raw.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid multipart part.")
    }
    const record = item as { partNumber?: unknown; etag?: unknown }
    const partNumber = Number(record.partNumber)
    const etag = typeof record.etag === "string" ? record.etag.trim() : ""
    if (!Number.isInteger(partNumber) || partNumber < 1 || !etag) {
      throw new Error("Each multipart part needs partNumber and etag.")
    }
    return { partNumber, etag }
  })
}

/** Start community video MPU + mint parallel part URLs + thumb single-PUT. */
export async function createCommunityMultipartUpload(input: {
  uploadId: unknown
  videoExtension: unknown
  videoContentType?: unknown
  sizeBytes: unknown
}) {
  const uploadUuid = normalizeUploadUuid(input.uploadId)
  const extResult = validateVideoExtension(
    typeof input.videoExtension === "string" ? input.videoExtension : ""
  )
  if (!extResult.ok) {
    throw new Error("Unsupported video extension.")
  }
  const ext = extResult.ext

  const rawContentType =
    typeof input.videoContentType === "string" && input.videoContentType.trim()
      ? input.videoContentType.trim()
      : videoContentTypeForExtension("", ext)
  const contentType = videoContentTypeForExtension(rawContentType, ext)
  if (!COMMUNITY_VIDEO_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unsupported video type: ${contentType}`)
  }

  const sizeBytes = normalizeSizeBytes(input.sizeBytes)
  const partSizeBytes = COMMUNITY_MULTIPART_PART_SIZE_BYTES
  const partCount = partCountForSize(sizeBytes, partSizeBytes)

  const videoKey = `community-pending/${uploadUuid}/video.${ext}`
  const thumbKey = `community-pending/${uploadUuid}/thumb.jpg`

  const { uploadId } = await r2CreateMultipartUpload(videoKey, {
    contentType,
    // No Cache-Control — pending community objects are not CDN catalog assets.
  })

  const partNumbers = Array.from({ length: partCount }, (_, index) => index + 1)
  const [partUrls, thumbUploadUrl] = await Promise.all([
    asyncPool(partNumbers, PART_URL_CONCURRENCY, async (partNumber) => ({
      partNumber,
      url: await r2PresignUploadPartUrl(
        videoKey,
        uploadId,
        partNumber,
        PART_PRESIGN_EXPIRES_SECONDS
      ),
    })),
    r2PresignPutUrl(thumbKey, THUMB_PRESIGN_EXPIRES_SECONDS, {
      contentType: "image/jpeg",
    }),
  ])

  return {
    mode: "r2-multipart" as const,
    key: videoKey,
    videoKey,
    thumbKey,
    uploadId,
    partSizeBytes,
    partCount,
    partUrls,
    thumbUploadUrl,
    videoContentType: contentType,
    thumbContentType: "image/jpeg",
    expiresAt: new Date(
      Date.now() + PART_PRESIGN_EXPIRES_SECONDS * 1000
    ).toISOString(),
  }
}

export async function completeCommunityMultipartUpload(input: {
  key: unknown
  uploadId: unknown
  parts?: unknown
}) {
  const key = normalizeKey(input.key)
  const uploadId = normalizeUploadId(input.uploadId)
  const parts = normalizeParts(input.parts)
  await r2CompleteMultipartUpload(key, uploadId, parts)
  return { key, uploadId, completed: true }
}

export async function abortCommunityMultipartUpload(input: {
  key: unknown
  uploadId: unknown
}) {
  const key = normalizeKey(input.key)
  const uploadId = normalizeUploadId(input.uploadId)
  await r2AbortMultipartUpload(key, uploadId)
  return { key, uploadId, aborted: true }
}
