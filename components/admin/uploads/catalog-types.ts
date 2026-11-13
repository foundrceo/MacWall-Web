/**
 * Types and limits for the bulk catalog uploader. The pipeline is split
 * across the `catalog-*` files next to this one:
 *
 *   catalog-drafts.ts           file name parsing, slugs, validation
 *   catalog-media.ts            video inspection and thumbnail capture
 *   catalog-pipeline.ts         AI metadata, signing, R2 upload, commit
 *   catalog-session.ts          IndexedDB session save and recovery
 *   catalog-use-bulk-upload.ts  the state machine the panel renders
 */

export const MAX_FILES = 300
export const METADATA_READ_CONCURRENCY = 3
export const AI_ANALYSIS_CHUNK_SIZE = 6
export const AI_ANALYSIS_CONCURRENCY = 2
export const THUMB_MAX_WIDTH = 1280
export const THUMB_QUALITY = 0.86
export const AI_THUMB_MAX_WIDTH = 512
export const AI_THUMB_QUALITY = 0.72
export const UPLOAD_SESSION_DB_NAME = "macwall-admin-upload-session"
export const UPLOAD_SESSION_STORE = "sessions"
export const UPLOAD_SESSION_KEY = "catalog-bulk-upload-v1"
export const UPLOAD_SESSION_VERSION = 1
export const UPLOAD_SESSION_SAVE_DELAY_MS = 900
export const WALLPAPER_ID_RE = /^[a-z0-9][a-z0-9-]{1,127}$/
export const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm"])

export type DraftStatus =
  "ready" | "analyzing" | "uploading" | "uploaded" | "committed" | "error"

export type CatalogDraft = {
  localId: string
  file: File
  fileHandle: BrowserFileSystemFileHandle | null
  sourceFileName: string
  id: string
  videoExtension: string
  videoKey: string
  thumbKey: string
  name: string
  category: string
  tagsText: string
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  videoContentType: string
  thumbBlob: Blob | null
  thumbUrl: string | null
  isPro: boolean
  isFeatured: boolean
  isCuratedPick: boolean
  trimStartSeconds: number
  trimEndSeconds: number | null
  status: DraftStatus
  progress: number
  error: string | null
}

export type StorageUploadMode = "r2"

export type SignedUploadResponse = {
  bucket: string
  mode: StorageUploadMode
  publicBaseUrl: string
  cacheControl: string
  uploads: Array<{
    clientId: string
    id: string
    video: SignedUploadTarget
    thumb: SignedUploadTarget
    videoContentType: string
    thumbContentType: string
  }>
  error?: string
}

export type SignedUploadTarget = {
  path: string
  signedUrl: string | null
  alreadyUploaded: boolean
  mode: StorageUploadMode
}

export type CommitResponse = {
  inserted: number
  error?: string
}

export type AiMetadataResponse = {
  items: AiMetadataItem[]
  error?: string
}

export type AiMetadataItem = {
  clientId: string
  name: string
  category: string
  tags: string[]
}

export type DraftValidation = {
  ok: boolean
  message: string | null
  /** The input the message belongs to, when it is about one. */
  field: DraftField | null
}

export type UploadRunPhase = "processing" | "complete"

export type UploadRun = {
  phase: UploadRunPhase
  /** Drafts in this run, for the overall progress meter. */
  localIds: string[]
  total: number
  current: number
  published: number
  failed: number
}

export type BrowserFileSystemFileHandle = {
  kind?: string
  name: string
  getFile: () => Promise<File>
  queryPermission?: (descriptor?: { mode?: "read" }) => Promise<PermissionState>
  requestPermission?: (descriptor?: {
    mode?: "read"
  }) => Promise<PermissionState>
}

export type FilePickerWindow = Window &
  typeof globalThis & {
    showOpenFilePicker?: (options?: {
      excludeAcceptAllOption?: boolean
      multiple?: boolean
      types?: Array<{
        description?: string
        accept: Record<string, string[]>
      }>
    }) => Promise<BrowserFileSystemFileHandle[]>
  }

export type DataTransferItemWithHandle = DataTransferItem & {
  getAsFileSystemHandle?: () => Promise<BrowserFileSystemFileHandle | null>
}

export type StagedFileInput = {
  file: File
  fileHandle: BrowserFileSystemFileHandle | null
}

export type PersistedCatalogDraft = Omit<CatalogDraft, "file" | "thumbUrl"> & {
  file: File | null
}

export type PersistedUploadSession = {
  version: typeof UPLOAD_SESSION_VERSION
  updatedAt: string
  drafts: PersistedCatalogDraft[]
}

export type RecoverableSession = {
  updatedAt: string
  count: number
}

export type DraftField = "name" | "id" | "category"

export type PanelNotice = {
  tone: "info" | "success" | "warning"
  text: string
}
