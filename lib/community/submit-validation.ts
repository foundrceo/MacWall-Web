/**
 * Shared validation rules for community wallpaper submissions.
 *
 * Single source of truth for the client submit form
 * (`components/macwall-marketing/submit-wallpaper-form.tsx`) and the server
 * routes (`app/api/community/upload`, `app/api/community/submit`). Client-side
 * checks mirror the server so users see friendly, specific errors before an
 * upload starts instead of an opaque rejection afterwards.
 */

import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

export const COMMUNITY_TITLE_MIN = 2
export const COMMUNITY_TITLE_MAX = 140

/** Hard cap on the uploaded video. Mirrors the server `submit` route. */
export const COMMUNITY_MAX_VIDEO_BYTES = 300 * 1024 * 1024

/** Longest accepted clip (sanity bound, not a UX requirement). */
export const COMMUNITY_MAX_DURATION_SECONDS = 60 * 60

/**
 * Minimum source resolution. MacWall renders cinematic desktop wallpapers, so we
 * require at least 1080p of detail (longest edge ≥ 1920, shortest edge ≥ 1080) to
 * avoid blurry uploads. Either orientation is allowed (landscape or portrait).
 */
export const COMMUNITY_MIN_LONG_EDGE = 1920
export const COMMUNITY_MIN_SHORT_EDGE = 1080

export const COMMUNITY_VIDEO_EXTENSIONS = ["mp4", "mov", "m4v", "webm"] as const
export type CommunityVideoExtension =
  (typeof COMMUNITY_VIDEO_EXTENSIONS)[number]

export const COMMUNITY_VIDEO_CONTENT_TYPES = new Set<string>([
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
])

const CONTENT_TYPE_BY_EXTENSION: Record<CommunityVideoExtension, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
}

/** `accept` attribute for the file input. */
export const COMMUNITY_ACCEPT_ATTR =
  "video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm"

/** Human-readable rules surfaced in the UI before upload. */
export const SUBMIT_REQUIREMENTS: readonly string[] = [
  "MP4, MOV, M4V, or WEBM video",
  `Up to ${formatBytesLabel(COMMUNITY_MAX_VIDEO_BYTES)}`,
  `At least ${COMMUNITY_MIN_LONG_EDGE}×${COMMUNITY_MIN_SHORT_EDGE} resolution`,
]

const RESOLUTION_RE = /^([1-9]\d{1,4})x([1-9]\d{1,4})$/

function normalizeExtension(input: string): string {
  return input.trim().toLowerCase().replace(/^\./, "")
}

export function isAllowedVideoExtension(
  ext: string
): ext is CommunityVideoExtension {
  return (COMMUNITY_VIDEO_EXTENSIONS as readonly string[]).includes(ext)
}

export type ExtensionValidation =
  | { ok: true; ext: CommunityVideoExtension }
  | { ok: false }

export function validateVideoExtension(input: string): ExtensionValidation {
  const ext = normalizeExtension(input)
  if (isAllowedVideoExtension(ext)) return { ok: true, ext }
  return { ok: false }
}

export function videoContentTypeForExtension(
  fileType: string,
  extension: string
): string {
  const trimmed = fileType.trim()
  if (trimmed.startsWith("video/")) return trimmed
  const ext = normalizeExtension(extension)
  if (isAllowedVideoExtension(ext)) return CONTENT_TYPE_BY_EXTENSION[ext]
  return "video/mp4"
}

export type SizeValidation = { ok: true } | { ok: false }

export function validateVideoFileSize(bytes: number): SizeValidation {
  if (!Number.isFinite(bytes) || bytes <= 0) return { ok: false }
  if (bytes > COMMUNITY_MAX_VIDEO_BYTES) return { ok: false }
  return { ok: true }
}

export type DimensionsValidation = { ok: true } | { ok: false; message: string }

const RESOLUTION_TOO_SMALL_MESSAGE = `Use a higher-resolution video — at least ${COMMUNITY_MIN_LONG_EDGE}×${COMMUNITY_MIN_SHORT_EDGE}.`

export function validateVideoDimensions(
  width: number,
  height: number
): DimensionsValidation {
  if (!width || !height) {
    return { ok: false, message: "Could not read the video dimensions." }
  }
  const longEdge = Math.max(width, height)
  const shortEdge = Math.min(width, height)
  if (
    longEdge < COMMUNITY_MIN_LONG_EDGE ||
    shortEdge < COMMUNITY_MIN_SHORT_EDGE
  ) {
    return { ok: false, message: RESOLUTION_TOO_SMALL_MESSAGE }
  }
  return { ok: true }
}

export type ResolutionStringValidation =
  | { ok: true; width: number; height: number }
  | { ok: false }

/** Server-side check for the `"WxH"` resolution string sent by the client. */
export function validateResolutionString(
  resolution: string
): ResolutionStringValidation {
  const match = resolution.trim().match(RESOLUTION_RE)
  if (!match) return { ok: false }
  const width = Number(match[1])
  const height = Number(match[2])
  if (validateVideoDimensions(width, height).ok) {
    return { ok: true, width, height }
  }
  return { ok: false }
}

export function validateSubmitCategory(category: string): boolean {
  return WALLPAPER_CATEGORIES.includes(category.trim())
}

/**
 * Normalizes a user-entered title:
 * - strips control characters, emoji/pictographs, and zero-width joiners
 * - collapses runs of whitespace to a single space
 * - trims surrounding whitespace and clamps to the max length
 */
export function sanitizeWallpaperTitle(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\u200B|\u200C|\u200D|\uFEFF|\uFE0F|\u20E3/g, "")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, COMMUNITY_TITLE_MAX)
}

export type TitleValidation =
  | { ok: true; normalized: string }
  | { ok: false; message: string }

export function validateSubmitTitle(raw: string): TitleValidation {
  const normalized = sanitizeWallpaperTitle(raw)
  if (normalized.length < COMMUNITY_TITLE_MIN) {
    return {
      ok: false,
      message: "Give your wallpaper a title (at least 2 characters).",
    }
  }
  if (!/[\p{L}\p{N}]/u.test(normalized)) {
    return { ok: false, message: "Titles need at least one letter or number." }
  }
  return { ok: true, normalized }
}

/** Title-case suggestion derived from a file name, used to prefill the title field. */
export function titleFromFileName(fileName: string): string {
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_+.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!base) return ""
  const titled = base
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  return sanitizeWallpaperTitle(titled)
}

export function formatBytesLabel(bytes: number): string {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function rateLimitMessage(retryAfterSeconds: number | undefined): string {
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    return `Too many uploads right now. Try again in about ${retryAfterSeconds}s.`
  }
  return "Too many uploads right now. Wait a moment and try again."
}

/** Friendly message for `/api/community/upload` (presign) failures. */
export function presignErrorMessage(
  code: string | undefined,
  status: number,
  retryAfterSeconds?: number
): string {
  if (status === 429 || code === "rate_limited") {
    return rateLimitMessage(retryAfterSeconds)
  }
  switch (code) {
    case "invalid_video_extension":
    case "invalid_video_content_type":
      return "That video format is not supported."
    default:
      return "Could not prepare the upload. Please try again."
  }
}

/** Friendly message for `/api/community/submit` (register) failures. */
export function submitErrorMessage(
  code: string | undefined,
  status: number,
  retryAfterSeconds?: number
): string {
  if (status === 429 || code === "rate_limited") {
    return rateLimitMessage(retryAfterSeconds)
  }
  switch (code) {
    case "invalid_title":
      return "Give your wallpaper a title between 2 and 140 characters."
    case "invalid_category":
      return "Choose a valid category."
    case "invalid_resolution":
      return RESOLUTION_TOO_SMALL_MESSAGE
    case "invalid_file_size":
      return `Video must be ${formatBytesLabel(COMMUNITY_MAX_VIDEO_BYTES)} or smaller.`
    case "invalid_duration":
      return "That video is too long. Keep it under an hour."
    case "upload_not_found":
      return "The upload did not finish. Please try submitting again."
    default:
      return "Could not register your submission. Please try again."
  }
}
