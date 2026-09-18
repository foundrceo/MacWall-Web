import "server-only"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import {
  r2DeleteObject,
  r2HeadPublicObject,
  r2PresignPutUrl,
} from "@/lib/storage/r2"

const STORAGE_BUCKET = "wallpaper-catalog"
const STATIC_PREFIX = "static-wallpapers"
const MAX_BATCH_ITEMS = 100
const MAX_IMAGE_BYTES = 40 * 1024 * 1024
const CACHE_CONTROL_SECONDS = "31536000"
const SIGNED_URL_CONCURRENCY = 12

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])
const IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

export type StaticWallpaperSignItem = {
  clientId: string
  fileName: string
  contentType: string
  sizeBytes: number
}

type NormalizedSignItem = {
  clientId: string
  fileName: string
  objectKey: string
  contentType: string
  sizeBytes: number
}

type SignedUploadTarget = {
  path: string
  signedUrl: string | null
  alreadyUploaded: boolean
}

function assertPlainObject(
  value: unknown,
  label: string
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
}

function normalizePositiveInteger(raw: unknown, label: string, max: number) {
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new Error(`${label} is out of range.`)
  }
  return value
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      return "jpg"
  }
}

function contentTypeForExtension(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    default:
      return "image/jpeg"
  }
}

/** Keep still-image names stable and path-safe under `static-wallpapers/`. */
export function sanitizeStaticWallpaperFileName(raw: string): string {
  const base = raw.trim().replace(/^.*[\\/]/, "")
  if (!base) throw new Error("File name is required.")

  const dot = base.lastIndexOf(".")
  if (dot <= 0 || dot === base.length - 1) {
    throw new Error("Image file name must include an extension.")
  }

  const stem = base
    .slice(0, dot)
    .replace(/[^a-zA-Z0-9-_]+/g, "")
    .slice(0, 120)
  let ext = base.slice(dot + 1).toLowerCase()
  if (ext === "jpeg") ext = "jpg"

  if (!stem) throw new Error("Image file name is invalid after sanitizing.")
  if (!IMAGE_EXTENSIONS.has(ext)) {
    throw new Error("Only JPG, PNG, and WebP still images are allowed.")
  }

  return `${stem}.${ext}`
}

function normalizeSignItem(raw: unknown): NormalizedSignItem {
  assertPlainObject(raw, "Upload item")

  const fileName = sanitizeStaticWallpaperFileName(
    typeof raw.fileName === "string" ? raw.fileName : ""
  )
  const ext = fileName.split(".").pop() ?? "jpg"
  const contentTypeRaw =
    typeof raw.contentType === "string" ? raw.contentType.trim() : ""
  const contentType = IMAGE_CONTENT_TYPES.has(contentTypeRaw)
    ? contentTypeRaw
    : contentTypeForExtension(ext)

  if (!IMAGE_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unsupported image type for ${fileName}.`)
  }

  const expectedExt = extensionForContentType(contentType)
  if (expectedExt !== ext) {
    throw new Error(
      `Content type ${contentType} does not match extension .${ext}.`
    )
  }

  const clientId =
    typeof raw.clientId === "string" && raw.clientId.trim()
      ? raw.clientId.trim()
      : fileName

  return {
    clientId,
    fileName,
    objectKey: `${STATIC_PREFIX}/${fileName}`,
    contentType,
    sizeBytes: normalizePositiveInteger(
      raw.sizeBytes,
      `Image size for ${fileName}`,
      MAX_IMAGE_BYTES
    ),
  }
}

function normalizeBatch(value: unknown): NormalizedSignItem[] {
  if (!Array.isArray(value)) throw new Error("items must be an array.")
  if (value.length < 1) throw new Error("Select at least one image.")
  if (value.length > MAX_BATCH_ITEMS) {
    throw new Error(`Upload at most ${MAX_BATCH_ITEMS} images at once.`)
  }

  const items = value.map(normalizeSignItem)
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.objectKey)) {
      throw new Error(`Duplicate image key: ${item.fileName}.`)
    }
    seen.add(item.objectKey)
  }
  return items
}

async function createSignedUploadTarget(
  path: string,
  expectedSizeBytes: number
): Promise<SignedUploadTarget> {
  const existing = await r2HeadPublicObject(path)
  if (
    existing.exists &&
    existing.sizeBytes !== null &&
    existing.sizeBytes === expectedSizeBytes
  ) {
    return {
      path,
      signedUrl: null,
      alreadyUploaded: true,
    }
  }

  if (existing.exists) {
    await r2DeleteObject(path)
  }

  const signedUrl = await r2PresignPutUrl(path)
  return {
    path,
    signedUrl,
    alreadyUploaded: false,
  }
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

export function staticWallpaperPublicUrl(objectKey: string): string {
  const key = objectKey.replace(/^\/+/, "")
  return `${getR2PublicBaseUrl()}/${key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`
}

export async function createStaticWallpaperSignedUploadBatch(rawItems: unknown) {
  const items = normalizeBatch(rawItems)

  const uploads = await asyncPool(
    items,
    SIGNED_URL_CONCURRENCY,
    async (item) => {
      const target = await createSignedUploadTarget(
        item.objectKey,
        item.sizeBytes
      )

      return {
        clientId: item.clientId,
        fileName: item.fileName,
        contentType: item.contentType,
        image: target,
        publicUrl: staticWallpaperPublicUrl(item.objectKey),
      }
    }
  )

  return {
    bucket: STORAGE_BUCKET,
    prefix: `${STATIC_PREFIX}/`,
    mode: "r2" as const,
    publicBaseUrl: getR2PublicBaseUrl(),
    cacheControl: CACHE_CONTROL_SECONDS,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    uploads,
  }
}
