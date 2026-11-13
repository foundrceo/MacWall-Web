/**
 * File rules and types for the static (still image) wallpaper uploader.
 */

import { formatBytes } from "@/lib/admin/format"

export const MAX_FILES = 100
export const MAX_IMAGE_BYTES = 40 * 1024 * 1024
export const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])
export const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

export type DraftStatus = "ready" | "uploading" | "uploaded" | "error"

export type StaticDraft = {
  localId: string
  file: File
  fileName: string
  contentType: string
  sizeBytes: number
  previewUrl: string
  status: DraftStatus
  progress: number
  error: string | null
  publicUrl: string | null
}

export type SignedUploadResponse = {
  uploads: Array<{
    clientId: string
    fileName: string
    contentType: string
    publicUrl: string
    image: {
      path: string
      signedUrl: string | null
      alreadyUploaded: boolean
    }
  }>
  error?: string
}

export type ListedImage = {
  key: string
  fileName: string
  sizeBytes: number
  lastModified: string | null
  publicUrl: string
}

export type ListResponse = {
  count: number
  images: ListedImage[]
  error?: string
}

export type PanelMessage = {
  tone: "success" | "warning" | "info"
  text: string
}

export function extensionOf(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  return ext === "jpeg" ? "jpg" : ext
}

export function contentTypeForFile(file: File): string | null {
  if (ALLOWED_CONTENT_TYPES.has(file.type)) return file.type
  switch (extensionOf(file.name)) {
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    case "jpg":
      return "image/jpeg"
    default:
      return null
  }
}

export function sanitizeClientFileName(raw: string): string {
  const base = raw.trim().replace(/^.*[\\/]/, "")
  const dot = base.lastIndexOf(".")
  if (dot <= 0) return base
  const stem = base
    .slice(0, dot)
    .replace(/[^a-zA-Z0-9-_]+/g, "")
    .slice(0, 120)
  let ext = base.slice(dot + 1).toLowerCase()
  if (ext === "jpeg") ext = "jpg"
  return `${stem || "image"}.${ext}`
}

export function isStillImageFile(file: File): string | null {
  const ext = extensionOf(file.name)
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return "Only JPG, PNG, and WebP still images are allowed."
  }
  if (file.type === "image/gif" || ext === "gif") {
    return "Animated GIFs are not allowed in Static wallpapers."
  }
  if (
    file.type.startsWith("video/") ||
    ["mp4", "mov", "m4v", "webm"].includes(ext)
  ) {
    return "Videos belong in the live catalog Bulk upload tab."
  }
  if (!contentTypeForFile(file)) {
    return "Unsupported image type."
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return `Each image must be under ${formatBytes(MAX_IMAGE_BYTES)}.`
  }
  return null
}

export async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }).map(async () => {
      while (next < items.length) {
        const item = items[next]
        next += 1
        await worker(item)
      }
    })
  )
}

export function plural(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`
}

export function formatListedDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
