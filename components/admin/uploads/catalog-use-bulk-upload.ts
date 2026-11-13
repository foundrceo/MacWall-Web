"use client"

/**
 * State machine behind the bulk catalog uploader.
 *
 *   stage    files in -> draft from the file name -> read size, length and a
 *            thumbnail in the browser -> AI suggests name, category, tags
 *   review   the operator edits drafts; the batch is saved to IndexedDB
 *   upload   per draft: sign -> video to R2 -> thumbnail to R2 -> commit to
 *            the catalog. Failed drafts stay in the list and are retried by
 *            the next upload; a draft that reached "uploaded" skips straight
 *            to the commit.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import { toast } from "sonner"

import { UPLOAD_FILE_CONCURRENCY } from "@/lib/admin/r2-browser-upload"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

import {
  createInitialDraft,
  createLocalId,
  normalizeAiTags,
  normalizeAiTitle,
  slugify,
  uniqueSlug,
  validateDrafts,
} from "./catalog-drafts"
import {
  filesFromDrop,
  hasVideoFilePicker,
  isFileDrag,
  pickVideoFiles,
} from "./catalog-files"
import { imageFileToJpegBlob, inspectVideoFile } from "./catalog-media"
import {
  chunkArray,
  isAbortError,
  publishCatalogDraft,
  requestAiMetadata,
  runPool,
} from "./catalog-pipeline"
import {
  deletePersistedUploadSession,
  loadPersistedUploadSession,
  recoverPersistedDrafts,
  savePersistedUploadSession,
} from "./catalog-session"
import {
  AI_ANALYSIS_CHUNK_SIZE,
  AI_ANALYSIS_CONCURRENCY,
  MAX_FILES,
  METADATA_READ_CONCURRENCY,
  UPLOAD_SESSION_SAVE_DELAY_MS,
  type AiMetadataItem,
  type CatalogDraft,
  type PanelNotice,
  type PersistedUploadSession,
  type RecoverableSession,
  type StagedFileInput,
  type UploadRun,
} from "./catalog-types"
import type { VideoTrimRange } from "./video-editor-modal"

export function useCatalogBulkUpload({
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
  const [notice, setNotice] = useState<PanelNotice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editorDraftId, setEditorDraftId] = useState<string | null>(null)
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
  }, [busy, drafts, persistenceReady, recoverableSession])

  const validation = useMemo(() => validateDrafts(drafts), [drafts])

  const readyCount = drafts.filter(
    (draft) => validation.get(draft.localId)?.ok && draft.status !== "committed"
  ).length
  const committedCount = drafts.filter(
    (draft) => draft.status === "committed"
  ).length
  const canStageMore = !busy && !analyzing && drafts.length < MAX_FILES
  const dragActive = dragDepth > 0 && canStageMore

  const updateDraft = useCallback(
    (localId: string, updater: (draft: CatalogDraft) => CatalogDraft) => {
      setDrafts((current) =>
        current.map((draft) =>
          draft.localId === localId ? updater(draft) : draft
        )
      )
    },
    []
  )

  const applyAiMetadata = useCallback((items: AiMetadataItem[]) => {
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
  }, [])

  const analyzeDraftMetadata = useCallback(
    async (targetDrafts: CatalogDraft[]) => {
      const draftsWithThumbs = targetDrafts.filter((draft) => draft.thumbBlob)
      if (!draftsWithThumbs.length) return

      const chunks = chunkArray(draftsWithThumbs, AI_ANALYSIS_CHUNK_SIZE)
      let analyzedCount = 0
      const failedBatches: string[] = []

      setNotice({
        tone: "info",
        text: `AI is suggesting names, categories and tags for ${countOf(draftsWithThumbs.length, "thumbnail")}.`,
      })

      await runPool(chunks, AI_ANALYSIS_CONCURRENCY, async (chunk) => {
        for (const draft of chunk) {
          updateDraft(draft.localId, (current) =>
            current.status === "ready"
              ? { ...current, status: "analyzing" }
              : current
          )
        }

        try {
          const items = await requestAiMetadata(chunk)

          applyAiMetadata(items)
          const returnedClientIds = new Set(items.map((item) => item.clientId))
          for (const draft of chunk) {
            if (returnedClientIds.has(draft.localId)) continue
            updateDraft(draft.localId, (current) =>
              current.status === "analyzing"
                ? { ...current, status: "ready", error: null }
                : current
            )
          }
          analyzedCount += items.length
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
          ? {
              tone: "warning",
              text: `AI named ${countOf(analyzedCount, "wallpaper")}. ${countOf(failedBatches.length, "batch", "batches")} failed (${failedBatches[0]}), so those rows kept the names from their files.`,
            }
          : {
              tone: "success",
              text: `AI filled in names, categories and tags for ${countOf(analyzedCount, "wallpaper")}. Check them before uploading.`,
            }
      )
    },
    [applyAiMetadata, updateDraft]
  )

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
        setNotice({
          tone: "warning",
          text: `Only ${MAX_FILES} wallpapers can be staged at once. The rest were left out.`,
        })
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

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    await stageFiles(files.map((file) => ({ file, fileHandle: null })))
  }

  async function pickFiles() {
    if (busy || analyzing || draftsRef.current.length >= MAX_FILES) return

    // Stays synchronous so the click still counts as the user's gesture.
    if (!hasVideoFilePicker()) {
      fileInputRef.current?.click()
      return
    }

    try {
      await stageFiles(await pickVideoFiles())
    } catch (err) {
      if (isAbortError(err)) return
      setError(err instanceof Error ? err.message : "Could not select videos.")
    }
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

  const updateDraftId = useCallback(
    (localId: string, rawId: string) => {
      const id = slugify(rawId).slice(0, 128)
      updateDraft(localId, (draft) => ({
        ...draft,
        id,
        videoKey: `videos/${id}.${draft.videoExtension}`,
        thumbKey: `thumbs/${id}.jpg`,
        status: draft.status === "error" ? "ready" : draft.status,
        error: null,
      }))
    },
    [updateDraft]
  )

  const replaceThumb = useCallback(
    async (localId: string, file: File | undefined) => {
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
    },
    [updateDraft]
  )

  const removeDraft = useCallback((localId: string) => {
    setDrafts((current) => {
      const draft = current.find((item) => item.localId === localId)
      if (draft?.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
      return current.filter((item) => item.localId !== localId)
    })
  }, [])

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
        ? {
            tone: "warning",
            text: `Restored ${countOf(restored.length, "wallpaper")}. ${countOf(failed, "file")} could not be reopened and must be added again.`,
          }
        : {
            tone: "success",
            text: `Restored ${countOf(restored.length, "wallpaper")} from the last upload session.`,
          }
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

    const results: Array<"published" | "failed"> = []
    const failures: string[] = []

    setUploadRun({
      phase: "processing",
      localIds: candidates.map((draft) => draft.localId),
      total: candidates.length,
      current: 0,
      published: 0,
      failed: 0,
    })

    try {
      let startedCount = 0
      await runPool(candidates, UPLOAD_FILE_CONCURRENCY, async (draft) => {
        startedCount += 1
        const startedAt = startedCount
        setUploadRun((current) =>
          current ? { ...current, current: startedAt } : current
        )

        try {
          await publishCatalogDraft(draft, {
            findLive: (localId) =>
              draftsRef.current.find((item) => item.localId === localId),
            update: updateDraft,
          })

          results.push("published")
          const publishedSoFar = results.filter(
            (result) => result === "published"
          ).length
          updateDraft(draft.localId, (current) => ({
            ...current,
            status: "committed",
            progress: 100,
            error: null,
          }))
          setUploadRun((current) =>
            current ? { ...current, published: publishedSoFar } : current
          )
        } catch (err) {
          results.push("failed")
          const failedSoFar = results.filter(
            (result) => result === "failed"
          ).length
          const message = err instanceof Error ? err.message : "Upload failed."
          failures.push(`${draft.name}: ${message}`)
          updateDraft(draft.localId, (current) => ({
            ...current,
            status: "error",
            error: message,
          }))
          setUploadRun((current) =>
            current ? { ...current, failed: failedSoFar } : current
          )
        }
      })

      setUploadRun((current) =>
        current ? { ...current, phase: "complete" } : current
      )

      const publishedCount = results.filter(
        (result) => result === "published"
      ).length

      if (publishedCount === 0) {
        throw new Error(failures[0] ?? "No wallpapers were published.")
      }

      if (failures.length) {
        const text = `Published ${countOf(publishedCount, "wallpaper")}. ${failures.length.toLocaleString()} still ${failures.length === 1 ? "needs" : "need"} attention: fix the row, then upload again.`
        setNotice({ tone: "warning", text })
        setError(failures.slice(0, 2).join(" "))
        toast.warning(text)
      } else {
        const text = `Published ${countOf(publishedCount, "wallpaper")}.`
        setNotice({ tone: "success", text })
        toast.success(text)
      }

      if (publishedCount === candidates.length) {
        void deletePersistedUploadSession()
      }
      await onUploaded?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed."
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  const editorDraft =
    drafts.find((draft) => draft.localId === editorDraftId) ?? null
  const editorTrimStart = editorDraft?.trimStartSeconds
  const editorTrimEnd = editorDraft
    ? (editorDraft.trimEndSeconds ?? (editorDraft.durationSeconds || 0))
    : undefined
  /** Stable while the editor is open, so unrelated edits do not reset it. */
  const editorInitialTrim = useMemo<VideoTrimRange | null>(
    () =>
      editorTrimStart === undefined || editorTrimEnd === undefined
        ? null
        : { startSeconds: editorTrimStart, endSeconds: editorTrimEnd },
    [editorTrimStart, editorTrimEnd]
  )

  function applyEditorTrim(
    trim: VideoTrimRange,
    thumbBlob: Blob,
    thumbUrl: string
  ) {
    if (!editorDraftId) return
    updateDraft(editorDraftId, (draft) => {
      if (draft.thumbUrl) URL.revokeObjectURL(draft.thumbUrl)
      return {
        ...draft,
        trimStartSeconds: trim.startSeconds,
        trimEndSeconds: trim.endSeconds,
        durationSeconds: trim.endSeconds - trim.startSeconds,
        thumbBlob,
        thumbUrl,
        status: draft.status === "error" ? "ready" : draft.status,
        error: null,
      }
    })
    setEditorDraftId(null)
  }

  return {
    drafts,
    validation,
    busy,
    analyzing,
    uploadRun,
    recoverableSession,
    notice,
    error,
    readyCount,
    committedCount,
    canStageMore,
    dragActive,
    fileInputRef,

    pickFiles,
    handleFilesSelected,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    updateDraft,
    updateDraftId,
    replaceThumb,
    removeDraft,
    analyzeDraftMetadata,
    clearDrafts,

    restoreLastUploadSession,
    discardLastUploadSession,
    handleUpload,

    editorDraft,
    editorInitialTrim,
    openEditor: setEditorDraftId,
    closeEditor: () => setEditorDraftId(null),
    applyEditorTrim,
  }
}

/** "1 wallpaper", "12 wallpapers", "1,204 files". */
function countOf(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`
}
