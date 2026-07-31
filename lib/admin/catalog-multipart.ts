import "server-only"

import {
  r2AbortMultipartUpload,
  r2CompleteMultipartUpload,
  r2CreateMultipartUpload,
  r2PresignUploadPartUrl,
  type R2CompletedPart,
} from "@/lib/storage/r2"

/** R2 recommends ~16 MiB parts with parallel uploads for large objects. */
export const MULTIPART_PART_SIZE_BYTES = 16 * 1024 * 1024
/** Use multipart above this size; smaller files stay on a single PUT. */
export const MULTIPART_THRESHOLD_BYTES = 32 * 1024 * 1024
const MAX_PARTS = 10_000
const PART_URL_CONCURRENCY = 24
const PRESIGN_EXPIRES_SECONDS = 2 * 60 * 60
const CACHE_CONTROL = "public, max-age=31536000, immutable"

const VIDEO_KEY_RE = /^videos\/[a-z0-9][a-z0-9-]{1,127}\.(mp4|mov|m4v|webm)$/
const VIDEO_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
])

function assertCatalogVideoKey(key: string) {
  if (!VIDEO_KEY_RE.test(key)) {
    throw new Error("Multipart uploads are only allowed for catalog video keys.")
  }
}

function normalizeContentType(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Video content type is required.")
  }
  const contentType = raw.trim()
  if (!VIDEO_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unsupported video type: ${contentType}`)
  }
  return contentType
}

function normalizeSizeBytes(raw: unknown): number {
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("Video size is out of range.")
  }
  return value
}

function normalizeUploadId(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("uploadId is required.")
  }
  return raw.trim()
}

function normalizeKey(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Object key is required.")
  }
  const key = raw.trim().replace(/^\/+/, "")
  assertCatalogVideoKey(key)
  return key
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

export async function createCatalogMultipartUpload(input: {
  key: unknown
  contentType: unknown
  sizeBytes: unknown
}) {
  const key = normalizeKey(input.key)
  const contentType = normalizeContentType(input.contentType)
  const sizeBytes = normalizeSizeBytes(input.sizeBytes)
  const partSizeBytes = MULTIPART_PART_SIZE_BYTES
  const partCount = partCountForSize(sizeBytes, partSizeBytes)

  const { uploadId } = await r2CreateMultipartUpload(key, {
    contentType,
    cacheControl: CACHE_CONTROL,
  })

  const partNumbers = Array.from({ length: partCount }, (_, index) => index + 1)
  const partUrls = await asyncPool(
    partNumbers,
    PART_URL_CONCURRENCY,
    async (partNumber) => ({
      partNumber,
      url: await r2PresignUploadPartUrl(
        key,
        uploadId,
        partNumber,
        PRESIGN_EXPIRES_SECONDS
      ),
    })
  )

  return {
    key,
    uploadId,
    partSizeBytes,
    partCount,
    partUrls,
    expiresAt: new Date(Date.now() + PRESIGN_EXPIRES_SECONDS * 1000).toISOString(),
  }
}

export async function completeCatalogMultipartUpload(input: {
  key: unknown
  uploadId: unknown
  parts?: unknown
}) {
  const key = normalizeKey(input.key)
  const uploadId = normalizeUploadId(input.uploadId)

  let parts: R2CompletedPart[] | undefined
  if (Array.isArray(input.parts) && input.parts.length > 0) {
    parts = input.parts.map((raw) => {
      if (!raw || typeof raw !== "object") {
        throw new Error("Invalid multipart part.")
      }
      const record = raw as { partNumber?: unknown; etag?: unknown }
      const partNumber = Number(record.partNumber)
      const etag =
        typeof record.etag === "string" ? record.etag.trim() : ""
      if (!Number.isInteger(partNumber) || partNumber < 1 || !etag) {
        throw new Error("Each multipart part needs partNumber and etag.")
      }
      return { partNumber, etag }
    })
  }

  await r2CompleteMultipartUpload(key, uploadId, parts)
  return { key, uploadId, completed: true }
}

export async function abortCatalogMultipartUpload(input: {
  key: unknown
  uploadId: unknown
}) {
  const key = normalizeKey(input.key)
  const uploadId = normalizeUploadId(input.uploadId)
  await r2AbortMultipartUpload(key, uploadId)
  return { key, uploadId, aborted: true }
}
