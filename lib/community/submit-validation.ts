/**
 * Server-side validation rules for community wallpaper uploads.
 *
 * The MacWall macOS app is the only upload client. It calls
 * `app/api/community/upload` (presign) and `app/api/community/upload/multipart`,
 * then registers the file through the `submit_community_upload` Supabase RPC.
 * These constants keep the presign path honest about what R2 will accept.
 */

/** Hard cap on the uploaded video. Mirrors the app's client-side limit. */
export const COMMUNITY_MAX_VIDEO_BYTES = 300 * 1024 * 1024

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
