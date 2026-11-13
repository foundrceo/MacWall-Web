/**
 * Pure draft helpers for the bulk catalog uploader: turning a file name into
 * a title, category and tags, building slugs and storage keys, cleaning up AI
 * suggestions, and validating a batch before upload.
 */

import {
  DEFAULT_WALLPAPER_CATEGORY,
  WALLPAPER_CATEGORIES,
} from "@/lib/wallpaper-categories"

import {
  VIDEO_EXTENSIONS,
  WALLPAPER_ID_RE,
  type BrowserFileSystemFileHandle,
  type CatalogDraft,
  type DraftField,
  type DraftValidation,
} from "./catalog-types"

export function createInitialDraft(
  file: File,
  fileHandle: BrowserFileSystemFileHandle | null,
  localId: string,
  usedIds: Set<string>
): CatalogDraft {
  const videoExtension = fileExtension(file.name)
  if (!VIDEO_EXTENSIONS.has(videoExtension)) {
    throw new Error(`${file.name} is not a supported video file.`)
  }

  const parsed = parseWallpaperFileName(file.name)
  const id = uniqueSlug(slugify(parsed.title), usedIds)
  usedIds.add(id)

  return {
    localId,
    file,
    fileHandle,
    sourceFileName: file.name,
    id,
    videoExtension,
    videoKey: `videos/${id}.${videoExtension}`,
    thumbKey: `thumbs/${id}.jpg`,
    name: parsed.title,
    category: parsed.category,
    tagsText: parsed.tags.join(", "),
    resolution: parsed.resolution ?? "Reading...",
    durationSeconds: parsed.durationSeconds ?? 0,
    fileSizeBytes: file.size,
    videoContentType: normalizeVideoContentType(file.type, videoExtension),
    thumbBlob: null,
    thumbUrl: null,
    isPro: false,
    isFeatured: false,
    isCuratedPick: false,
    trimStartSeconds: 0,
    trimEndSeconds: null,
    status: "analyzing",
    progress: 0,
    error: null,
  }
}

export function validateDrafts(drafts: CatalogDraft[]) {
  const idCounts = new Map<string, number>()
  for (const draft of drafts) {
    idCounts.set(draft.id, (idCounts.get(draft.id) ?? 0) + 1)
  }

  return new Map<string, DraftValidation>(
    drafts.map((draft) => {
      let message: string | null = null
      let field: DraftField | null = null
      if (!draft.name.trim() || draft.name.trim().length < 2) {
        message = "Title is required."
        field = "name"
      } else if (!WALLPAPER_ID_RE.test(draft.id)) {
        message = "ID must be lowercase letters, numbers, and hyphens."
        field = "id"
      } else if ((idCounts.get(draft.id) ?? 0) > 1) {
        message = "Duplicate ID in this batch."
        field = "id"
      } else if (!WALLPAPER_CATEGORIES.includes(draft.category)) {
        message = "Choose a valid category."
        field = "category"
      } else if (!draft.thumbBlob) {
        message = "Thumbnail is required."
      } else if (!draft.resolution.includes("x")) {
        message = "Resolution is missing."
      } else if (draft.status === "analyzing") {
        message = "Still reading metadata."
      }

      return [
        draft.localId,
        {
          ok: !message,
          message,
          field,
        },
      ]
    })
  )
}

export function parseWallpaperFileName(fileName: string): {
  title: string
  category: string
  tags: string[]
  resolution?: string
  durationSeconds?: number
} {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "")
  const resolutionMatch = withoutExtension.match(
    /\b([1-9]\d{2,4})\s*[xX]\s*([1-9]\d{2,4})\b/
  )

  const separated = withoutExtension
    .replace(/\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g, " ")
    .replace(/[_+.]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const cleaned = splitTitleCompounds(removeLeadingSourceTokens(separated))
    .replace(/\b\d{3,4}\s*[xX]\s*\d{3,4}\b/g, " ")
    .replace(/\b(4k|5k|8k|uhd|fhd|hd|hdr|sdr)\b/gi, " ")
    .replace(/\b\d+\s*fps\b/gi, " ")
    .replace(/\b(loop|moewalls?|wallpaper\s*engine|com|official)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

  const title = toTitleCase(cleaned || withoutExtension)
  const category = inferCategory(`${withoutExtension} ${title}`)
  const tags = inferTags(`${title} ${category}`)

  return {
    title,
    category,
    tags,
    resolution: resolutionMatch
      ? `${resolutionMatch[1]}x${resolutionMatch[2]}`
      : undefined,
  }
}

export function removeLeadingSourceTokens(value: string) {
  const words = value.split(/\s+/).filter(Boolean)
  while (words.length > 1 && isSourceIdToken(words[0])) {
    words.shift()
  }
  return words.join(" ")
}

export function isSourceIdToken(value: string) {
  const token = value.replace(/[^a-z0-9]/gi, "")
  if (token.length < 8 || token.length > 16) return false

  const hasDigit = /\d/.test(token)
  const hasLower = /[a-z]/.test(token)
  const hasInternalUpper = /[A-Z]/.test(token.slice(1))

  return hasDigit && hasLower && hasInternalUpper
}

export function splitTitleCompounds(value: string) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
}

export function inferCategory(text: string): string {
  const source = text.toLowerCase()
  const pairs: Array<[string, string[]]> = [
    ["Heroes", ["spider", "batman", "marvel", "deadpool", "iron man", "venom"]],
    ["Cars", ["car", "cars", "bmw", "porsche", "ferrari", "lambo", "jdm"]],
    ["Gaming", ["game", "gaming", "dark souls", "zelda", "elden", "minecraft"]],
    ["Anime", ["anime", "goku", "gojo", "naruto", "manga", "kimetsu"]],
    ["Space", ["space", "planet", "galaxy", "black hole", "nebula"]],
    ["Nature", ["nature", "forest", "fern", "ocean", "mountain", "rain"]],
    ["Dark", ["dark", "noir", "midnight", "cyberpunk", "night"]],
    ["Abstract", ["abstract", "geometric", "texture", "waveform"]],
    ["Others", ["cat", "kitten", "leopard", "ronaldo", "disney"]],
  ]

  return (
    pairs.find(([, words]) =>
      words.some((word) => source.includes(word))
    )?.[0] ?? DEFAULT_WALLPAPER_CATEGORY
  )
}

export function inferTags(text: string): string[] {
  const stop = new Set([
    "and",
    "the",
    "for",
    "with",
    "live",
    "wallpaper",
    "video",
    "loop",
  ])
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !stop.has(word))

  return [...new Set(words)].slice(0, 8)
}

export function fileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

export function normalizeVideoContentType(
  contentType: string,
  extension: string
) {
  if (contentType) return contentType
  if (extension === "mov") return "video/quicktime"
  if (extension === "m4v") return "video/x-m4v"
  if (extension === "webm") return "video/webm"
  return "video/mp4"
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
  return slug || "wallpaper"
}

export function uniqueSlug(base: string, used: Set<string>) {
  const root = base.slice(0, 96) || "wallpaper"
  let slug = root
  let suffix = 2
  while (used.has(slug)) {
    slug = `${root}-${suffix}`
    suffix += 1
  }
  return slug
}

export function toTitleCase(value: string) {
  const small = new Set(["and", "or", "the", "of", "in", "on", "with", "by"])
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && small.has(lower)) return lower
      if (/^[ivx]+$/i.test(word)) return word.toUpperCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}

export function tagsFromText(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

export function normalizeAiTitle(value: string, fallback: string) {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9\s:.'&-]/g, "")
    .trim()
  return toTitleCase(cleaned || fallback).slice(0, 140)
}

export function normalizeAiTags(
  tags: string[],
  title: string,
  category: string
): string[] {
  const normalized = tags
    .map((tag) =>
      tag
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter((tag) => tag.length >= 2 && tag.length <= 32)

  const fallback = inferTags(`${title} ${category}`)
  return [...new Set([...normalized, ...fallback])].slice(0, 10)
}

export function catalogDraftPayload(draft: CatalogDraft) {
  return {
    clientId: draft.localId,
    id: draft.id,
    name: draft.name,
    category: draft.category,
    tags: tagsFromText(draft.tagsText),
    resolution: draft.resolution,
    durationSeconds: draft.durationSeconds,
    fileSizeBytes: draft.fileSizeBytes,
    videoKey: draft.videoKey,
    thumbKey: draft.thumbKey,
    thumbSizeBytes: draft.thumbBlob?.size ?? 0,
    isPro: draft.isPro,
    isFeatured: draft.isFeatured,
    isCuratedPick: draft.isCuratedPick,
  }
}

export function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}
