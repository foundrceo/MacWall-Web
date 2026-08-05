"use client"

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import { SubmitCategorySelect } from "@/components/macwall-marketing/submit-category-select"
import { SubmitRequirements } from "@/components/macwall-marketing/submit-requirements"
import { SubmitSuccessMark } from "@/components/macwall-marketing/submit-success-mark"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  COMMUNITY_ACCEPT_ATTR,
  COMMUNITY_MAX_VIDEO_BYTES,
  COMMUNITY_TITLE_MAX,
  formatBytesLabel,
  presignErrorMessage,
  submitErrorMessage,
  titleFromFileName,
  validateSubmitCategory,
  validateSubmitTitle,
  validateVideoDimensions,
  validateVideoExtension,
  validateVideoFileSize,
  videoContentTypeForExtension,
} from "@/lib/community/submit-validation"
import {
  DEFAULT_WALLPAPER_CATEGORY,
  WALLPAPER_CATEGORIES,
} from "@/lib/wallpaper-categories"
import { cn } from "@/lib/utils"

const VISITOR_ID_STORAGE_KEY = "macwall_visitor_id"
const THUMB_MAX_WIDTH = 1280
const THUMB_QUALITY = 0.86
const AI_THUMB_MAX_WIDTH = 512
const AI_THUMB_QUALITY = 0.72
const AI_ANALYSIS_TIMEOUT_MS = 30_000
const UPLOAD_RETRY_ATTEMPTS = 3
const UPLOAD_RETRY_BASE_DELAY_MS = 800

type InspectedVideo = {
  width: number
  height: number
  durationSeconds: number
  thumbBlob: Blob
  thumbUrl: string
}

type PresignResponse = {
  videoKey: string
  thumbKey: string
  videoUploadUrl: string
  thumbUploadUrl: string
  videoContentType: string
  thumbContentType: string
  error?: string
}

type AiSuggestion = {
  name: string
  category: string
}

type FormStatus = "idle" | "inspecting" | "submitting" | "success" | "error"

type FieldErrors = {
  title?: string
  file?: string
  category?: string
  authorName?: string
}

const fieldControlClass =
  "h-auto w-full rounded-2xl border-0 bg-background/70 px-4 py-3 text-[15px] text-foreground shadow-none ring-1 ring-foreground/8 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"

const AUTHOR_STORAGE_KEY = "macwall.communityAuthorName"
const AUTHOR_MIN = 2
const AUTHOR_MAX = 40

function readStoredAuthorName() {
  if (typeof window === "undefined") return ""
  try {
    return (localStorage.getItem(AUTHOR_STORAGE_KEY) ?? "").slice(0, AUTHOR_MAX)
  } catch {
    return ""
  }
}

export function SubmitWallpaperForm() {
  const [title, setTitle] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [category, setCategory] = useState<string>(DEFAULT_WALLPAPER_CATEGORY)
  const [file, setFile] = useState<File | null>(null)
  const [inspected, setInspected] = useState<InspectedVideo | null>(null)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [dragActive, setDragActive] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiSuggested, setAiSuggested] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const inspectedRef = useRef<InspectedVideo | null>(null)
  const titleTouchedRef = useRef(false)
  const aiRequestIdRef = useRef(0)

  useEffect(() => {
    setAuthorName(readStoredAuthorName())
  }, [])

  useEffect(() => {
    inspectedRef.current = inspected
  }, [inspected])

  useEffect(
    () => () => {
      if (inspectedRef.current?.thumbUrl) {
        URL.revokeObjectURL(inspectedRef.current.thumbUrl)
      }
    },
    []
  )

  const busy = status === "inspecting" || status === "submitting"
  const titleValidation = validateSubmitTitle(title)
  const authorTrimmed = authorName.trim()
  const authorOk =
    authorTrimmed.length === 0 ||
    (authorTrimmed.length >= AUTHOR_MIN && authorTrimmed.length <= AUTHOR_MAX)
  const canSubmit =
    !busy &&
    !aiAnalyzing &&
    Boolean(file) &&
    Boolean(inspected) &&
    titleValidation.ok &&
    authorOk &&
    validateSubmitCategory(category)

  function resetThumb() {
    if (inspectedRef.current?.thumbUrl) {
      URL.revokeObjectURL(inspectedRef.current.thumbUrl)
    }
    setInspected(null)
    aiRequestIdRef.current += 1
    setAiAnalyzing(false)
    setAiSuggested(false)
  }

  function handleTitleChange(value: string) {
    titleTouchedRef.current = true
    setTitle(value)
    const next = validateSubmitTitle(value)
    setFieldErrors((current) => ({
      ...current,
      title: next.ok ? undefined : next.message,
    }))
  }

  function handleCategoryChange(value: string) {
    setCategory(value)
    setFieldErrors((current) => ({
      ...current,
      category: validateSubmitCategory(value)
        ? undefined
        : "Choose a valid category.",
    }))
  }

  async function acceptFile(next: File | undefined) {
    if (!next) return

    setError(null)
    setFieldErrors((current) => ({ ...current, file: undefined }))

    const extResult = validateVideoExtension(fileExtension(next.name))
    if (!extResult.ok) {
      setFieldErrors((current) => ({
        ...current,
        file: "Choose an MP4, MOV, M4V, or WEBM video.",
      }))
      return
    }

    const sizeResult = validateVideoFileSize(next.size)
    if (!sizeResult.ok) {
      setFieldErrors((current) => ({
        ...current,
        file: `Video must be ${formatBytesLabel(COMMUNITY_MAX_VIDEO_BYTES)} or smaller.`,
      }))
      return
    }

    resetThumb()
    setFile(next)
    setStatus("inspecting")

    if (!titleTouchedRef.current) {
      setTitle(titleFromFileName(next.name))
    }

    try {
      const result = await inspectVideoFile(next)
      const dimensions = validateVideoDimensions(result.width, result.height)
      if (!dimensions.ok) {
        setFile(null)
        setStatus("error")
        setFieldErrors((current) => ({
          ...current,
          file: dimensions.message,
        }))
        return
      }

      setInspected(result)
      setStatus("idle")
      void runAiSuggestion(result.thumbBlob, next.name)
    } catch (err) {
      setFile(null)
      setStatus("error")
      setFieldErrors((current) => ({
        ...current,
        file:
          err instanceof Error
            ? err.message
            : "Could not read that video. Try a different file.",
      }))
    }
  }

  async function runAiSuggestion(thumbBlob: Blob, sourceFileName: string) {
    const requestId = aiRequestIdRef.current + 1
    aiRequestIdRef.current = requestId
    setAiAnalyzing(true)
    setAiSuggested(false)

    // AI is optional: never let a slow/hung request block the submit button.
    const controller = new AbortController()
    const timeout = window.setTimeout(
      () => controller.abort(),
      AI_ANALYSIS_TIMEOUT_MS
    )

    try {
      const thumbDataUrl = await blobToResizedJpegDataUrl(thumbBlob)
      const response = await fetch("/api/community/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          thumbDataUrl,
          sourceFileName,
          // Vision generates the title. Only send a draft if the user typed one.
          generate: !titleTouchedRef.current,
          initialName: titleTouchedRef.current ? title : "",
          initialCategory: titleTouchedRef.current ? category : "",
        }),
      })

      if (requestId !== aiRequestIdRef.current) return

      if (!response.ok) return

      const data = (await response.json().catch(() => null)) as AiSuggestion | null
      if (!data?.name || requestId !== aiRequestIdRef.current) return

      applyAiSuggestion(data)
    } catch {
      // AI is optional — ignore failures (incl. timeout/abort)
    } finally {
      window.clearTimeout(timeout)
      if (requestId === aiRequestIdRef.current) {
        setAiAnalyzing(false)
      }
    }
  }

  function applyAiSuggestion(suggestion: AiSuggestion) {
    let applied = false

    if (!titleTouchedRef.current) {
      const normalized = validateSubmitTitle(suggestion.name)
      if (normalized.ok) {
        setTitle(normalized.normalized)
        applied = true
      }
    }

    if (validateSubmitCategory(suggestion.category)) {
      setCategory(suggestion.category)
      applied = true
    }

    if (applied) setAiSuggested(true)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void acceptFile(event.target.files?.[0])
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)
    if (busy) return
    void acceptFile(event.dataTransfer.files?.[0])
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    if (!busy) setDragActive(true)
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragActive(false)
  }

  function handleDropZoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    if (!busy) fileInputRef.current?.click()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextFieldErrors: FieldErrors = {}
    const titleResult = validateSubmitTitle(title)
    if (!titleResult.ok) {
      nextFieldErrors.title = titleResult.message
    }
    if (!validateSubmitCategory(category)) {
      nextFieldErrors.category = "Choose a valid category."
    }
    if (!authorOk) {
      nextFieldErrors.authorName =
        "Author name needs 2–40 characters, or leave it blank."
    }
    if (!file || !inspected) {
      nextFieldErrors.file = "Add a wallpaper video first."
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    if (!titleResult.ok || !file || !inspected) return

    setStatus("submitting")
    setError(null)
    setFieldErrors({})
    setProgress(5)

    try {
      const uploadId = createUuid()
      const ext = fileExtension(file.name)

      const presign = await requestPresign({
        uploadId,
        videoExtension: ext,
        videoContentType: videoContentTypeForExtension(file.type, ext),
      })
      setProgress(15)

      await uploadToR2(presign.videoUploadUrl, file, presign.videoContentType)
      setProgress(60)

      await uploadToR2(
        presign.thumbUploadUrl,
        inspected.thumbBlob,
        presign.thumbContentType
      )
      setProgress(85)

      const normalizedAuthor = authorName.trim().slice(0, AUTHOR_MAX)
      try {
        localStorage.setItem(AUTHOR_STORAGE_KEY, normalizedAuthor)
      } catch {
        // ignore quota / private mode
      }

      await registerSubmission({
        uploadId,
        visitorId: getOrCreateVisitorId(),
        title: titleResult.normalized,
        category,
        ...(normalizedAuthor.length >= AUTHOR_MIN
          ? { authorName: normalizedAuthor }
          : {}),
        videoExtension: ext,
        resolution: `${inspected.width}x${inspected.height}`,
        durationSeconds: inspected.durationSeconds,
        fileSizeBytes: file.size,
      })

      setProgress(100)
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    }
  }

  function submitAnother() {
    resetThumb()
    setFile(null)
    setTitle("")
    setCategory(DEFAULT_WALLPAPER_CATEGORY)
    setProgress(0)
    setError(null)
    setFieldErrors({})
    setStatus("idle")
    titleTouchedRef.current = false
  }

  if (status === "success") {
    return (
      <SubmitFormPanel className="text-center">
        <SubmitSuccessMark />
        <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.02em] text-foreground">
          Your wallpaper has been submitted
        </h2>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-[1.5] text-marketing-muted">
          Thanks for sharing your wallpaper. Our team reviews every submission
          and usually responds within 24 hours before it goes live in the MacWall
          catalog.
        </p>
        <button
          type="button"
          onClick={submitAnother}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-foreground px-[22px] text-[15px] font-medium text-background transition-colors outline-none hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
        >
          Submit another
        </button>
      </SubmitFormPanel>
    )
  }

  return (
    <SubmitFormPanel>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <SubmitRequirements className="lg:hidden" />

        <div className="space-y-2">
          <Label htmlFor="submit-title" className="text-[14px] text-foreground">
            Title
          </Label>
          <Input
            id="submit-title"
            name="title"
            type="text"
            value={title}
            maxLength={COMMUNITY_TITLE_MAX}
            required
            disabled={busy}
            placeholder="e.g. Neon City Rain"
            autoComplete="off"
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "submit-title-error" : undefined}
            className={fieldControlClass}
            onChange={(event) => handleTitleChange(event.target.value)}
          />
          {fieldErrors.title ? (
            <p
              id="submit-title-error"
              role="alert"
              className="text-[13px] text-red-400"
            >
              {fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="submit-category"
            className="text-[14px] text-foreground"
          >
            Category
          </Label>
          <SubmitCategorySelect
            id="submit-category"
            value={category}
            options={WALLPAPER_CATEGORIES}
            placeholder="Select a category"
            disabled={busy}
            invalid={Boolean(fieldErrors.category)}
            describedBy={
              fieldErrors.category ? "submit-category-error" : undefined
            }
            onValueChange={handleCategoryChange}
          />
          {fieldErrors.category ? (
            <p
              id="submit-category-error"
              role="alert"
              className="text-[13px] text-red-400"
            >
              {fieldErrors.category}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="submit-author"
            className="text-[14px] text-foreground"
          >
            Author name{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="submit-author"
            name="authorName"
            type="text"
            value={authorName}
            maxLength={AUTHOR_MAX}
            disabled={busy}
            placeholder="Credit name on your submission"
            autoComplete="nickname"
            aria-invalid={Boolean(fieldErrors.authorName)}
            aria-describedby={
              fieldErrors.authorName ? "submit-author-error" : undefined
            }
            className={fieldControlClass}
            onChange={(event) => {
              setAuthorName(event.target.value.slice(0, AUTHOR_MAX))
              setFieldErrors((prev) => ({ ...prev, authorName: undefined }))
            }}
          />
          {fieldErrors.authorName ? (
            <p
              id="submit-author-error"
              role="alert"
              className="text-[13px] text-red-400"
            >
              {fieldErrors.authorName}
            </p>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              Optional credit on your Community submission.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="submit-file" className="text-[14px] text-foreground">
            Wallpaper video
          </Label>
          <input
            ref={fileInputRef}
            id="submit-file"
            name="file"
            type="file"
            accept={COMMUNITY_ACCEPT_ATTR}
            className="sr-only"
            disabled={busy}
            onChange={handleFileChange}
          />

          {inspected && file ? (
            <div
              aria-busy={aiAnalyzing}
              className="flex flex-col gap-4 rounded-2xl bg-background/60 p-4 ring-1 ring-foreground/8 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-background sm:w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inspected.thumbUrl}
                  alt={`Preview of ${file.name}`}
                  className="h-full w-full object-cover"
                />
                {aiAnalyzing ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
                    <Spinner className="size-6 text-foreground" />
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-foreground">
                  {file.name}
                </p>
                <p className="mt-1 text-[13px] text-marketing-muted">
                  {inspected.width}×{inspected.height} ·{" "}
                  {formatDuration(inspected.durationSeconds)} ·{" "}
                  {formatBytesLabel(file.size)}
                </p>
                <div aria-live="polite" className="min-h-[18px]">
                  <AiStatusLine analyzing={aiAnalyzing} suggested={aiSuggested} />
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 inline-flex items-center rounded-full bg-background/80 px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:opacity-50"
                >
                  Replace video
                </button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={busy ? -1 : 0}
              aria-label="Add a wallpaper video"
              aria-disabled={busy}
              onClick={() => {
                if (!busy) fileInputRef.current?.click()
              }}
              onKeyDown={handleDropZoneKeyDown}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl px-5 py-8 text-center ring-1 transition-[color,background-color,box-shadow,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
                dragActive
                  ? "bg-background/80 ring-foreground/20"
                  : "bg-background/50 ring-foreground/10 hover:bg-background/70 hover:ring-foreground/16",
                busy && "cursor-not-allowed opacity-60"
              )}
            >
              {status === "inspecting" ? (
                <>
                  <Spinner className="size-6 text-foreground" />
                  <span className="mt-3 text-[15px] font-medium text-foreground">
                    Reading your video…
                  </span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className={cn(
                      "size-7 text-foreground transition-transform duration-200",
                      dragActive && "scale-110"
                    )}
                  >
                    <path d="M12 16V4M5 11l7-7 7 7" />
                    <path d="M4 20h16" />
                  </svg>
                  <span className="mt-3 text-[15px] font-medium text-foreground">
                    {dragActive ? "Drop to add" : "Drag a video here, or browse"}
                  </span>
                  <span className="mt-1 text-[13px] text-marketing-muted">
                    MP4, MOV, M4V, or WEBM · up to{" "}
                    {formatBytesLabel(COMMUNITY_MAX_VIDEO_BYTES)}
                  </span>
                </>
              )}
            </div>
          )}
          {fieldErrors.file ? (
            <p role="alert" className="text-[13px] text-red-400">
              {fieldErrors.file}
            </p>
          ) : null}
        </div>

        {status === "submitting" ? (
          <div aria-live="polite">
            <div className="mb-1.5 flex items-center justify-between text-[13px]">
              <span className="font-medium text-foreground">Uploading…</span>
              <span className="text-marketing-muted tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background/70">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-red-500/10 px-4 py-3 text-[14px] text-red-200 ring-1 ring-red-500/20"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          aria-busy={status === "submitting" || aiAnalyzing}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[16px] font-medium text-background transition-colors outline-none hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SubmitButtonContent status={status} analyzing={aiAnalyzing} />
        </button>

        <p className="text-[13px] leading-[1.5] text-marketing-muted">
          By submitting you confirm you have the rights to share this video.
          Submissions are reviewed before publishing.
        </p>
      </form>
    </SubmitFormPanel>
  )
}

function SubmitFormPanel({
  children,
  className,
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  return (
    <div
      className={cn(
        "rounded-[24px] bg-secondary px-6 py-7 sm:px-8 sm:py-8",
        className
      )}
    >
      {children}
    </div>
  )
}

function Spinner({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("animate-spin", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SubmitButtonContent({
  status,
  analyzing,
}: Readonly<{ status: FormStatus; analyzing: boolean }>) {
  const busyLabel = submitBusyLabel(status, analyzing)
  if (busyLabel) {
    return (
      <>
        <Spinner className="size-4" />
        {busyLabel}
      </>
    )
  }
  return <>Submit wallpaper</>
}

function submitBusyLabel(status: FormStatus, analyzing: boolean): string | null {
  if (status === "submitting") return "Submitting…"
  if (status === "inspecting") return "Reading video…"
  if (analyzing) return "Analyzing video…"
  return null
}

function AiStatusLine({
  analyzing,
  suggested,
}: Readonly<{ analyzing: boolean; suggested: boolean }>) {
  if (analyzing) {
    return (
      <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-marketing-muted">
        <Spinner className="size-3.5" />
        Analyzing video for title and category…
      </p>
    )
  }
  if (suggested) {
    return (
      <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-marketing-muted">
        <SparkleIcon className="size-3.5 text-foreground/70" />
        Title and category suggested by AI
      </p>
    )
  }
  return null
}

function SparkleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2.5l1.8 5.2a4 4 0 0 0 2.5 2.5l5.2 1.8-5.2 1.8a4 4 0 0 0-2.5 2.5L12 21.5l-1.8-5.2a4 4 0 0 0-2.5-2.5L2.5 12l5.2-1.8a4 4 0 0 0 2.5-2.5L12 2.5z" />
    </svg>
  )
}

async function requestPresign(payload: {
  uploadId: string
  videoExtension: string
  videoContentType: string
}): Promise<PresignResponse> {
  const response = await fetch("/api/community/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = (await response.json().catch(() => ({}))) as PresignResponse
  if (!response.ok) {
    const retryAfter = parseRetryAfter(response.headers.get("Retry-After"))
    throw new Error(presignErrorMessage(data.error, response.status, retryAfter))
  }
  return data
}

async function registerSubmission(payload: {
  uploadId: string
  visitorId: string
  title: string
  category: string
  authorName?: string
  videoExtension: string
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
}) {
  const response = await fetch("/api/community/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = (await response.json().catch(() => ({}))) as {
    error?: string
  }
  if (!response.ok) {
    const retryAfter = parseRetryAfter(response.headers.get("Retry-After"))
    throw new Error(submitErrorMessage(data.error, response.status, retryAfter))
  }
}

async function uploadToR2(url: string, body: Blob, contentType: string) {
  let lastError: unknown = null
  for (let attempt = 1; attempt <= UPLOAD_RETRY_ATTEMPTS; attempt += 1) {
    try {
      // Content-Type is bound into the R2 presign — do not send extra headers.
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body,
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
  throw new Error(
    lastError instanceof Error
      ? `Upload failed: ${lastError.message}`
      : "Upload failed. Check your connection and try again."
  )
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined
}

function getOrCreateVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY)
    if (existing && isUuid(existing)) return existing.toLowerCase()
    const next = createUuid()
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, next)
    return next
  } catch {
    return createUuid()
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function createUuid(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === "x" ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

async function inspectVideoFile(file: File): Promise<InspectedVideo> {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement("video")
  video.preload = "metadata"
  video.muted = true
  video.playsInline = true
  video.src = objectUrl

  try {
    await waitForMediaEvent(video, "loadedmetadata", "error", 20_000)
    const width = video.videoWidth
    const height = video.videoHeight
    const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0
    if (!width || !height) {
      throw new Error("Could not read the video dimensions.")
    }

    const seekTime = chooseThumbnailTime(durationSeconds)
    if (seekTime > 0) {
      video.currentTime = seekTime
      await waitForMediaEvent(video, "seeked", "error", 20_000)
    }

    await waitForPaintedFrame(video)
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

/**
 * Picks the frame time to capture for the thumbnail. A community submission is a
 * single hero clip, so the mid-point is the most representative still and avoids
 * the dark intro / fade-in frames that a near-start capture frequently lands on.
 */
function chooseThumbnailTime(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0
  const mid = durationSeconds * 0.5
  return Math.min(Math.max(mid, 0.1), Math.max(durationSeconds - 0.05, 0))
}

/**
 * `seeked` only signals that the seek completed — the decoded frame may not be
 * painted yet, so drawing immediately can produce a black/partial thumbnail.
 * Wait for an actually-presented frame when the browser supports it.
 */
function waitForPaintedFrame(video: HTMLVideoElement): Promise<void> {
  const withCallback = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number
  }
  const requestFrame = withCallback.requestVideoFrameCallback
  if (typeof requestFrame === "function") {
    return new Promise((resolve) => {
      let settled = false
      const done = () => {
        if (settled) return
        settled = true
        resolve()
      }
      requestFrame.call(video, done)
      window.setTimeout(done, 400)
    })
  }
  return new Promise((resolve) => window.setTimeout(resolve, 120))
}

async function videoFrameToJpeg(
  video: HTMLVideoElement,
  width: number,
  height: number
): Promise<Blob> {
  const scale = Math.min(1, THUMB_MAX_WIDTH / Math.max(width, 1))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Your browser could not create a thumbnail.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not create a thumbnail."))
        else resolve(blob)
      },
      "image/jpeg",
      THUMB_QUALITY
    )
  })
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

function waitForMediaEvent(
  element: HTMLMediaElement,
  eventName: keyof HTMLMediaElementEventMap,
  errorEventName: keyof HTMLMediaElementEventMap,
  timeoutMs: number
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("Timed out while reading the video."))
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
      reject(new Error("Your browser could not decode this video."))
    }

    element.addEventListener(eventName, onSuccess, { once: true })
    element.addEventListener(errorEventName, onError, { once: true })
  })
}

function fileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
