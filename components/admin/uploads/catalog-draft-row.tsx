"use client"

/**
 * One staged wallpaper in the bulk upload review list: thumbnail, status and
 * actions on the first line, then the editable details. Presentation only;
 * every change goes back through the callbacks.
 */

import {
  CircleAlert,
  CircleCheck,
  Film,
  ImagePlus,
  Info,
  Scissors,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react"
import { memo, useRef, type ReactNode } from "react"

import {
  Badge,
  Field,
  IconButton,
  Meter,
  Spinner,
  type Tone,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatBytes, formatDuration } from "@/lib/admin/format"
import { cn } from "@/lib/utils"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

import type { CatalogDraft, DraftField } from "./catalog-types"

type StageIcon = "spinner" | "done" | "failed" | "warning" | null

type Stage = {
  label: string
  tone: Tone
  icon: StageIcon
}

/**
 * Plain-words stage for a draft. During an upload the row's `progress` runs
 * 5 (signing) -> 10-80 (video) -> 82 (thumbnail) -> 90 (commit) -> 100.
 */
function draftStage(draft: CatalogDraft, valid: boolean, busy: boolean): Stage {
  switch (draft.status) {
    case "committed":
      return { label: "Published", tone: "green", icon: "done" }
    case "uploaded":
      // Files are on R2; only the catalog entry is missing.
      return busy
        ? { label: "Publishing to catalog", tone: "blue", icon: "spinner" }
        : { label: "Uploaded, not published", tone: "blue", icon: "done" }
    case "uploading":
      return {
        label:
          draft.progress < 10
            ? "Preparing upload"
            : draft.progress < 82
              ? "Uploading video"
              : draft.progress < 90
                ? "Uploading thumbnail"
                : "Publishing to catalog",
        tone: "blue",
        icon: "spinner",
      }
    case "analyzing":
      return {
        label: draft.thumbBlob ? "AI is naming it" : "Reading video",
        tone: "blue",
        icon: "spinner",
      }
    case "error":
      return { label: "Failed", tone: "red", icon: "failed" }
    case "ready":
    default:
      return valid
        ? { label: "Ready", tone: "neutral", icon: null }
        : { label: "Needs a fix", tone: "amber", icon: "warning" }
  }
}

function StageBadge({ stage }: Readonly<{ stage: Stage }>) {
  return (
    <Badge tone={stage.tone}>
      {stage.icon === "spinner" ? (
        <Spinner className="text-current" />
      ) : stage.icon === "done" ? (
        <CircleCheck aria-hidden />
      ) : stage.icon === "failed" ? (
        <CircleAlert aria-hidden />
      ) : stage.icon === "warning" ? (
        <TriangleAlert aria-hidden />
      ) : null}
      {stage.label}
    </Badge>
  )
}

function resolutionLabel(draft: CatalogDraft) {
  if (draft.resolution.includes("x")) {
    return draft.resolution.replace("x", " × ")
  }
  return draft.status === "analyzing" ? "Reading…" : "Unknown"
}

type DraftRowProps = Readonly<{
  draft: CatalogDraft
  /** Passes validation and can be uploaded. */
  valid: boolean
  issue: string | null
  issueField: DraftField | null
  /** An upload run is in progress. */
  busy: boolean
  onUpdate: (
    localId: string,
    updater: (draft: CatalogDraft) => CatalogDraft
  ) => void
  onUpdateId: (localId: string, rawId: string) => void
  onRemove: (localId: string) => void
  onReplaceThumb: (localId: string, file: File | undefined) => void
  onAnalyze: (draft: CatalogDraft) => void
  onOpenEditor: (localId: string) => void
}>

export const CatalogDraftRow = memo(function CatalogDraftRow({
  draft,
  valid,
  issue,
  issueField,
  busy,
  onUpdate,
  onUpdateId,
  onRemove,
  onReplaceThumb,
  onAnalyze,
  onOpenEditor,
}: DraftRowProps) {
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const { localId } = draft
  const disabled = busy || draft.status === "committed"
  const idLocked = disabled || draft.status === "uploaded"
  const published = draft.status === "committed"
  const stage = draftStage(draft, valid, busy)
  const inFlight =
    draft.status === "uploading" || (busy && draft.status === "uploaded")

  // "Still reading metadata" is already what the badge says.
  const visibleIssue = draft.status === "analyzing" ? null : issue
  const fieldIssue = (field: DraftField) =>
    visibleIssue && issueField === field ? visibleIssue : undefined
  const rowIssue = visibleIssue && !issueField ? visibleIssue : null

  return (
    <li className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 p-4 [contain-intrinsic-size:auto_13rem] [content-visibility:auto] @2xl:grid-cols-[9rem_minmax(0,1fr)] @2xl:gap-x-4">
      <div className="bg-fill relative aspect-video overflow-hidden rounded-lg border border-border @2xl:row-span-2">
        {draft.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.thumbUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="text-faint flex size-full items-center justify-center">
            {draft.status === "analyzing" ? (
              <Spinner />
            ) : (
              <Film aria-hidden className="size-4" />
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <StageBadge stage={stage} />
        <p
          className="min-w-24 flex-1 truncate text-xs text-muted-foreground"
          title={draft.sourceFileName}
        >
          {draft.sourceFileName}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5"
            disabled={disabled || draft.status === "analyzing"}
            onClick={() => onOpenEditor(localId)}
          >
            <Scissors aria-hidden className="size-3.5" />
            Edit video
          </Button>
          <IconButton
            label="Suggest name and tags with AI"
            disabled={
              disabled || !draft.thumbBlob || draft.status === "analyzing"
            }
            onClick={() => onAnalyze(draft)}
          >
            <Sparkles aria-hidden />
          </IconButton>
          <IconButton
            label="Replace thumbnail"
            disabled={disabled}
            onClick={() => thumbInputRef.current?.click()}
          >
            <ImagePlus aria-hidden />
          </IconButton>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            tabIndex={-1}
            aria-hidden
            disabled={disabled}
            onChange={(event) => {
              onReplaceThumb(localId, event.target.files?.[0])
              event.target.value = ""
            }}
          />
          <IconButton
            label={`Remove ${draft.name || draft.sourceFileName}`}
            disabled={disabled}
            onClick={() => onRemove(localId)}
          >
            <X aria-hidden />
          </IconButton>
        </div>
      </div>

      <div className="col-span-2 min-w-0 space-y-3 @2xl:col-span-1 @2xl:col-start-2">
        {inFlight ? (
          <div className="flex items-center gap-3">
            <Meter
              label={`${stage.label}: ${draft.name}`}
              value={draft.progress}
              className="flex-1"
            />
            <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
              {draft.progress}%
            </span>
          </div>
        ) : null}

        {published ? (
          <p className="text-soft truncate text-[13px]">
            <span className="font-medium text-foreground">{draft.name}</span>
            {" · "}
            {draft.category}
            {" · "}
            <span className="font-mono text-xs">{draft.videoKey}</span>
          </p>
        ) : (
          <>
            <div className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_9.5rem_minmax(0,1.5fr)]">
              <Field
                label="Title"
                htmlFor={`${localId}-name`}
                error={fieldIssue("name")}
              >
                <Input
                  id={`${localId}-name`}
                  value={draft.name}
                  disabled={disabled}
                  aria-invalid={fieldIssue("name") ? true : undefined}
                  onChange={(event) =>
                    onUpdate(localId, (current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field
                label="Wallpaper ID"
                htmlFor={`${localId}-id`}
                error={fieldIssue("id")}
              >
                <Input
                  id={`${localId}-id`}
                  className="font-mono"
                  value={draft.id}
                  disabled={idLocked}
                  spellCheck={false}
                  autoCapitalize="off"
                  aria-invalid={fieldIssue("id") ? true : undefined}
                  onChange={(event) => onUpdateId(localId, event.target.value)}
                />
              </Field>

              <Field
                label="Category"
                htmlFor={`${localId}-category`}
                error={fieldIssue("category")}
              >
                <Select
                  value={draft.category}
                  disabled={disabled}
                  onValueChange={(category) =>
                    onUpdate(localId, (current) => ({
                      ...current,
                      category,
                    }))
                  }
                >
                  <SelectTrigger
                    id={`${localId}-category`}
                    className="w-full"
                    aria-invalid={fieldIssue("category") ? true : undefined}
                  >
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

              <Field label="Tags" htmlFor={`${localId}-tags`}>
                <Input
                  id={`${localId}-tags`}
                  value={draft.tagsText}
                  disabled={disabled}
                  placeholder="comma, separated, tags"
                  onChange={(event) =>
                    onUpdate(localId, (current) => ({
                      ...current,
                      tagsText: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
              <dl className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs">
                <Fact label="Resolution">{resolutionLabel(draft)}</Fact>
                <Fact label="Length">
                  {formatDuration(draft.durationSeconds)}
                  {draft.trimEndSeconds !== null ? " (trimmed)" : ""}
                </Fact>
                <Fact label="Size">{formatBytes(draft.fileSizeBytes)}</Fact>
                <Fact label="Saves to" className="min-w-0">
                  <span className="block truncate font-mono">
                    {draft.videoKey}
                  </span>
                </Fact>
              </dl>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Flag
                  label="Featured"
                  checked={draft.isFeatured}
                  disabled={disabled}
                  onChange={(isFeatured) =>
                    onUpdate(localId, (current) => ({ ...current, isFeatured }))
                  }
                />
                <Flag
                  label="Curated pick"
                  checked={draft.isCuratedPick}
                  disabled={disabled}
                  onChange={(isCuratedPick) =>
                    onUpdate(localId, (current) => ({
                      ...current,
                      isCuratedPick,
                    }))
                  }
                />
                <Flag
                  label="Pro"
                  checked={draft.isPro}
                  disabled={disabled}
                  onChange={(isPro) =>
                    onUpdate(localId, (current) => ({ ...current, isPro }))
                  }
                />
              </div>
            </div>
          </>
        )}

        {draft.error ? (
          draft.status === "error" ? (
            <RowMessage tone="red" icon={<CircleAlert aria-hidden />}>
              {draft.error}
              {valid ? " The next upload retries it." : ""}
            </RowMessage>
          ) : (
            <RowMessage tone="neutral" icon={<Info aria-hidden />}>
              {draft.error}
            </RowMessage>
          )
        ) : null}
        {rowIssue ? (
          <RowMessage tone="amber" icon={<TriangleAlert aria-hidden />}>
            {rowIssue}
          </RowMessage>
        ) : null}
      </div>
    </li>
  )
})

function Fact({
  label,
  className,
  children,
}: Readonly<{ label: string; className?: string; children: ReactNode }>) {
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-soft min-w-0 tabular-nums">{children}</dd>
    </div>
  )
}

function Flag({
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
    <label
      className={cn(
        "text-soft inline-flex items-center gap-2 text-xs",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
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

const messageTone = {
  red: "text-red",
  amber: "text-amber",
  neutral: "text-muted-foreground",
} as const

function RowMessage({
  tone,
  icon,
  children,
}: Readonly<{
  tone: keyof typeof messageTone
  icon: ReactNode
  children: ReactNode
}>) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-xs [&_svg]:mt-px [&_svg]:size-3.5 [&_svg]:shrink-0",
        messageTone[tone]
      )}
    >
      {icon}
      <span className="min-w-0 text-pretty">{children}</span>
    </p>
  )
}
