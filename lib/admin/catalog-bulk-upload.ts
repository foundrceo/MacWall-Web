import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import {
  getCatalogSupabaseAnonKey,
  getCatalogSupabaseOrigin,
} from "@/lib/env/catalog-supabase"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

const STORAGE_BUCKET = "wallpaper-catalog"
const MAX_BATCH_ITEMS = 300
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024
const MAX_THUMB_BYTES = 12 * 1024 * 1024
const CACHE_CONTROL_SECONDS = "31536000"
const EXISTING_ROW_CHECK_CHUNK_SIZE = 50
const STORAGE_CHECK_CONCURRENCY = 10
const SIGNED_URL_CONCURRENCY = 12

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm"])
const VIDEO_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
])

const WALLPAPER_ID_RE = /^[a-z0-9][a-z0-9-]{1,127}$/

export type CatalogUploadSignItem = {
  clientId: string
  id: string
  videoKey: string
  thumbKey: string
  videoContentType: string
  thumbContentType: string
  videoSizeBytes: number
  thumbSizeBytes: number
}

export type CatalogUploadCommitItem = {
  clientId: string
  id: string
  name: string
  category: string
  tags: string[]
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  videoKey: string
  thumbKey: string
  thumbSizeBytes: number
  isPro: boolean
  isFeatured: boolean
  isCuratedPick: boolean
}

type NormalizedSignItem = CatalogUploadSignItem & {
  id: string
  videoKey: string
  thumbKey: string
}

type NormalizedCommitItem = CatalogUploadCommitItem & {
  id: string
  name: string
  category: string
  tags: string[]
  resolution: string
  videoKey: string
  thumbKey: string
  thumbSizeBytes: number
}

type StorageObjectInfo = {
  exists: boolean
  sizeBytes: number | null
}

type SignedUploadTarget = {
  path: string
  token: string | null
  signedUrl: string | null
  alreadyUploaded: boolean
}

type ExistingWallpaperRow = {
  id: string
  name: string
  category: string
  video_key: string
  thumb_key: string
  file_size_bytes: number
}

export function catalogUploadConfig() {
  return {
    bucket: STORAGE_BUCKET,
    maxBatchItems: MAX_BATCH_ITEMS,
    cacheControl: CACHE_CONTROL_SECONDS,
  }
}

function assertPlainObject(
  value: unknown,
  label: string
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
}

function normalizeId(raw: unknown): string {
  if (typeof raw !== "string") throw new Error("Wallpaper ID is required.")
  const id = raw.trim().toLowerCase()
  if (!WALLPAPER_ID_RE.test(id)) {
    throw new Error(
      "Wallpaper ID must be lowercase letters, numbers, and hyphens."
    )
  }
  return id
}

function normalizeKey(raw: unknown, folder: "videos" | "thumbs"): string {
  if (typeof raw !== "string") throw new Error(`${folder} key is required.`)
  const key = raw.trim().replace(/^\/+/, "")
  if (key.includes("..") || key.includes("\\")) {
    throw new Error(`Invalid ${folder} key.`)
  }
  return key
}

function videoExtension(videoKey: string): string {
  const ext = videoKey.split(".").pop()?.toLowerCase() ?? ""
  if (!VIDEO_EXTENSIONS.has(ext)) {
    throw new Error("Video must be mp4, mov, m4v, or webm.")
  }
  return ext
}

function assertCatalogKeys(id: string, videoKey: string, thumbKey: string) {
  const ext = videoExtension(videoKey)
  if (videoKey !== `videos/${id}.${ext}`) {
    throw new Error(`Video key must be videos/${id}.${ext}.`)
  }
  if (thumbKey !== `thumbs/${id}.jpg`) {
    throw new Error(`Thumbnail key must be thumbs/${id}.jpg.`)
  }
}

function normalizePositiveInteger(raw: unknown, label: string, max: number) {
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new Error(`${label} is out of range.`)
  }
  return value
}

function normalizeContentType(raw: unknown, fallback: string): string {
  return typeof raw === "string" && raw.trim() ? raw.trim() : fallback
}

function normalizeSignItem(raw: unknown): NormalizedSignItem {
  assertPlainObject(raw, "Upload item")
  const id = normalizeId(raw.id)
  const videoKey = normalizeKey(raw.videoKey, "videos")
  const thumbKey = normalizeKey(raw.thumbKey, "thumbs")
  assertCatalogKeys(id, videoKey, thumbKey)

  const videoContentType = normalizeContentType(
    raw.videoContentType,
    "video/mp4"
  )
  if (!VIDEO_CONTENT_TYPES.has(videoContentType)) {
    throw new Error(`Unsupported video type for ${id}.`)
  }

  const thumbContentType = normalizeContentType(
    raw.thumbContentType,
    "image/jpeg"
  )
  if (thumbContentType !== "image/jpeg") {
    throw new Error(`Thumbnail for ${id} must be JPEG.`)
  }

  return {
    clientId: typeof raw.clientId === "string" ? raw.clientId : id,
    id,
    videoKey,
    thumbKey,
    videoContentType,
    thumbContentType,
    videoSizeBytes: normalizePositiveInteger(
      raw.videoSizeBytes,
      `Video size for ${id}`,
      MAX_VIDEO_BYTES
    ),
    thumbSizeBytes: normalizePositiveInteger(
      raw.thumbSizeBytes,
      `Thumbnail size for ${id}`,
      MAX_THUMB_BYTES
    ),
  }
}

function normalizeCommitItem(raw: unknown): NormalizedCommitItem {
  assertPlainObject(raw, "Catalog item")
  const id = normalizeId(raw.id)
  const videoKey = normalizeKey(raw.videoKey, "videos")
  const thumbKey = normalizeKey(raw.thumbKey, "thumbs")
  assertCatalogKeys(id, videoKey, thumbKey)

  const name = typeof raw.name === "string" ? raw.name.trim() : ""
  if (name.length < 2 || name.length > 140) {
    throw new Error(`Name for ${id} must be 2-140 characters.`)
  }

  const category = typeof raw.category === "string" ? raw.category.trim() : ""
  if (!WALLPAPER_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category for ${id}.`)
  }

  const tags = Array.isArray(raw.tags)
    ? raw.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20)
    : []

  const resolution =
    typeof raw.resolution === "string" && raw.resolution.trim()
      ? raw.resolution.trim()
      : "Unknown"

  const durationSeconds = Number(raw.durationSeconds)
  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0 ||
    durationSeconds > 24 * 60 * 60
  ) {
    throw new Error(`Duration for ${id} is out of range.`)
  }

  return {
    clientId: typeof raw.clientId === "string" ? raw.clientId : id,
    id,
    name,
    category,
    tags: [...new Set(tags)],
    resolution,
    durationSeconds,
    fileSizeBytes: normalizePositiveInteger(
      raw.fileSizeBytes,
      `File size for ${id}`,
      MAX_VIDEO_BYTES
    ),
    videoKey,
    thumbKey,
    thumbSizeBytes: normalizePositiveInteger(
      raw.thumbSizeBytes,
      `Thumbnail size for ${id}`,
      MAX_THUMB_BYTES
    ),
    isPro: Boolean(raw.isPro),
    isFeatured: Boolean(raw.isFeatured),
    isCuratedPick: Boolean(raw.isCuratedPick),
  }
}

function normalizeBatch<T>(
  value: unknown,
  normalizer: (item: unknown) => T & { id: string },
  label: string
): Array<T & { id: string }> {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`)
  if (value.length < 1) throw new Error("Select at least one wallpaper.")
  if (value.length > MAX_BATCH_ITEMS) {
    throw new Error(`Upload at most ${MAX_BATCH_ITEMS} wallpapers at once.`)
  }

  const items = value.map(normalizer)
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate wallpaper ID: ${item.id}.`)
    }
    seen.add(item.id)
  }
  return items
}

async function assertNoExistingRows(ids: string[]) {
  const data = await existingWallpaperRows(ids)
  if (data.length) {
    throw new Error(
      `Already in catalog: ${data.map((row) => row.id).join(", ")}.`
    )
  }
}

async function existingWallpaperRows(
  ids: string[]
): Promise<ExistingWallpaperRow[]> {
  const supabase = getSupabaseAdmin()
  const results = await asyncPool(
    chunkArray(ids, EXISTING_ROW_CHECK_CHUNK_SIZE),
    STORAGE_CHECK_CONCURRENCY,
    async (chunk) => {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("id,name,category,video_key,thumb_key,file_size_bytes")
        .in("id", chunk)

      if (error) throw new Error(error.message)
      return (data ?? []) as ExistingWallpaperRow[]
    }
  )

  return results.flat()
}

function storageKeyParts(key: string): { folder: string; name: string } {
  const lastSlash = key.lastIndexOf("/")
  if (lastSlash <= 0 || lastSlash === key.length - 1) {
    throw new Error(`Invalid Storage key: ${key}.`)
  }

  return {
    folder: key.slice(0, lastSlash),
    name: key.slice(lastSlash + 1),
  }
}

const STORAGE_LIST_PAGE_SIZE = 1000

async function listFolderObjects(folder: string) {
  const supabase = getSupabaseAdmin()
  const objects: Array<{ name: string; metadata?: unknown }> = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: STORAGE_LIST_PAGE_SIZE,
        offset,
      })

    if (error) throw new Error(error.message)
    const page = data ?? []
    objects.push(...page)
    if (page.length < STORAGE_LIST_PAGE_SIZE) break
    offset += STORAGE_LIST_PAGE_SIZE
  }

  return objects
}

async function storageObjectInfoMap(
  keys: string[]
): Promise<Map<string, StorageObjectInfo>> {
  const uniqueKeys = [...new Set(keys)]
  const namesByFolder = new Map<string, Set<string>>()
  for (const key of uniqueKeys) {
    const { folder, name } = storageKeyParts(key)
    const names = namesByFolder.get(folder) ?? new Set<string>()
    names.add(name)
    namesByFolder.set(folder, names)
  }

  const infoByKey = new Map<string, StorageObjectInfo>()
  for (const [folder, names] of namesByFolder) {
    const objects = await listFolderObjects(folder)
    const objectsByName = new Map(
      objects.map((object) => [object.name, object])
    )
    for (const name of names) {
      const key = `${folder}/${name}`
      const object = objectsByName.get(name)
      if (!object) {
        infoByKey.set(key, { exists: false, sizeBytes: null })
        continue
      }
      infoByKey.set(key, {
        exists: true,
        sizeBytes: storageObjectSize(object),
      })
    }
  }

  return infoByKey
}

async function storageObjectInfo(key: string): Promise<StorageObjectInfo> {
  const infoByKey = await storageObjectInfoMap([key])
  return infoByKey.get(key) ?? { exists: false, sizeBytes: null }
}

function storageObjectSize(object: { metadata?: unknown }): number | null {
  if (!object.metadata || typeof object.metadata !== "object") return null
  const metadata = object.metadata as Record<string, unknown>
  const rawSize =
    metadata.size ?? metadata.contentLength ?? metadata.content_length
  const size = typeof rawSize === "number" ? rawSize : Number(rawSize)
  return Number.isSafeInteger(size) && size > 0 ? size : null
}

function isAlreadyExistsStorageError(error: { message?: string }) {
  const message = error.message?.toLowerCase() ?? ""
  return (
    message.includes("already exists") ||
    message.includes("duplicate") ||
    message.includes("resource already exists")
  )
}

async function assertObjectsExist(items: NormalizedCommitItem[]) {
  const objectChecks = items.flatMap((item) => [
    {
      item,
      isVideo: true,
      key: item.videoKey,
    },
    {
      item,
      isVideo: false,
      key: item.thumbKey,
    },
  ])
  const infoByKey = await storageObjectInfoMap(
    objectChecks.map((check) => check.key)
  )

  const missing: string[] = []
  for (const check of objectChecks) {
    const info = infoByKey.get(check.key) ?? { exists: false, sizeBytes: null }

    if (!info.exists) {
      missing.push(check.key)
      continue
    }

    if (
      info.sizeBytes !== null &&
      info.sizeBytes !==
        (check.isVideo ? check.item.fileSizeBytes : check.item.thumbSizeBytes)
    ) {
      throw new Error(
        `Uploaded ${check.isVideo ? "video" : "thumbnail"} size does not match staged file: ${check.key}.`
      )
    }
  }

  if (missing.length) {
    throw new Error(`Upload missing from Storage: ${missing.join(", ")}.`)
  }
}

async function createSignedUploadTarget(
  path: string,
  expectedSizeBytes: number
): Promise<SignedUploadTarget> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path, { upsert: false })

  if (error) {
    if (isAlreadyExistsStorageError(error)) {
      const existing = await storageObjectInfo(path)
      if (existing.exists && existing.sizeBytes === expectedSizeBytes) {
        return {
          path,
          token: null,
          signedUrl: null,
          alreadyUploaded: true,
        }
      }

      throw new Error(
        `Storage object already exists with a different size: ${path}. Change the wallpaper ID or remove the existing object.`
      )
    }

    throw new Error(error.message)
  }

  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    alreadyUploaded: false,
  }
}

export async function createCatalogSignedUploadBatch(rawItems: unknown) {
  const items = normalizeBatch(rawItems, normalizeSignItem, "items")
  await assertNoExistingRows(items.map((item) => item.id))

  const uploads = await asyncPool(
    items,
    SIGNED_URL_CONCURRENCY,
    async (item) => {
      const [video, thumb] = await Promise.all([
        createSignedUploadTarget(item.videoKey, item.videoSizeBytes),
        createSignedUploadTarget(item.thumbKey, item.thumbSizeBytes),
      ])

      return {
        clientId: item.clientId,
        id: item.id,
        video,
        thumb,
        videoContentType: item.videoContentType,
        thumbContentType: item.thumbContentType,
        videoUrl: catalogPublicVideoUrlFromKey(item.videoKey),
        thumbUrl: catalogMarketingGalleryPosterUrlFromKey(item.thumbKey),
      }
    }
  )

  return {
    bucket: STORAGE_BUCKET,
    origin: getCatalogSupabaseOrigin(),
    anonKey: getCatalogSupabaseAnonKey(),
    cacheControl: CACHE_CONTROL_SECONDS,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    uploads,
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

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function commitCatalogUploadBatch(rawItems: unknown) {
  const items = normalizeBatch(rawItems, normalizeCommitItem, "items")
  await assertObjectsExist(items)
  const existingRows = await existingWallpaperRows(items.map((item) => item.id))
  const existingById = new Map(existingRows.map((row) => [row.id, row]))
  const insertItems = items.filter((item) => {
    const existing = existingById.get(item.id)
    if (!existing) return true

    if (
      existing.video_key !== item.videoKey ||
      existing.thumb_key !== item.thumbKey ||
      existing.file_size_bytes !== item.fileSizeBytes
    ) {
      throw new Error(
        `Already in catalog with different files: ${item.id}. Change the wallpaper ID or remove the existing row.`
      )
    }

    return false
  })

  const now = new Date().toISOString()
  const rows = insertItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    tags: item.tags,
    resolution: item.resolution,
    duration_seconds: item.durationSeconds,
    file_size_bytes: item.fileSizeBytes,
    video_key: item.videoKey,
    thumb_key: item.thumbKey,
    is_pro: item.isPro,
    is_featured: item.isFeatured,
    is_curated_pick: item.isCuratedPick,
    like_count: 0,
    created_at: now,
    updated_at: now,
  }))

  if (!rows.length) {
    return {
      inserted: existingRows.length,
      wallpapers: existingRows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        videoKey: row.video_key,
        thumbKey: row.thumb_key,
      })),
    }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("wallpapers")
    .insert(rows)
    .select("id,name,category,video_key,thumb_key")

  if (error) throw new Error(error.message)

  return {
    inserted: existingRows.length + (data?.length ?? rows.length),
    wallpapers: [
      ...existingRows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        videoKey: row.video_key,
        thumbKey: row.thumb_key,
      })),
      ...(data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        videoKey: row.video_key,
        thumbKey: row.thumb_key,
      })),
    ],
  }
}
