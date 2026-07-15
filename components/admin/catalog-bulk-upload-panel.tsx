"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import {
  AlertCircle,
  CheckCircle2,
  Files,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react"
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
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const WALLPAPER_CATEGORIES: string[] = [...macwall.categories]
const DEFAULT_CATEGORY = WALLPAPER_CATEGORIES[0] ?? "Nature"
const MAX_FILES = 100
const UPLOAD_CONCURRENCY = 2
const UPLOAD_RETRY_ATTEMPTS = 3
const UPLOAD_RETRY_BASE_DELAY_MS = 800
const THUMB_MAX_WIDTH = 1280
const THUMB_QUALITY = 0.86
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

type SignedUploadResponse = {
  bucket: string
  origin: string
  anonKey: string
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
  token: string | null
  signedUrl: string | null
  alreadyUploaded: boolean
}

type CommitResponse = {
  inserted: number
  error?: string
}

type DraftValidation = {
  ok: boolean
  message: string | null
}

export function CatalogBulkUploadPanel({
  onUploaded,
}: Readonly<{ onUploaded?: () => Promise<void> | void }>) {
  const [drafts, setDrafts] = useState<CatalogDraft[]>([])
  const [busy, setBusy] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
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
    await stageFiles(files)
  }

  async function stageFiles(files: File[]) {
    if (!files.length) return
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
      const nextFiles = files.slice(0, availableSlots)
      if (nextFiles.length !== files.length) {
        setNotice(`Only ${MAX_FILES} wallpapers can be staged at once.`)
      }

      const usedIds = new Set(draftsRef.current.map((draft) => draft.id))
      const rejected: string[] = []
      for (const file of nextFiles) {
        const localId = createLocalId()
        let initial: CatalogDraft
        try {
          initial = createInitialDraft(file, localId, usedIds)
        } catch (err) {
          rejected.push(err instanceof Error ? err.message : file.name)
          continue
        }
        setDrafts((current) => [...current, initial])

        try {
          const inspected = await inspectVideoFile(file)
          const ready: CatalogDraft = {
            ...initial,
            resolution: `${inspected.width}x${inspected.height}`,
            durationSeconds: inspected.durationSeconds,
            thumbBlob: inspected.thumbBlob,
            thumbUrl: inspected.thumbUrl,
            status: "ready",
          }
          setDrafts((current) =>
            current.map((draft) => (draft.localId === localId ? ready : draft))
          )
        } catch (err) {
          setDrafts((current) =>
            current.map((draft) =>
              draft.localId === localId
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

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    setDragDepth(0)
    if (!canStageMore) return
    void stageFiles(Array.from(event.dataTransfer.files))
  }

  function handleDropZoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    if (canStageMore) fileInputRef.current?.click()
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
    setNotice(null)
    setError(null)
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

    try {
      const toUpload = candidates.filter((draft) => draft.status !== "uploaded")
      if (toUpload.length) {
        const signRes = await fetch("/api/admin/wallpapers/bulk-upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            items: toUpload.map((draft) => ({
              clientId: draft.localId,
              id: draft.id,
              videoKey: draft.videoKey,
              thumbKey: draft.thumbKey,
              videoContentType: draft.videoContentType,
              thumbContentType: "image/jpeg",
              videoSizeBytes: draft.fileSizeBytes,
              thumbSizeBytes: draft.thumbBlob?.size ?? 0,
            })),
          }),
        })
        const signed = await readJsonResponse<SignedUploadResponse>(
          signRes,
          "Could not prepare uploads."
        )
        if (!signRes.ok) {
          throw new Error(signed.error ?? "Could not prepare uploads.")
        }

        const supabase = createClient(signed.origin, signed.anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const signedByClientId = new Map(
          signed.uploads.map((upload) => [upload.clientId, upload])
        )

        const uploadFailures: string[] = []
        await runPool(toUpload, UPLOAD_CONCURRENCY, async (draft) => {
          const upload = signedByClientId.get(draft.localId)
          if (!upload)
            throw new Error(`Missing upload token for ${draft.name}.`)
          if (!draft.thumbBlob)
            throw new Error(`Missing thumbnail for ${draft.name}.`)

          try {
            updateDraft(draft.localId, (current) => ({
              ...current,
              status: "uploading",
              progress: 12,
              error: null,
            }))

            await uploadStorageTarget({
              supabase,
              bucket: signed.bucket,
              target: upload.video,
              fileBody: draft.file,
              cacheControl: signed.cacheControl,
              contentType: draft.videoContentType,
            })

            updateDraft(draft.localId, (current) => ({
              ...current,
              progress: 72,
            }))

            await uploadStorageTarget({
              supabase,
              bucket: signed.bucket,
              target: upload.thumb,
              fileBody: draft.thumbBlob,
              cacheControl: signed.cacheControl,
              contentType: "image/jpeg",
            })

            updateDraft(draft.localId, (current) => ({
              ...current,
              status: "uploaded",
              progress: 100,
            }))
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Storage upload failed."
            uploadFailures.push(`${draft.name}: ${message}`)
            updateDraft(draft.localId, (current) => ({
              ...current,
              status: "error",
              error: message,
            }))
          }
        })

        if (uploadFailures.length) {
          throw new Error(uploadFailures.slice(0, 3).join(" "))
        }
      }

      const commitRes = await fetch(
        "/api/admin/wallpapers/bulk-upload/commit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            items: candidates.map((draft) => ({
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
              isPro: draft.isPro,
              isFeatured: draft.isFeatured,
              isCuratedPick: draft.isCuratedPick,
            })),
          }),
        }
      )
      const commit = await readJsonResponse<CommitResponse>(
        commitRes,
        "Could not publish wallpapers."
      )
      if (!commitRes.ok) {
        throw new Error(commit.error ?? "Could not publish wallpapers.")
      }

      setDrafts((current) =>
        current.map((draft) =>
          candidates.some((item) => item.localId === draft.localId)
            ? { ...draft, status: "committed", progress: 100, error: null }
            : draft
        )
      )
      setNotice(`Published ${commit.inserted.toLocaleString()} wallpapers.`)
      await onUploaded?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed."
      setError(message)
      setDrafts((current) =>
        current.map((draft) =>
          draft.status === "uploading"
            ? { ...draft, status: "error", error: message }
            : draft
        )
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminSurface>
      <AdminSurfaceHeader
        title="Bulk catalog upload"
        description="Stage up to 100 videos, edit generated metadata, then publish directly into wallpaper-catalog."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || analyzing || drafts.length >= MAX_FILES}
              className="gap-1.5"
            >
              <Files className="size-3.5" />
              Select videos
            </AdminButton>
            <AdminButton
              size="sm"
              onClick={() => void handleUpload()}
              disabled={busy || analyzing || readyCount === 0}
              className="gap-1.5"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              Upload {readyCount ? readyCount.toLocaleString() : ""}
            </AdminButton>
          </div>
        }
      />
      <AdminSurfaceBody className="space-y-4">
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

        {notice ? <AdminNotice tone="success">{notice}</AdminNotice> : null}
        {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}

        <div
          role="button"
          tabIndex={canStageMore ? 0 : -1}
          aria-disabled={!canStageMore}
          onClick={() => {
            if (canStageMore) fileInputRef.current?.click()
          }}
          onKeyDown={handleDropZoneKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed px-5 text-center transition-colors outline-none",
            dragActive
              ? "border-[#0071e3] bg-[#e8f2ff]"
              : "border-[#d2d2d7] bg-[#f5f5f7] hover:bg-[#ebebed]",
            !canStageMore && "cursor-not-allowed opacity-60"
          )}
        >
          {analyzing ? (
            <Loader2 className="size-7 animate-spin text-[#0071e3]" />
          ) : (
            <Upload className="size-7 text-[#0071e3]" />
          )}
          <span className="mt-3 text-[17px] font-medium tracking-[-0.02em] text-[#1d1d1f]">
            {dragActive ? "Drop videos to stage" : "Drag videos here"}
          </span>
          <span className="mt-1 text-[13px] text-[#86868b]">
            or select MP4, MOV, M4V, and WEBM files.
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
    <div className="rounded-[20px] bg-[#f5f5f7] p-3">
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
                  <Loader2 className="size-5 animate-spin text-[#86868b]" />
                ) : (
                  <ImagePlus className="size-5 text-[#86868b]" />
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
                <Loader2 className="size-3 animate-spin" />
              ) : draft.status === "committed" ||
                draft.status === "uploaded" ? (
                <CheckCircle2 className="size-3" />
              ) : draft.status === "error" || validation?.ok === false ? (
                <AlertCircle className="size-3" />
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
            <Trash2 className="size-4" />
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
    )?.[0] ?? DEFAULT_CATEGORY
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

async function uploadStorageTarget({
  supabase,
  bucket,
  target,
  fileBody,
  cacheControl,
  contentType,
}: {
  supabase: SupabaseClient
  bucket: string
  target: SignedUploadTarget
  fileBody: File | Blob
  cacheControl: string
  contentType: string
}) {
  if (target.alreadyUploaded) return
  if (!target.token) {
    throw new Error(`Missing signed upload token for ${target.path}.`)
  }

  let lastError: unknown = null
  for (let attempt = 1; attempt <= UPLOAD_RETRY_ATTEMPTS; attempt += 1) {
    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(target.path, target.token, fileBody, {
        cacheControl,
        contentType,
      })

    if (!error) return
    if (isDuplicateStorageError(error)) return

    lastError = error
    if (attempt < UPLOAD_RETRY_ATTEMPTS) {
      await sleep(UPLOAD_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
    }
  }

  throw new Error(storageErrorMessage(lastError))
}

function isDuplicateStorageError(error: unknown) {
  const message = storageErrorMessage(error).toLowerCase()
  return (
    message.includes("duplicate") ||
    message.includes("already exists") ||
    message.includes("resource already exists")
  )
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

function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}
