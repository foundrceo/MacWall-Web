"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  FilesIcon,
  ImageAddIcon,
  Loading01Icon,
  Delete01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  AdminBadge,
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminNotice,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
} from "@/components/admin/admin-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  DEFAULT_WALLPAPER_CATEGORY,
  WALLPAPER_CATEGORIES,
} from "@/lib/wallpaper-categories"

const MAX_FILES = 300
const METADATA_READ_CONCURRENCY = 3
const AI_ANALYSIS_CHUNK_SIZE = 6
const AI_ANALYSIS_CONCURRENCY = 2
const UPLOAD_RETRY_ATTEMPTS = 3
const UPLOAD_RETRY_BASE_DELAY_MS = 800
const THUMB_MAX_WIDTH = 1280
const THUMB_QUALITY = 0.86
const AI_THUMB_MAX_WIDTH = 512
const AI_THUMB_QUALITY = 0.72
const UPLOAD_SESSION_DB_NAME = "macwall-admin-upload-session"
const UPLOAD_SESSION_STORE = "sessions"
const UPLOAD_SESSION_KEY = "catalog-bulk-upload-v1"
const UPLOAD_SESSION_VERSION = 1
const UPLOAD_SESSION_SAVE_DELAY_MS = 900
const WALLPAPER_ID_RE = /^[a-z0-9][a-z0-9-]{1,127}$/
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm"])

type DraftStatus =
  | "ready"
  | "analyzing"
  | "uploading"
  | "uploaded"
  | "committed"
  | "error"

type CatalogDraft = {
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
  status: DraftStatus
  progress: number
  error: string | null
}

type StorageUploadMode = "r2"

type SignedUploadResponse = {
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

type SignedUploadTarget = {
  path: string
  signedUrl: string | null
  alreadyUploaded: boolean
  mode: StorageUploadMode
}

type CommitResponse = {
  inserted: number
  error?: string
}

type AiMetadataResponse = {
  items: AiMetadataItem[]
  error?: string
}

type AiMetadataItem = {
  clientId: string
  name: string
  category: string
  tags: string[]
}

type DraftValidation = {
  ok: boolean
  message: string | null
}

type UploadRunPhase = "processing" | "complete"

type UploadRun = {
  phase: UploadRunPhase
  total: number
  current: number
  published: number
  failed: number
}

type BrowserFileSystemFileHandle = {
  kind?: string
  name: string
  getFile: () => Promise<File>
  queryPermission?: (descriptor?: { mode?: "read" }) => Promise<PermissionState>
  requestPermission?: (descriptor?: {
    mode?: "read"
  }) => Promise<PermissionState>
}

type FilePickerWindow = Window &
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

type DataTransferItemWithHandle = DataTransferItem & {
  getAsFileSystemHandle?: () => Promise<BrowserFileSystemFileHandle | null>
}

type StagedFileInput = {
  file: File
  fileHandle: BrowserFileSystemFileHandle | null
}

type PersistedCatalogDraft = Omit<CatalogDraft, "file" | "thumbUrl"> & {
  file: File | null
}

type PersistedUploadSession = {
  version: typeof UPLOAD_SESSION_VERSION
  updatedAt: string
  drafts: PersistedCatalogDraft[]
}

type RecoverableSession = {
  updatedAt: string
  count: number
}

export function CatalogBulkUploadPanel({
  onUploaded,
}: Readonly<{ onUploaded?: () => Promise<void> | void }>) {
  const [drafts, setDrafts] = useState<CatalogDraft[]>([])
  const [busy, setBusy] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadRun, setUploadRun] = useState<UploadRun | null>(null)
  const [persistenceReady, setPersistenceReady] = useState(false)
  const [recoverableSession, setRecoverableSession] =
    useState<RecoverableSession | null>(null)
  const pendingRecoveryRef = useRef<PersistedUploadSession | null>(null)
  const [dragDepth, setDragDepth] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const draftsRef = useRef<CatalogDraft[]>([])

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  useEffect(
    () => () => {
      for (const draft of draftsRef.current) {
        if (draft.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
      }
    },
    []
  )

  useEffect(() => {
    let cancelled = false

    void loadPersistedUploadSession()
      .then((session) => {
        if (cancelled) return
        if (session?.drafts.length && draftsRef.current.length === 0) {
          pendingRecoveryRef.current = session
          setRecoverableSession({
            updatedAt: session.updatedAt,
            count: session.drafts.length,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setPersistenceReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!busy) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [busy])

  useEffect(() => {
    if (!persistenceReady || busy) return

    const timeout = window.setTimeout(() => {
      if (draftsRef.current.length) {
        void savePersistedUploadSession(draftsRef.current)
      } else if (!recoverableSession) {
        void deletePersistedUploadSession()
      }
    }, UPLOAD_SESSION_SAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [drafts, persistenceReady, recoverableSession])

  const validation = useMemo(() => validateDrafts(drafts), [drafts])

  const readyCount = drafts.filter(
    (draft) => validation.get(draft.localId)?.ok && draft.status !== "committed"
  ).length
  const committedCount = drafts.filter(
    (draft) => draft.status === "committed"
  ).length
  const canStageMore = !busy && !analyzing && drafts.length < MAX_FILES
  const dragActive = dragDepth > 0 && canStageMore

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    await stageFiles(files.map((file) => ({ file, fileHandle: null })))
  }

  async function pickFiles() {
    if (busy || analyzing || draftsRef.current.length >= MAX_FILES) return

    const picker = window as FilePickerWindow
    if (!picker.showOpenFilePicker) {
      fileInputRef.current?.click()
      return
    }

    try {
      const handles = await picker.showOpenFilePicker({
        multiple: true,
        excludeAcceptAllOption: false,
        types: [
          {
            description: "Videos",
            accept: {
              "video/mp4": [".mp4", ".m4v"],
              "video/quicktime": [".mov"],
              "video/webm": [".webm"],
            },
          },
        ],
      })
      const items = await Promise.all(
        handles.map(async (fileHandle) => ({
          file: await fileHandle.getFile(),
          fileHandle,
        }))
      )
      await stageFiles(items)
    } catch (err) {
      if (isAbortError(err)) return
      setError(err instanceof Error ? err.message : "Could not select videos.")
    }
  }

  async function filesFromDrop(event: DragEvent<HTMLElement>) {
    const items = Array.from(event.dataTransfer.items ?? [])
    if (items.length) {
      return Promise.all(
        items
          .filter((item) => item.kind === "file")
          .map(async (item) => {
            const withHandle = item as DataTransferItemWithHandle
            const fileHandle = await withHandle.getAsFileSystemHandle?.()
            const file = fileHandle
              ? await fileHandle.getFile()
              : item.getAsFile()
            return file ? { file, fileHandle } : null
          })
      ).then((results) =>
        results.filter((item): item is StagedFileInput => Boolean(item))
      )
    }

    return Array.from(event.dataTransfer.files).map((file) => ({
      file,
      fileHandle: null,
    }))
  }

  async function stageFiles(inputs: StagedFileInput[]) {
    if (!inputs.length) return
    if (busy || analyzing) return
    if (draftsRef.current.length >= MAX_FILES) {
      setError(`Remove a staged item before adding more than ${MAX_FILES}.`)
      return
    }

    setError(null)
    setNotice(null)
    setAnalyzing(true)

    try {
      const availableSlots = Math.max(0, MAX_FILES - draftsRef.current.length)
      const nextFiles = inputs.slice(0, availableSlots)
      if (nextFiles.length !== inputs.length) {
        setNotice(`Only ${MAX_FILES} wallpapers can be staged at once.`)
      }

      const usedIds = new Set(draftsRef.current.map((draft) => draft.id))
      const rejected: string[] = []
      const staged: CatalogDraft[] = []
      for (const { file, fileHandle } of nextFiles) {
        const localId = createLocalId()
        let initial: CatalogDraft
        try {
          initial = createInitialDraft(file, fileHandle, localId, usedIds)
        } catch (err) {
          rejected.push(err instanceof Error ? err.message : file.name)
          continue
        }
        staged.push(initial)
      }

      if (staged.length) {
        setDrafts((current) => [...current, ...staged])
      }

      const inspectedDrafts: CatalogDraft[] = []
      await runPool(staged, METADATA_READ_CONCURRENCY, async (initial) => {
        try {
          const inspected = await inspectVideoFile(initial.file)
          const ready: CatalogDraft = {
            ...initial,
            resolution: `${inspected.width}x${inspected.height}`,
            durationSeconds: inspected.durationSeconds,
            thumbBlob: inspected.thumbBlob,
            thumbUrl: inspected.thumbUrl,
            status: "ready",
          }
          inspectedDrafts.push(ready)
          setDrafts((current) =>
            current.map((draft) =>
              draft.localId === initial.localId ? ready : draft
            )
          )
        } catch (err) {
          setDrafts((current) =>
            current.map((draft) =>
              draft.localId === initial.localId
                ? {
                    ...draft,
                    status: "error",
                    error:
                      err instanceof Error
                        ? err.message
                        : "Could not read video metadata.",
                  }
                : draft
            )
          )
        }
      })

      if (inspectedDrafts.length) {
        await analyzeDraftMetadata(inspectedDrafts)
      }

      if (rejected.length) {
        setError(
          rejected.length === 1
            ? rejected[0]
            : `${rejected.length} files were skipped because they are not supported videos.`
        )
      }
    } finally {
      setAnalyzing(false)
    }
  }

  async function analyzeDraftMetadata(targetDrafts: CatalogDraft[]) {
    const draftsWithThumbs = targetDrafts.filter((draft) => draft.thumbBlob)
    if (!draftsWithThumbs.length) return

    const chunks = chunkArray(draftsWithThumbs, AI_ANALYSIS_CHUNK_SIZE)
    let analyzedCount = 0
    const failedBatches: string[] = []

    setNotice(
      `AI is analyzing ${draftsWithThumbs.length.toLocaleString()} thumbnails for professional metadata.`
    )

    await runPool(chunks, AI_ANALYSIS_CONCURRENCY, async (chunk) => {
      for (const draft of chunk) {
        updateDraft(draft.localId, (current) =>
          current.status === "ready"
            ? { ...current, status: "analyzing" }
            : current
        )
      }

      try {
        const items = await Promise.all(
          chunk.map(async (draft) => ({
            clientId: draft.localId,
            sourceFileName: draft.sourceFileName,
            initialName: draft.name,
            initialCategory: draft.category,
            initialTags: tagsFromText(draft.tagsText),
            thumbDataUrl: await blobToResizedJpegDataUrl(draft.thumbBlob!),
          }))
        )

        const response = await fetch(
          "/api/admin/wallpapers/bulk-upload/analyze",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ items }),
          }
        )
        const analysis = await readJsonResponse<AiMetadataResponse>(
          response,
          "Could not analyze wallpaper thumbnails."
        )
        if (!response.ok) {
          throw new Error(
            analysis.error ?? "Could not analyze wallpaper thumbnails."
          )
        }

        applyAiMetadata(analysis.items)
        const returnedClientIds = new Set(
          analysis.items.map((item) => item.clientId)
        )
        for (const draft of chunk) {
          if (returnedClientIds.has(draft.localId)) continue
          updateDraft(draft.localId, (current) =>
            current.status === "analyzing"
              ? { ...current, status: "ready", error: null }
              : current
          )
        }
        analyzedCount += analysis.items.length
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Could not analyze wallpaper thumbnails."
        failedBatches.push(message)
        for (const draft of chunk) {
          updateDraft(draft.localId, (current) =>
            current.status === "analyzing"
              ? { ...current, status: "ready", error: null }
              : current
          )
        }
      }
    })

    setNotice(
      failedBatches.length
        ? `AI analyzed ${analyzedCount.toLocaleString()} wallpapers. ${failedBatches.length.toLocaleString()} batch failed, so those rows kept filename metadata.`
        : `AI analyzed ${analyzedCount.toLocaleString()} wallpapers and filled professional names, categories, and tags.`
    )
  }

  function applyAiMetadata(items: AiMetadataItem[]) {
    const metadataByClientId = new Map(
      items.map((item) => [item.clientId, item])
    )
    setDrafts((current) => {
      const usedIds = new Set(
        current
          .filter((draft) => !metadataByClientId.has(draft.localId))
          .map((draft) => draft.id)
      )

      return current.map((draft) => {
        const metadata = metadataByClientId.get(draft.localId)
        if (!metadata || draft.status === "committed") return draft

        const name = normalizeAiTitle(metadata.name, draft.name)
        const category = WALLPAPER_CATEGORIES.includes(metadata.category)
          ? metadata.category
          : draft.category
        const tags = normalizeAiTags(metadata.tags, name, category)
        const id = uniqueSlug(slugify(name), usedIds)
        usedIds.add(id)

        return {
          ...draft,
          id,
          name,
          category,
          tagsText: tags.join(", "),
          videoKey: `videos/${id}.${draft.videoExtension}`,
          thumbKey: `thumbs/${id}.jpg`,
          status: draft.status === "analyzing" ? "ready" : draft.status,
          error: null,
        }
      })
    })
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    if (!canStageMore) return
    setDragDepth((current) => current + 1)
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = canStageMore ? "copy" : "none"
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    setDragDepth((current) => Math.max(0, current - 1))
  }

  async function handleDrop(event: DragEvent<HTMLElement>) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    setDragDepth(0)
    if (!canStageMore) return
    await stageFiles(await filesFromDrop(event))
  }

  function handleDropZoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    if (canStageMore) void pickFiles()
  }

  function updateDraft(
    localId: string,
    updater: (draft: CatalogDraft) => CatalogDraft
  ) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.localId === localId ? updater(draft) : draft
      )
    )
  }

  function updateDraftId(localId: string, rawId: string) {
    const id = slugify(rawId).slice(0, 128)
    updateDraft(localId, (draft) => ({
      ...draft,
      id,
      videoKey: `videos/${id}.${draft.videoExtension}`,
      thumbKey: `thumbs/${id}.jpg`,
      status: draft.status === "error" ? "ready" : draft.status,
      error: null,
    }))
  }

  async function replaceThumb(localId: string, file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      const { blob, url } = await imageFileToJpegBlob(file)
      updateDraft(localId, (draft) => {
        if (draft.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
        return {
          ...draft,
          thumbBlob: blob,
          thumbUrl: url,
          status: draft.status === "error" ? "ready" : draft.status,
          error: null,
        }
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not use that thumbnail."
      )
    }
  }

  function removeDraft(localId: string) {
    setDrafts((current) => {
      const draft = current.find((item) => item.localId === localId)
      if (draft?.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
      return current.filter((item) => item.localId !== localId)
    })
  }

  function clearDrafts() {
    for (const draft of drafts) {
      if (draft.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
    }
    setDrafts([])
    setUploadRun(null)
    pendingRecoveryRef.current = null
    setRecoverableSession(null)
    setNotice(null)
    setError(null)
    void deletePersistedUploadSession()
  }

  async function restoreLastUploadSession() {
    const session = pendingRecoveryRef.current
    if (!session?.drafts.length) return

    for (const draft of draftsRef.current) {
      if (draft.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
    }

    const { drafts: restored, failed } = await recoverPersistedDrafts(
      session.drafts
    )
    setDrafts(restored)
    setUploadRun(null)
    pendingRecoveryRef.current = null
    setRecoverableSession(null)
    setError(null)
    setNotice(
      failed
        ? `Restored ${restored.length.toLocaleString()} wallpapers. ${failed.toLocaleString()} files need to be selected again.`
        : `Restored ${restored.length.toLocaleString()} wallpapers from the last upload session.`
    )
  }

  function discardLastUploadSession() {
    pendingRecoveryRef.current = null
    setRecoverableSession(null)
    void deletePersistedUploadSession()
  }

  async function handleUpload() {
    const candidates = drafts.filter(
      (draft) =>
        draft.status !== "committed" && validation.get(draft.localId)?.ok
    )
    if (!candidates.length) {
      setError("No valid wallpapers are ready to upload.")
      return
    }

    setBusy(true)
    setError(null)
    setNotice(null)

    let publishedCount = 0
    let failedCount = 0
    const failures: string[] = []

    setUploadRun({
      phase: "processing",
      total: candidates.length,
      current: 0,
      published: 0,
      failed: 0,
    })

    try {
      for (let index = 0; index < candidates.length; index += 1) {
        const draft = candidates[index]
        setUploadRun((current) =>
          current ? { ...current, current: index + 1 } : current
        )

        try {
          if (!draft.thumbBlob) {
            throw new Error("Missing thumbnail.")
          }

          const liveDraft =
            draftsRef.current.find((item) => item.localId === draft.localId) ??
            draft

          if (liveDraft.status !== "uploaded") {
            updateDraft(liveDraft.localId, (current) => ({
              ...current,
              status: "uploading",
              progress: 5,
              error: null,
            }))

            const signed = await signCatalogDraft(liveDraft)
            const upload = signed.uploads[0]
            if (!upload) {
              throw new Error("Could not prepare upload tokens.")
            }

            updateDraft(liveDraft.localId, (current) => ({
              ...current,
              progress: 15,
            }))

            await uploadStorageTarget({
              target: upload.video,
              fileBody: liveDraft.file,
              contentType: liveDraft.videoContentType,
            })

            updateDraft(liveDraft.localId, (current) => ({
              ...current,
              progress: 55,
            }))

            await uploadStorageTarget({
              target: upload.thumb,
              fileBody: liveDraft.thumbBlob!,
              contentType: "image/jpeg",
            })

            updateDraft(liveDraft.localId, (current) => ({
              ...current,
              status: "uploaded",
              progress: 85,
            }))
          } else {
            updateDraft(liveDraft.localId, (current) => ({
              ...current,
              status: "uploading",
              progress: 85,
              error: null,
            }))
          }

          await commitCatalogDraft(
            draftsRef.current.find((item) => item.localId === draft.localId) ??
              liveDraft
          )

          publishedCount += 1
          updateDraft(liveDraft.localId, (current) => ({
            ...current,
            status: "committed",
            progress: 100,
            error: null,
          }))
          setUploadRun((current) =>
            current ? { ...current, published: publishedCount } : current
          )
        } catch (err) {
          failedCount += 1
          const message = err instanceof Error ? err.message : "Upload failed."
          failures.push(`${draft.name}: ${message}`)
          updateDraft(draft.localId, (current) => ({
            ...current,
            status: "error",
            error: message,
          }))
          setUploadRun((current) =>
            current ? { ...current, failed: failedCount } : current
          )
        }
      }

      setUploadRun((current) =>
        current ? { ...current, phase: "complete" } : current
      )

      if (publishedCount === 0) {
        throw new Error(failures[0] ?? "No wallpapers were published.")
      }

      if (failures.length) {
        setNotice(
          `Published ${publishedCount.toLocaleString()} wallpapers. ${failures.length.toLocaleString()} still need attention — fix the row and upload again.`
        )
        setError(failures.slice(0, 2).join(" "))
      } else {
        setNotice(`Published ${publishedCount.toLocaleString()} wallpapers.`)
      }

      if (publishedCount === candidates.length) {
        void deletePersistedUploadSession()
      }
      await onUploaded?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed."
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminSurface>
      <AdminSurfaceHeader
        title="Bulk catalog upload"
        description="Stage up to 300 videos, let AI analyze thumbnails for metadata, then publish one-by-one directly to Cloudflare R2."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => void pickFiles()}
              disabled={busy || analyzing || drafts.length >= MAX_FILES}
              className="gap-1.5"
            >
              <HugeiconsIcon icon={FilesIcon} className="size-3.5" />
              Select videos
            </AdminButton>
            <AdminButton
              size="sm"
              onClick={() => void handleUpload()}
              disabled={busy || analyzing || readyCount === 0}
              className="gap-1.5"
            >
              {busy ? (
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="size-3.5 animate-spin"
                />
              ) : (
                <HugeiconsIcon icon={Upload01Icon} className="size-3.5" />
              )}
              Upload {readyCount ? readyCount.toLocaleString() : ""}
            </AdminButton>
          </div>
        }
      />
      <AdminSurfaceBody className="space-y-4 sm:space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm"
          multiple
          className="hidden"
          onChange={(event) => void handleFilesSelected(event)}
        />

        <div className="grid gap-2 text-[13px] text-[#86868b] sm:grid-cols-3">
          <StatPill label="Staged" value={drafts.length.toLocaleString()} />
          <StatPill label="Ready" value={readyCount.toLocaleString()} />
          <StatPill label="Published" value={committedCount.toLocaleString()} />
        </div>

        {recoverableSession ? (
          <RecoverUploadSessionNotice
            session={recoverableSession}
            disabled={busy || analyzing || drafts.length > 0}
            onRestore={restoreLastUploadSession}
            onDiscard={discardLastUploadSession}
          />
        ) : null}

        {notice ? <AdminNotice tone="success">{notice}</AdminNotice> : null}
        {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}
        {uploadRun ? <UploadPipelineProgress run={uploadRun} /> : null}

        <div
          role="button"
          tabIndex={canStageMore ? 0 : -1}
          aria-disabled={!canStageMore}
          onClick={() => {
            if (canStageMore) void pickFiles()
          }}
          onKeyDown={handleDropZoneKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(event) => void handleDrop(event)}
          className={cn(
            "flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed px-5 py-6 text-center transition-all duration-200 ease-out outline-none sm:min-h-40",
            dragActive
              ? "border-[#0071e3] bg-[#e8f2ff]"
              : "border-[#d2d2d7] bg-[#f5f5f7] hover:bg-[#ebebed]",
            !canStageMore && "cursor-not-allowed opacity-60"
          )}
        >
          {analyzing ? (
            <HugeiconsIcon
              icon={Loading01Icon}
              className="size-7 animate-spin text-[#0071e3]"
            />
          ) : (
            <HugeiconsIcon
              icon={Upload01Icon}
              className="size-7 text-[#0071e3]"
            />
          )}
          <span className="mt-3 text-[17px] font-medium tracking-[-0.02em] text-[#1d1d1f]">
            {dragActive ? "Drop videos to stage" : "Drag videos here"}
          </span>
          <span className="mt-1 text-[13px] text-[#86868b]">
            Select or drop MP4, MOV, M4V, and WEBM files.
          </span>
        </div>

        {drafts.length ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-[#86868b]">
                Direct paths: <span className="font-medium">videos/</span> and{" "}
                <span className="font-medium">thumbs/</span>
              </p>
              <AdminButton
                size="sm"
                variant="ghost"
                onClick={clearDrafts}
                disabled={busy}
              >
                Clear
              </AdminButton>
            </div>

            <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {drafts.map((draft) => (
                <DraftRow
                  key={draft.localId}
                  draft={draft}
                  validation={validation.get(draft.localId) ?? null}
                  disabled={busy || draft.status === "committed"}
                  onUpdate={updateDraft}
                  onUpdateId={updateDraftId}
                  onRemove={removeDraft}
                  onReplaceThumb={(file) =>
                    void replaceThumb(draft.localId, file)
                  }
                />
              ))}
            </div>
          </div>
        ) : null}
      </AdminSurfaceBody>
    </AdminSurface>
  )
}

function DraftRow({
  draft,
  validation,
  disabled,
  onUpdate,
  onUpdateId,
  onRemove,
  onReplaceThumb,
}: Readonly<{
  draft: CatalogDraft
  validation: DraftValidation | null
  disabled: boolean
  onUpdate: (
    localId: string,
    updater: (draft: CatalogDraft) => CatalogDraft
  ) => void
  onUpdateId: (localId: string, rawId: string) => void
  onRemove: (localId: string) => void
  onReplaceThumb: (file: File | undefined) => void
}>) {
  const statusTone =
    draft.status === "committed"
      ? "green"
      : draft.status === "uploaded"
        ? "blue"
        : draft.status === "error" || validation?.ok === false
          ? "red"
          : "neutral"

  const idLocked = disabled || draft.status === "uploaded"

  return (
    <div className="rounded-[20px] bg-[#f5f5f7] p-3 transition-colors duration-200 sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[148px_1fr_auto]">
        <div className="space-y-2">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/[0.04]">
            {draft.thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.thumbUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                {draft.status === "analyzing" ? (
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    className="size-5 animate-spin text-[#86868b]"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={ImageAddIcon}
                    className="size-5 text-[#86868b]"
                  />
                )}
              </div>
            )}
          </div>
          <label
            className={cn(
              "inline-flex min-h-8 w-full cursor-pointer items-center justify-center rounded-full bg-white px-3 text-[12px] text-[#1d1d1f]/80 transition-colors hover:bg-[#ebebed]",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            Replace thumb
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={disabled}
              onChange={(event) => {
                onReplaceThumb(event.target.files?.[0])
                event.target.value = ""
              }}
            />
          </label>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <Field label="Title">
            <AdminInput
              value={draft.name}
              disabled={disabled}
              onChange={(event) =>
                onUpdate(draft.localId, (current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Wallpaper ID">
            <AdminInput
              value={draft.id}
              disabled={idLocked}
              onChange={(event) =>
                onUpdateId(draft.localId, event.target.value)
              }
            />
          </Field>

          <Field label="Category">
            <Select
              value={draft.category}
              disabled={disabled}
              onValueChange={(category) =>
                onUpdate(draft.localId, (current) => ({
                  ...current,
                  category,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLPAPER_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tags">
            <AdminInput
              value={draft.tagsText}
              disabled={disabled}
              placeholder="comma, separated, tags"
              onChange={(event) =>
                onUpdate(draft.localId, (current) => ({
                  ...current,
                  tagsText: event.target.value,
                }))
              }
            />
          </Field>

          <div className="xl:col-span-2">
            <div className="grid gap-2 sm:grid-cols-4">
              <Info label="Resolution" value={draft.resolution} />
              <Info
                label="Duration"
                value={formatDuration(draft.durationSeconds)}
              />
              <Info label="Size" value={formatBytes(draft.fileSizeBytes)} />
              <Info label="Path" value={draft.videoKey} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:col-span-2">
            <TogglePill
              label="Featured"
              checked={draft.isFeatured}
              disabled={disabled}
              onChange={(isFeatured) =>
                onUpdate(draft.localId, (current) => ({
                  ...current,
                  isFeatured,
                }))
              }
            />
            <TogglePill
              label="Curated pick"
              checked={draft.isCuratedPick}
              disabled={disabled}
              onChange={(isCuratedPick) =>
                onUpdate(draft.localId, (current) => ({
                  ...current,
                  isCuratedPick,
                }))
              }
            />
            <TogglePill
              label="Pro"
              checked={draft.isPro}
              disabled={disabled}
              onChange={(isPro) =>
                onUpdate(draft.localId, (current) => ({
                  ...current,
                  isPro,
                }))
              }
            />
          </div>

          {validation?.message || draft.error ? (
            <p className="text-[12px] text-[#d70015] xl:col-span-2">
              {validation?.message ?? draft.error}
            </p>
          ) : null}
        </div>

        <div className="flex items-start gap-2 lg:flex-col lg:items-end">
          <AdminBadge tone={statusTone}>
            <span className="inline-flex items-center gap-1">
              {draft.status === "uploading" || draft.status === "analyzing" ? (
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="size-3 animate-spin"
                />
              ) : draft.status === "committed" ||
                draft.status === "uploaded" ? (
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="size-3"
                />
              ) : draft.status === "error" || validation?.ok === false ? (
                <HugeiconsIcon icon={AlertCircleIcon} className="size-3" />
              ) : null}
              {statusLabel(draft.status, draft.progress)}
            </span>
          </AdminBadge>
          <AdminButton
            size="sm"
            variant="ghost"
            aria-label={`Remove ${draft.name}`}
            disabled={disabled}
            onClick={() => onRemove(draft.localId)}
          >
            <HugeiconsIcon icon={Delete01Icon} className="size-4" />
          </AdminButton>
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] text-[#86868b]">
        Source: {draft.sourceFileName}
      </p>
    </div>
  )
}

function Field({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="space-y-1.5">
      <AdminLabel>{label}</AdminLabel>
      {children}
    </div>
  )
}

function TogglePill({
  label,
  checked,
  disabled,
  onChange,
}: Readonly<{
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}>) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] text-[#1d1d1f]">
      <Switch
        size="sm"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
      {label}
    </label>
  )
}

function StatPill({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3">
      <p className="text-[12px] text-[#86868b]">{label}</p>
      <p className="mt-0.5 text-[18px] font-semibold text-[#1d1d1f] tabular-nums">
        {value}
      </p>
    </div>
  )
}

function RecoverUploadSessionNotice({
  session,
  disabled,
  onRestore,
  onDiscard,
}: Readonly<{
  session: RecoverableSession
  disabled: boolean
  onRestore: () => Promise<void>
  onDiscard: () => void
}>) {
  return (
    <div className="rounded-2xl border border-[#0071e3]/25 bg-[#e8f2ff] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#1d1d1f]">
            Recover last upload session
          </p>
          <p className="mt-0.5 text-[12px] text-[#3f6f9f]">
            {session.count.toLocaleString()} staged wallpapers saved{" "}
            {formatRecoveryTime(session.updatedAt)}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() => void onRestore()}
          >
            Restore
          </AdminButton>
          <AdminButton
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={onDiscard}
          >
            Discard
          </AdminButton>
        </div>
      </div>
      {disabled ? (
        <p className="mt-2 text-[12px] text-[#3f6f9f]">
          Clear the current staged list before restoring the saved session.
        </p>
      ) : null}
    </div>
  )
}

function UploadPipelineProgress({ run }: Readonly<{ run: UploadRun }>) {
  const left = Math.max(0, run.total - run.published - run.failed)

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-[#1d1d1f]">
            {uploadPhaseLabel(run.phase)}
          </p>
          <p className="mt-0.5 text-[12px] text-[#86868b]">
            Processing wallpaper {run.current.toLocaleString()} of{" "}
            {run.total.toLocaleString()}
          </p>
        </div>
        <AdminBadge tone={run.failed ? "red" : "blue"}>
          {run.published.toLocaleString()} published / {left.toLocaleString()}{" "}
          left
        </AdminBadge>
      </div>

      <div className="mt-4">
        <ProgressLine
          label="Catalog publish"
          value={run.published}
          total={run.total}
        />
      </div>

      {run.failed ? (
        <p className="mt-3 text-[12px] text-[#d70015]">
          {run.failed.toLocaleString()} failed. Fix the row error and upload
          again to retry only those wallpapers.
        </p>
      ) : null}
    </div>
  )
}

function ProgressLine({
  label,
  value,
  total,
}: Readonly<{ label: string; value: number; total: number }>) {
  const percent = progressPercent(value, total)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
        <span className="font-medium text-[#1d1d1f]">{label}</span>
        <span className="text-[#86868b] tabular-nums">
          {value.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e8e8ed]">
        <div
          className="h-full rounded-full bg-[#0071e3] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function Info({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0 rounded-2xl bg-white px-3 py-2">
      <p className="text-[11px] text-[#86868b]">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-medium text-[#1d1d1f] tabular-nums">
        {value || "-"}
      </p>
    </div>
  )
}

function createInitialDraft(
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
    status: "analyzing",
    progress: 0,
    error: null,
  }
}

async function recoverPersistedDrafts(
  drafts: PersistedCatalogDraft[]
): Promise<{ drafts: CatalogDraft[]; failed: number }> {
  const restored: CatalogDraft[] = []
  let failed = 0

  for (const draft of drafts) {
    const file = await recoverPersistedFile(draft)
    if (!file) {
      failed += 1
      continue
    }

    const hasThumb = Boolean(draft.thumbBlob)
    const status =
      draft.status === "committed" || draft.status === "uploaded"
        ? draft.status
        : hasThumb
          ? "ready"
          : "error"

    restored.push({
      ...draft,
      file,
      thumbUrl: draft.thumbBlob ? URL.createObjectURL(draft.thumbBlob) : null,
      status,
      progress: status === "uploaded" || status === "committed" ? 100 : 0,
      error:
        status === "error"
          ? "Recovered session is missing a thumbnail. Replace the thumbnail or restage this file."
          : draft.status === "uploading"
            ? "Recovered after reload. Upload can resume."
            : null,
    })
  }

  return { drafts: restored, failed }
}

async function recoverPersistedFile(draft: PersistedCatalogDraft) {
  if (draft.file) return draft.file
  if (!draft.fileHandle) return null

  try {
    const permission = await draft.fileHandle.queryPermission?.({
      mode: "read",
    })
    if (permission === "denied") {
      const requested = await draft.fileHandle.requestPermission?.({
        mode: "read",
      })
      if (requested === "denied") return null
    }
    return await draft.fileHandle.getFile()
  } catch {
    return null
  }
}

function validateDrafts(drafts: CatalogDraft[]) {
  const idCounts = new Map<string, number>()
  for (const draft of drafts) {
    idCounts.set(draft.id, (idCounts.get(draft.id) ?? 0) + 1)
  }

  return new Map(
    drafts.map((draft) => {
      let message: string | null = null
      if (!draft.name.trim() || draft.name.trim().length < 2) {
        message = "Title is required."
      } else if (!WALLPAPER_ID_RE.test(draft.id)) {
        message = "ID must be lowercase letters, numbers, and hyphens."
      } else if ((idCounts.get(draft.id) ?? 0) > 1) {
        message = "Duplicate ID in this batch."
      } else if (!WALLPAPER_CATEGORIES.includes(draft.category)) {
        message = "Choose a valid category."
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
        },
      ]
    })
  )
}

function parseWallpaperFileName(fileName: string): {
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

function removeLeadingSourceTokens(value: string) {
  const words = value.split(/\s+/).filter(Boolean)
  while (words.length > 1 && isSourceIdToken(words[0])) {
    words.shift()
  }
  return words.join(" ")
}

function isSourceIdToken(value: string) {
  const token = value.replace(/[^a-z0-9]/gi, "")
  if (token.length < 8 || token.length > 16) return false

  const hasDigit = /\d/.test(token)
  const hasLower = /[a-z]/.test(token)
  const hasInternalUpper = /[A-Z]/.test(token.slice(1))

  return hasDigit && hasLower && hasInternalUpper
}

function splitTitleCompounds(value: string) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
}

function inferCategory(text: string): string {
  const source = text.toLowerCase()
  const pairs: Array<[string, string[]]> = [
    ["Anime", ["anime", "goku", "gojo", "naruto", "manga", "kimetsu"]],
    ["Cars", ["car", "cars", "bmw", "porsche", "ferrari", "lambo", "jdm"]],
    ["Cats", ["cat", "kitten", "leopard", "tiger", "lion"]],
    ["City", ["city", "street", "tokyo", "new york", "night", "skyline"]],
    ["Fantasy", ["fantasy", "dragon", "castle", "warrior", "magic", "katana"]],
    [
      "Nature",
      ["nature", "forest", "fern", "water", "ocean", "mountain", "rain"],
    ],
    ["Sci-fi", ["sci", "cyber", "android", "robot", "future", "spaceship"]],
    ["Space", ["space", "planet", "galaxy", "black hole", "nebula", "star"]],
    [
      "Video Games",
      ["game", "gaming", "dark souls", "zelda", "elden", "minecraft"],
    ],
  ]

  return (
    pairs.find(([, words]) =>
      words.some((word) => source.includes(word))
    )?.[0] ?? DEFAULT_WALLPAPER_CATEGORY
  )
}

function inferTags(text: string): string[] {
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

async function inspectVideoFile(file: File): Promise<{
  width: number
  height: number
  durationSeconds: number
  thumbBlob: Blob
  thumbUrl: string
}> {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement("video")
  video.preload = "metadata"
  video.muted = true
  video.playsInline = true
  video.src = objectUrl

  try {
    await waitForMediaEvent(video, "loadedmetadata", "error", 15_000)
    const width = video.videoWidth
    const height = video.videoHeight
    const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0
    if (!width || !height) throw new Error("Video dimensions are missing.")

    const seekTime = Math.min(
      Math.max(durationSeconds * 0.08, 0.12),
      Math.max(durationSeconds - 0.05, 0)
    )
    if (seekTime > 0) {
      video.currentTime = seekTime
      await waitForMediaEvent(video, "seeked", "error", 15_000)
    }

    const thumbBlob = await videoFrameToJpeg(video, width, height)
    return {
      width,
      height,
      durationSeconds,
      thumbBlob,
      thumbUrl: URL.createObjectURL(thumbBlob),
    }
  } finally {
    video.removeAttribute("src")
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}

async function imageFileToJpegBlob(file: File): Promise<{
  blob: Blob
  url: string
}> {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()
  image.src = objectUrl
  await image.decode()

  try {
    const canvas = scaledCanvas(image.naturalWidth, image.naturalHeight)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is not available.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await canvasToJpegBlob(canvas)
    return { blob, url: URL.createObjectURL(blob) }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function videoFrameToJpeg(
  video: HTMLVideoElement,
  width: number,
  height: number
) {
  const canvas = scaledCanvas(width, height)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas is not available.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvasToJpegBlob(canvas)
}

function scaledCanvas(width: number, height: number) {
  const scale = Math.min(1, THUMB_MAX_WIDTH / Math.max(width, 1))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  return canvas
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not create thumbnail."))
        else resolve(blob)
      },
      "image/jpeg",
      THUMB_QUALITY
    )
  })
}

function waitForMediaEvent(
  element: HTMLMediaElement,
  eventName: keyof HTMLMediaElementEventMap,
  errorEventName: keyof HTMLMediaElementEventMap,
  timeoutMs: number
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("Timed out while reading video metadata."))
    }, timeoutMs)

    function cleanup() {
      window.clearTimeout(timeout)
      element.removeEventListener(eventName, onSuccess)
      element.removeEventListener(errorEventName, onError)
    }

    function onSuccess() {
      cleanup()
      resolve()
    }

    function onError() {
      cleanup()
      reject(new Error("Browser could not decode this media file."))
    }

    element.addEventListener(eventName, onSuccess, { once: true })
    element.addEventListener(errorEventName, onError, { once: true })
  })
}

function isFileDrag(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files")
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}

async function uploadStorageTarget({
  target,
  fileBody,
  contentType,
}: {
  target: SignedUploadTarget
  fileBody: File | Blob
  contentType: string
}) {
  if (target.alreadyUploaded) return
  await uploadR2Target({ target, fileBody, contentType })
}

async function uploadR2Target({
  target,
  fileBody,
  contentType,
}: {
  target: SignedUploadTarget
  fileBody: File | Blob
  contentType: string
}) {
  if (!target.signedUrl) {
    throw new Error(`Missing presigned upload URL for ${target.path}.`)
  }

  let lastError: unknown = null
  for (let attempt = 1; attempt <= UPLOAD_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(target.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: fileBody,
      })
      if (response.ok) return
      lastError = new Error(`HTTP ${response.status}`)
    } catch (err) {
      lastError = err
    }

    if (attempt < UPLOAD_RETRY_ATTEMPTS) {
      await sleep(UPLOAD_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
    }
  }

  throw new Error(`${target.path}: ${storageErrorMessage(lastError)}`)
}

function storageErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Storage upload failed."
  const record = error as {
    message?: unknown
    error?: unknown
    name?: unknown
    status?: unknown
    statusCode?: unknown
  }
  const message =
    typeof record.message === "string" && record.message.trim()
      ? record.message.trim()
      : "Storage upload failed."
  const details = [record.error, record.name, record.statusCode, record.status]
    .filter(
      (value): value is string | number =>
        typeof value === "string" || typeof value === "number"
    )
    .map(String)
    .filter((value) => value && value !== message)

  return details.length ? `${message} (${details.join(", ")})` : message
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) {
  let next = 0
  const workers = Array.from({
    length: Math.min(limit, items.length),
  }).map(async () => {
    while (next < items.length) {
      const item = items[next]
      next += 1
      await worker(item)
    }
  })
  return Promise.all(workers)
}

function fileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function normalizeVideoContentType(contentType: string, extension: string) {
  if (contentType) return contentType
  if (extension === "mov") return "video/quicktime"
  if (extension === "m4v") return "video/x-m4v"
  if (extension === "webm") return "video/webm"
  return "video/mp4"
}

function slugify(value: string) {
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

function uniqueSlug(base: string, used: Set<string>) {
  const root = base.slice(0, 96) || "wallpaper"
  let slug = root
  let suffix = 2
  while (used.has(slug)) {
    slug = `${root}-${suffix}`
    suffix += 1
  }
  return slug
}

function toTitleCase(value: string) {
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

function tagsFromText(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

function normalizeAiTitle(value: string, fallback: string) {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9\s:.'&-]/g, "")
    .trim()
  return toTitleCase(cleaned || fallback).slice(0, 140)
}

function normalizeAiTags(
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

async function blobToResizedJpegDataUrl(blob: Blob): Promise<string> {
  const objectUrl = URL.createObjectURL(blob)
  const image = new Image()
  image.src = objectUrl

  try {
    await image.decode()
    const scale = Math.min(
      1,
      AI_THUMB_MAX_WIDTH / Math.max(image.naturalWidth, image.naturalHeight, 1)
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is not available.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", AI_THUMB_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

async function readJsonResponse<T extends { error?: string }>(
  response: Response,
  fallback: string
): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    return { error: fallback } as T
  }
}

function statusLabel(status: DraftStatus, progress: number) {
  switch (status) {
    case "analyzing":
      return "Analyzing"
    case "uploading":
      return `Uploading ${progress}%`
    case "uploaded":
      return "Uploaded"
    case "committed":
      return "Published"
    case "error":
      return "Needs fix"
    case "ready":
    default:
      return "Ready"
  }
}

function uploadPhaseLabel(phase: UploadRunPhase) {
  switch (phase) {
    case "processing":
      return "Publishing one wallpaper at a time"
    case "complete":
      return "Upload complete"
  }
}

function catalogDraftPayload(draft: CatalogDraft) {
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

async function signCatalogDraft(draft: CatalogDraft) {
  const signRes = await fetch("/api/admin/wallpapers/bulk-upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      items: [
        {
          clientId: draft.localId,
          id: draft.id,
          videoKey: draft.videoKey,
          thumbKey: draft.thumbKey,
          videoContentType: draft.videoContentType,
          thumbContentType: "image/jpeg",
          videoSizeBytes: draft.fileSizeBytes,
          thumbSizeBytes: draft.thumbBlob?.size ?? 0,
        },
      ],
    }),
  })
  const signed = await readJsonResponse<SignedUploadResponse>(
    signRes,
    "Could not prepare upload."
  )
  if (!signRes.ok) {
    throw new Error(signed.error ?? "Could not prepare upload.")
  }
  return signed
}

async function commitCatalogDraft(draft: CatalogDraft) {
  const commitRes = await fetch("/api/admin/wallpapers/bulk-upload/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      items: [catalogDraftPayload(draft)],
    }),
  })
  const commit = await readJsonResponse<CommitResponse>(
    commitRes,
    "Could not publish wallpaper."
  )
  if (!commitRes.ok) {
    throw new Error(commit.error ?? "Could not publish wallpaper.")
  }
  return commit
}

function progressPercent(value: number, total: number) {
  if (total <= 0) return 100
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)))
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatBytes(bytes: number) {
  if (!bytes) return "-"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function formatRecoveryTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "recently"
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

async function savePersistedUploadSession(drafts: CatalogDraft[]) {
  try {
    await navigator.storage?.persist?.()
    const db = await openUploadSessionDb()
    await idbRequest(
      db
        .transaction(UPLOAD_SESSION_STORE, "readwrite")
        .objectStore(UPLOAD_SESSION_STORE)
        .put(
          {
            version: UPLOAD_SESSION_VERSION,
            updatedAt: new Date().toISOString(),
            drafts: drafts.map(serializeDraftForPersistence),
          } satisfies PersistedUploadSession,
          UPLOAD_SESSION_KEY
        )
    )
    db.close()
  } catch (err) {
    console.warn("[admin] could not save upload recovery session", err)
  }
}

async function loadPersistedUploadSession(): Promise<PersistedUploadSession | null> {
  try {
    const db = await openUploadSessionDb()
    const session = await idbRequest<PersistedUploadSession | undefined>(
      db
        .transaction(UPLOAD_SESSION_STORE, "readonly")
        .objectStore(UPLOAD_SESSION_STORE)
        .get(UPLOAD_SESSION_KEY)
    )
    db.close()

    if (session?.version !== UPLOAD_SESSION_VERSION || !session.drafts.length) {
      return null
    }
    return session
  } catch (err) {
    console.warn("[admin] could not load upload recovery session", err)
    return null
  }
}

async function deletePersistedUploadSession() {
  try {
    const db = await openUploadSessionDb()
    await idbRequest(
      db
        .transaction(UPLOAD_SESSION_STORE, "readwrite")
        .objectStore(UPLOAD_SESSION_STORE)
        .delete(UPLOAD_SESSION_KEY)
    )
    db.close()
  } catch (err) {
    console.warn("[admin] could not clear upload recovery session", err)
  }
}

function serializeDraftForPersistence(
  draft: CatalogDraft
): PersistedCatalogDraft {
  return {
    localId: draft.localId,
    file: draft.fileHandle ? null : draft.file,
    fileHandle: draft.fileHandle,
    sourceFileName: draft.sourceFileName,
    id: draft.id,
    videoExtension: draft.videoExtension,
    videoKey: draft.videoKey,
    thumbKey: draft.thumbKey,
    name: draft.name,
    category: draft.category,
    tagsText: draft.tagsText,
    resolution: draft.resolution,
    durationSeconds: draft.durationSeconds,
    fileSizeBytes: draft.fileSizeBytes,
    videoContentType: draft.videoContentType,
    thumbBlob: draft.thumbBlob,
    isPro: draft.isPro,
    isFeatured: draft.isFeatured,
    isCuratedPick: draft.isCuratedPick,
    status: draft.status,
    progress: draft.progress,
    error: draft.error,
  }
}

function openUploadSessionDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      UPLOAD_SESSION_DB_NAME,
      UPLOAD_SESSION_VERSION
    )

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(UPLOAD_SESSION_STORE)) {
        db.createObjectStore(UPLOAD_SESSION_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open upload session DB."))
  })
}

function idbRequest<T = unknown>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error("Upload session DB request failed."))
  })
}
