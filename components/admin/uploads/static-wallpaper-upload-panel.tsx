"use client"

/**
 * Still-image wallpapers: queue JPG/PNG/WebP files, upload them straight to
 * R2 with presigned URLs, then rebuild the index the app reads. Also lists
 * what is already published.
 */

import { ImagePlus, Images, RefreshCw, RotateCcw, Upload } from "lucide-react"
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

import {
  EmptyState,
  Meter,
  Notice,
  Panel,
  SectionHeading,
  Skeleton,
  Spinner,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/admin/format"
import {
  UPLOAD_FILE_CONCURRENCY,
  uploadR2ObjectDirect,
} from "@/lib/admin/r2-browser-upload"
import { cn } from "@/lib/utils"

import {
  BrowseHint,
  overallPercent,
  UploadActionBar,
  UploadDropZone,
  UploadStep,
  type UploadCount,
} from "./catalog-upload-blocks"
import {
  contentTypeForFile,
  isStillImageFile,
  MAX_FILES,
  MAX_IMAGE_BYTES,
  plural,
  runPool,
  sanitizeClientFileName,
  type ListedImage,
  type ListResponse,
  type PanelMessage,
  type SignedUploadResponse,
  type StaticDraft,
} from "./static-upload-files"
import { PublishedImage, StaticDraftRow } from "./static-upload-parts"

export function StaticWallpaperUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drafts, setDrafts] = useState<StaticDraft[]>([])
  const [existing, setExisting] = useState<ListedImage[]>([])
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  /** Drafts in the current or last upload run, for the overall meter. */
  const [runIds, setRunIds] = useState<string[] | null>(null)
  const [message, setMessage] = useState<PanelMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const draftsRef = useRef<StaticDraft[]>([])

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  const loadExisting = useCallback(async () => {
    setLoadingExisting(true)
    setListError(null)
    try {
      const response = await fetch("/api/admin/static-wallpapers", {
        credentials: "same-origin",
      })
      const json = (await response.json()) as ListResponse
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to list static wallpapers")
      }
      setExisting(json.images ?? [])
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to list images")
    } finally {
      setLoadingExisting(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadExisting()
    })
  }, [loadExisting])

  // Previews are object URLs; release whatever is still queued on unmount.
  useEffect(
    () => () => {
      for (const draft of draftsRef.current) {
        URL.revokeObjectURL(draft.previewUrl)
      }
    },
    []
  )

  const readyCount = useMemo(
    () =>
      drafts.filter(
        (draft) => draft.status === "ready" || draft.status === "error"
      ).length,
    [drafts]
  )
  const failedCount = drafts.filter((draft) => draft.status === "error").length
  const uploadedCount = drafts.filter(
    (draft) => draft.status === "uploaded"
  ).length
  const queuedBytes = drafts.reduce(
    (total, draft) =>
      draft.status === "uploaded" ? total : total + draft.sizeBytes,
    0
  )
  /** Everything left to send has already failed once. */
  const retrying = readyCount > 0 && failedCount === readyCount

  const runProgress = useMemo(() => {
    if (!runIds) return null
    const ids = new Set(runIds)
    const run = drafts.filter((draft) => ids.has(draft.localId))
    return {
      total: runIds.length,
      done: run.filter((draft) => draft.status === "uploaded").length,
      failed: run.filter((draft) => draft.status === "error").length,
      percent: overallPercent(
        run.map((draft) =>
          draft.status === "uploaded" || draft.status === "error"
            ? 100
            : draft.status === "uploading"
              ? draft.progress
              : 0
        )
      ),
    }
  }, [drafts, runIds])

  function updateDraft(localId: string, patch: Partial<StaticDraft>) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.localId === localId ? { ...draft, ...patch } : draft
      )
    )
  }

  function addFiles(files: FileList | File[]) {
    setError(null)
    setMessage(null)
    const next: StaticDraft[] = []
    const rejected: string[] = []

    for (const file of Array.from(files)) {
      const reason = isStillImageFile(file)
      if (reason) {
        rejected.push(`${file.name}: ${reason}`)
        continue
      }
      const contentType = contentTypeForFile(file)
      if (!contentType) continue

      next.push({
        localId: crypto.randomUUID(),
        file,
        fileName: sanitizeClientFileName(file.name),
        contentType,
        sizeBytes: file.size,
        previewUrl: URL.createObjectURL(file),
        status: "ready",
        progress: 0,
        error: null,
        publicUrl: null,
      })
    }

    if (rejected.length) {
      setError(rejected.slice(0, 4).join(" · "))
    }
    if (draftsRef.current.length + next.length > MAX_FILES) {
      setMessage({
        tone: "warning",
        text: `Only ${MAX_FILES} images fit in one batch. The rest were left out.`,
      })
    }

    setDrafts((current) => {
      const room = Math.max(0, MAX_FILES - current.length)
      // Previews of files that do not fit are never shown; release them.
      for (const dropped of next.slice(room)) {
        URL.revokeObjectURL(dropped.previewUrl)
      }
      return [...current, ...next.slice(0, room)]
    })
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) addFiles(event.target.files)
    event.target.value = ""
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files)
  }

  function removeDraft(localId: string) {
    setDrafts((current) => {
      const target = current.find((draft) => draft.localId === localId)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((draft) => draft.localId !== localId)
    })
  }

  function clearDrafts() {
    for (const draft of drafts) URL.revokeObjectURL(draft.previewUrl)
    setDrafts([])
    setRunIds(null)
  }

  async function uploadAll() {
    const queue = drafts.filter(
      (draft) => draft.status === "ready" || draft.status === "error"
    )
    if (!queue.length) return

    setBusy(true)
    setError(null)
    setMessage(null)
    setRunIds(queue.map((draft) => draft.localId))

    try {
      const signResponse = await fetch(
        "/api/admin/static-wallpapers/upload/sign",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            items: queue.map((draft) => ({
              clientId: draft.localId,
              fileName: draft.fileName,
              contentType: draft.contentType,
              sizeBytes: draft.sizeBytes,
            })),
          }),
        }
      )
      const signed = (await signResponse.json()) as SignedUploadResponse
      if (!signResponse.ok) {
        throw new Error(signed.error ?? "Failed to prepare uploads")
      }

      const byClientId = new Map(
        signed.uploads.map((upload) => [upload.clientId, upload])
      )

      let succeeded = 0
      await runPool(queue, UPLOAD_FILE_CONCURRENCY, async (draft) => {
        const target = byClientId.get(draft.localId)
        if (!target) {
          updateDraft(draft.localId, {
            status: "error",
            error: "Missing signed upload target.",
          })
          return
        }

        updateDraft(draft.localId, {
          status: "uploading",
          progress: 0,
          error: null,
          publicUrl: target.publicUrl,
        })

        try {
          if (!target.image.alreadyUploaded) {
            if (!target.image.signedUrl) {
              throw new Error("Missing signed URL.")
            }
            await uploadR2ObjectDirect({
              signedUrl: target.image.signedUrl,
              body: draft.file,
              contentType: draft.contentType,
              onProgress: (event) => {
                const total = event.totalBytes || draft.sizeBytes
                const progress =
                  total > 0
                    ? Math.min(
                        100,
                        Math.round((event.loadedBytes / total) * 100)
                      )
                    : 0
                updateDraft(draft.localId, { progress })
              },
            })
          }

          updateDraft(draft.localId, {
            status: "uploaded",
            progress: 100,
            publicUrl: target.publicUrl,
          })
          succeeded += 1
        } catch (err) {
          updateDraft(draft.localId, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          })
        }
      })

      const failed = queue.length - succeeded
      const failedNote = failed
        ? ` ${plural(failed, "image")} failed. Upload again to retry.`
        : ""
      const tone = failed ? "warning" : "success"
      setMessage({
        tone,
        text: `Uploaded ${plural(succeeded, "still image")} to static-wallpapers/.${failedNote}`,
      })
      try {
        const publishResponse = await fetch(
          "/api/admin/static-wallpapers/publish-index",
          {
            method: "POST",
            credentials: "same-origin",
          }
        )
        const publishJson = (await publishResponse.json()) as {
          error?: string
          count?: number
        }
        if (!publishResponse.ok) {
          throw new Error(
            publishJson.error ?? "Failed to publish catalog index"
          )
        }
        const text = `Uploaded ${plural(succeeded, "still image")} and refreshed the app catalog (${(publishJson.count ?? succeeded).toLocaleString()} in total).${failedNote}`
        setMessage({ tone, text })
        if (failed) toast.warning(text)
        else toast.success(text)
      } catch (publishError) {
        const text =
          publishError instanceof Error
            ? `Images uploaded, but catalog index refresh failed: ${publishError.message}`
            : "Images uploaded, but catalog index refresh failed."
        setError(text)
        toast.error(text)
      }
      await loadExisting()
    } catch (err) {
      const text = err instanceof Error ? err.message : "Upload failed"
      setError(text)
      toast.error(text)
    } finally {
      setBusy(false)
    }
  }

  const counts: UploadCount[] = drafts.length
    ? [
        { label: "To upload", value: readyCount.toLocaleString() },
        ...(failedCount
          ? [
              {
                label: "Failed",
                value: failedCount.toLocaleString(),
                tone: "red" as const,
              },
            ]
          : []),
        ...(uploadedCount
          ? [
              {
                label: "Uploaded",
                value: uploadedCount.toLocaleString(),
                tone: "green" as const,
              },
            ]
          : []),
        { label: "Size", value: formatBytes(queuedBytes) },
      ]
    : []

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <UploadStep
          step={1}
          title="Add images"
          description="Still wallpapers only. Videos go in Bulk upload; animated GIFs are not supported."
        >
          <UploadDropZone
            icon={<ImagePlus />}
            title={
              <>
                Drop images here or <BrowseHint>browse</BrowseHint>
              </>
            }
            activeTitle="Drop to add to the queue"
            description={`JPG, PNG or WebP · up to ${formatBytes(MAX_IMAGE_BYTES)} each · ${MAX_FILES} per batch`}
            active={dragOver}
            disabled={busy}
            compact={drafts.length > 0}
            onChoose={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setDragOver(false)
            }}
            onDrop={onDrop}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            hidden
            tabIndex={-1}
            aria-hidden
            onChange={onInputChange}
          />
          {error ? <Notice>{error}</Notice> : null}
          {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
        </UploadStep>

        <UploadStep
          step={2}
          title="Review the queue"
          description="File names are cleaned up for the URL. Remove anything that should not go out."
          actions={
            drafts.length ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDrafts}
                disabled={busy}
              >
                Clear queue
              </Button>
            ) : null
          }
        >
          <Panel className="overflow-hidden">
            {drafts.length ? (
              <ul className="divide-y divide-border">
                {drafts.map((draft) => (
                  <StaticDraftRow
                    key={draft.localId}
                    draft={draft}
                    removeDisabled={busy && draft.status === "uploading"}
                    onRemove={removeDraft}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Images />}
                title="Nothing queued"
                description="Images you add show up here before anything is uploaded."
                className="py-10"
              />
            )}
          </Panel>
        </UploadStep>

        <UploadActionBar
          step={3}
          title="Upload and publish"
          counts={counts}
          note="Images go to static-wallpapers/ on R2, then the index the app reads is rebuilt so they show up in MacWall."
          action={
            <Button
              onClick={() => void uploadAll()}
              disabled={busy || readyCount === 0}
            >
              {busy ? (
                <Spinner className="text-current" />
              ) : retrying ? (
                <RotateCcw aria-hidden />
              ) : (
                <Upload aria-hidden />
              )}
              {busy
                ? "Uploading…"
                : readyCount === 0
                  ? "Upload images"
                  : `${retrying ? "Retry" : "Upload"} ${plural(readyCount, "image")}`}
            </Button>
          }
        >
          {runProgress ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
                <p className="font-medium text-foreground">
                  {busy ? "Uploading to R2" : "Last upload"}
                </p>
                <p className="text-muted-foreground tabular-nums">
                  {runProgress.done.toLocaleString()} of{" "}
                  {runProgress.total.toLocaleString()} uploaded
                  {runProgress.failed
                    ? ` · ${runProgress.failed.toLocaleString()} failed`
                    : ""}
                </p>
              </div>
              <Meter
                label="Upload progress"
                value={runProgress.percent}
                tone={runProgress.failed ? "red" : busy ? "blue" : "green"}
              />
            </div>
          ) : null}
        </UploadActionBar>
      </div>

      <section className="space-y-3">
        <SectionHeading
          title="Published images"
          description={
            loadingExisting && existing.length === 0
              ? "Loading the catalog…"
              : `${plural(existing.length, "still image")} in the catalog.`
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadExisting()}
              disabled={loadingExisting || busy}
            >
              <RefreshCw
                aria-hidden
                className={cn(
                  loadingExisting && "animate-spin motion-reduce:animate-none"
                )}
              />
              Refresh
            </Button>
          }
        />
        {listError ? (
          <Notice
            title="Could not load published images"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadExisting()}
                disabled={loadingExisting}
              >
                Retry
              </Button>
            }
          >
            {listError}
          </Notice>
        ) : null}
        <Panel className="overflow-hidden">
          {loadingExisting && existing.length === 0 ? (
            <ul
              aria-hidden
              className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {Array.from({ length: 10 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="mt-2.5 h-3.5 w-3/4" />
                  <Skeleton className="mt-1.5 h-3 w-1/2" />
                </li>
              ))}
            </ul>
          ) : existing.length === 0 ? (
            listError ? null : (
              <EmptyState
                icon={<Images />}
                title="No static wallpapers yet"
                description="Uploaded still images appear here once they are in the wallpaper-catalog bucket."
              />
            )
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-5 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {existing.map((image) => (
                <PublishedImage key={image.key} image={image} />
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  )
}
