"use client"

import {
  CircleAlert,
  CircleCheck,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react"
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { AdminBadge, PanelHeader } from "@/components/admin/admin-ui"
import { AdminEmptyState, AdminNotice } from "@/components/admin/admin-states"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  UPLOAD_FILE_CONCURRENCY,
  uploadR2ObjectDirect,
} from "@/lib/admin/r2-browser-upload"
import { formatBytes } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

const MAX_FILES = 100
const MAX_IMAGE_BYTES = 40 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

type DraftStatus = "ready" | "uploading" | "uploaded" | "error"

type StaticDraft = {
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

type SignedUploadResponse = {
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

type ListedImage = {
  key: string
  fileName: string
  sizeBytes: number
  lastModified: string | null
  publicUrl: string
}

type ListResponse = {
  count: number
  images: ListedImage[]
  error?: string
}

function extensionOf(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  return ext === "jpeg" ? "jpg" : ext
}

function contentTypeForFile(file: File): string | null {
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

function sanitizeClientFileName(raw: string): string {
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

function isStillImageFile(file: File): string | null {
  const ext = extensionOf(file.name)
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return "Only JPG, PNG, and WebP still images are allowed."
  }
  if (file.type === "image/gif" || ext === "gif") {
    return "Animated GIFs are not allowed in Static wallpapers."
  }
  if (file.type.startsWith("video/") || ["mp4", "mov", "m4v", "webm"].includes(ext)) {
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

async function runPool<T>(
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

export function StaticWallpaperUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drafts, setDrafts] = useState<StaticDraft[]>([])
  const [existing, setExisting] = useState<ListedImage[]>([])
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadExisting = useCallback(async () => {
    setLoadingExisting(true)
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
      setError(err instanceof Error ? err.message : "Failed to list images")
    } finally {
      setLoadingExisting(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadExisting()
    })
  }, [loadExisting])

  useEffect(() => {
    return () => {
      for (const draft of drafts) {
        URL.revokeObjectURL(draft.previewUrl)
      }
    }
    // Only revoke on unmount / full replace handled explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const readyCount = useMemo(
    () => drafts.filter((draft) => draft.status === "ready" || draft.status === "error").length,
    [drafts]
  )

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

    setDrafts((current) => {
      const room = Math.max(0, MAX_FILES - current.length)
      return [...current, ...next.slice(0, room)]
    })
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) addFiles(event.target.files)
    event.target.value = ""
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
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
  }

  async function uploadAll() {
    const queue = drafts.filter(
      (draft) => draft.status === "ready" || draft.status === "error"
    )
    if (!queue.length) return

    setBusy(true)
    setError(null)
    setMessage(null)

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
                    ? Math.min(100, Math.round((event.loadedBytes / total) * 100))
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
        } catch (err) {
          updateDraft(draft.localId, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          })
        }
      })

      const uploaded = queue.length
      setMessage(
        `Uploaded ${uploaded} still image${uploaded === 1 ? "" : "s"} to static-wallpapers/.`
      )
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
          throw new Error(publishJson.error ?? "Failed to publish catalog index")
        }
        setMessage(
          `Uploaded ${uploaded} still image${uploaded === 1 ? "" : "s"} and refreshed the app catalog (${publishJson.count ?? uploaded}).`
        )
      } catch (publishError) {
        setError(
          publishError instanceof Error
            ? `Images uploaded, but catalog index refresh failed: ${publishError.message}`
            : "Images uploaded, but catalog index refresh failed."
        )
      }
      await loadExisting()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? <AdminNotice>{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

      <Card className="gap-0 overflow-hidden py-0">
        <PanelHeader
          title="Static images"
          description="Upload still JPG, PNG, or WebP wallpapers to R2 path static-wallpapers/. No live video or animated GIFs."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadExisting()}
                disabled={loadingExisting || busy}
              >
                <RefreshCw
                  className={cn(
                    "size-3.5",
                    loadingExisting && "animate-spin motion-reduce:animate-none"
                  )}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => void uploadAll()}
                disabled={busy || readyCount === 0}
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                Upload {readyCount || ""}
              </Button>
            </div>
          }
        />

        <div
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
          className={cn(
            "m-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
            dragOver
              ? "border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]"
              : "border-[var(--admin-border)] bg-[var(--admin-surface-2)]"
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-muted)]">
            <ImagePlus className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--admin-fg)]">
              Drop still images here
            </p>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">
              JPG · PNG · WebP · up to {formatBytes(MAX_IMAGE_BYTES)} each
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              Choose images
            </Button>
            {drafts.length ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDrafts}
                disabled={busy}
              >
                Clear queue
              </Button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={onInputChange}
          />
        </div>

        {drafts.length ? (
          <div className="border-t border-[var(--admin-border)] p-4">
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {drafts.map((draft) => (
                <li
                  key={draft.localId}
                  className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
                >
                  <div className="relative aspect-video bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draft.previewUrl}
                      alt={draft.fileName}
                      className="size-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {draft.status === "uploaded" ? (
                        <AdminBadge tone="green">
                          <CircleCheck className="size-3" />
                          Done
                        </AdminBadge>
                      ) : null}
                      {draft.status === "error" ? (
                        <AdminBadge tone="red">
                          <CircleAlert className="size-3" />
                          Error
                        </AdminBadge>
                      ) : null}
                      {draft.status === "uploading" ? (
                        <AdminBadge tone="blue">{draft.progress}%</AdminBadge>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--admin-fg)]">
                          {draft.fileName}
                        </p>
                        <p className="text-[12px] text-[var(--admin-muted)]">
                          {formatBytes(draft.sizeBytes)} · static-wallpapers/
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeDraft(draft.localId)}
                        disabled={busy && draft.status === "uploading"}
                        aria-label={`Remove ${draft.fileName}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    {draft.status === "uploading" ? (
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-surface-2)]">
                        <div
                          className="h-full rounded-full bg-[var(--admin-accent)] transition-[width]"
                          style={{ width: `${draft.progress}%` }}
                        />
                      </div>
                    ) : null}
                    {draft.error ? (
                      <p className="text-[12px] text-[var(--admin-red-fg)]">
                        {draft.error}
                      </p>
                    ) : null}
                    {draft.publicUrl && draft.status === "uploaded" ? (
                      <a
                        href={draft.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-[12px] text-[var(--admin-accent)] underline-offset-2 hover:underline"
                      >
                        {draft.publicUrl}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <PanelHeader
          title="In R2 now"
          description={`${existing.length} still image${existing.length === 1 ? "" : "s"} under static-wallpapers/`}
        />
        {loadingExisting ? (
          <p className="px-5 py-8 text-sm text-[var(--admin-muted)]">
            Loading existing images…
          </p>
        ) : existing.length === 0 ? (
          <AdminEmptyState
            icon={<ImagePlus className="size-6" />}
            title="No static wallpapers yet"
            description="Uploaded still images will appear here from the wallpaper-catalog bucket."
            className="py-14"
          />
        ) : (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {existing.map((image) => (
              <li
                key={image.key}
                className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
              >
                <div className="aspect-video bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.publicUrl}
                    alt={image.fileName}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium text-[var(--admin-fg)]">
                    {image.fileName}
                  </p>
                  <p className="text-[12px] text-[var(--admin-muted)]">
                    {formatBytes(image.sizeBytes)}
                    {image.lastModified
                      ? ` · ${new Date(image.lastModified).toLocaleString()}`
                      : ""}
                  </p>
                  <a
                    href={image.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[12px] text-[var(--admin-accent)] underline-offset-2 hover:underline"
                  >
                    {image.publicUrl}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
