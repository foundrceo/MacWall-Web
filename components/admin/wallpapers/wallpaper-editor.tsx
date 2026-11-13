"use client"

import { Check, X } from "lucide-react"
import { useId, type FormEvent } from "react"

import {
  CopyButton,
  DataList,
  Field,
  IconButton,
  Notice,
  Spinner,
  StatusDot,
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
import { Textarea } from "@/components/ui/textarea"
import { formatBytes, formatDuration } from "@/lib/admin/format"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

import {
  NAME_MAX,
  TAG_LIMIT,
  TAG_MAX_LENGTH,
  draftProblems,
  parseTags,
  type Wallpaper,
  type WallpaperDraft,
} from "./catalog"

const TOGGLES = [
  {
    key: "isFeatured",
    label: "Featured",
    hint: "Highlighted on the app home",
  },
  {
    key: "isCuratedPick",
    label: "Curated pick",
    hint: "Included in editor picks",
  },
  {
    key: "isPro",
    label: "Pro only",
    hint: "Requires a licence",
  },
] as const satisfies readonly {
  key: keyof WallpaperDraft
  label: string
  hint: string
}[]

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Metadata form for one wallpaper. Controlled: the catalog hook owns the
 * draft, so edits survive the move between the side pane and the sheet.
 */
export function WallpaperEditor({
  wallpaper,
  draft,
  dirty,
  saving,
  saved,
  error,
  onChange,
  onSave,
  onDiscard,
  onClose,
}: Readonly<{
  wallpaper: Wallpaper
  draft: WallpaperDraft
  dirty: boolean
  saving: boolean
  /** The last save went through and nothing has changed since. */
  saved: boolean
  error: string | null
  onChange: (patch: Partial<WallpaperDraft>) => void
  onSave: () => void
  onDiscard: () => void
  onClose: () => void
}>) {
  const id = useId()
  const problems = draftProblems(draft)
  const tagCount = parseTags(draft.tagsText).length
  const canSave = dirty && !saving && !problems.name && !problems.category

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSave) onSave()
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label={`Edit ${wallpaper.name}`}
      className="flex min-h-0 flex-1 flex-col"
    >
      <header className="flex shrink-0 items-center gap-1 border-b border-border py-2.5 pr-2.5 pl-4">
        <div className="min-w-0 flex-1 pr-2">
          <h2 className="truncate text-[13px] font-medium text-foreground">
            {wallpaper.name}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {wallpaper.id}
          </p>
        </div>
        <CopyButton value={wallpaper.id} label="Copy ID" />
        <IconButton label="Close editor" onClick={onClose}>
          <X aria-hidden />
        </IconButton>
      </header>

      {/* `relative`: Radix puts hidden form inputs next to the select and the
          switches; they must scroll with this pane, not stretch the page. */}
      <div className="relative min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        <div className="p-4">
          <video
            key={wallpaper.videoUrl}
            src={wallpaper.videoUrl}
            poster={wallpaper.thumbUrl}
            controls
            playsInline
            preload="metadata"
            aria-label={`Preview of ${wallpaper.name}`}
            className="bg-fill aspect-video w-full rounded-lg object-cover ring-1 ring-border"
          />
        </div>

        <div className="space-y-4 p-4">
          <Field label="Name" htmlFor={`${id}-name`} error={problems.name}>
            <Input
              id={`${id}-name`}
              value={draft.name}
              onChange={(event) => onChange({ name: event.target.value })}
              maxLength={NAME_MAX}
              autoComplete="off"
              disabled={saving}
              aria-invalid={problems.name ? true : undefined}
            />
          </Field>

          <Field
            label="Category"
            htmlFor={`${id}-category`}
            error={problems.category}
          >
            <Select
              value={
                WALLPAPER_CATEGORIES.includes(draft.category)
                  ? draft.category
                  : ""
              }
              onValueChange={(category) => onChange({ category })}
              disabled={saving}
            >
              <SelectTrigger
                id={`${id}-category`}
                className="w-full"
                aria-invalid={problems.category ? true : undefined}
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {WALLPAPER_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Tags"
            htmlFor={`${id}-tags`}
            hint={
              problems.tags ? (
                <span className="text-amber">{problems.tags}</span>
              ) : (
                `${tagCount} of ${TAG_LIMIT} tags, separated by commas. ${TAG_MAX_LENGTH} characters max each.`
              )
            }
          >
            <Textarea
              id={`${id}-tags`}
              value={draft.tagsText}
              onChange={(event) => onChange({ tagsText: event.target.value })}
              placeholder="ocean, sunset, calm"
              spellCheck={false}
              disabled={saving}
            />
          </Field>
        </div>

        <div className="px-4 py-1.5">
          {TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex cursor-pointer items-center justify-between gap-4 py-2.5"
            >
              <span className="min-w-0">
                <span
                  id={`${id}-${toggle.key}-label`}
                  className="block text-[13px] font-medium text-foreground"
                >
                  {toggle.label}
                </span>
                <span
                  id={`${id}-${toggle.key}-hint`}
                  className="block text-xs text-muted-foreground"
                >
                  {toggle.hint}
                </span>
              </span>
              <Switch
                checked={draft[toggle.key]}
                onCheckedChange={(checked) =>
                  onChange({ [toggle.key]: checked })
                }
                disabled={saving}
                aria-labelledby={`${id}-${toggle.key}-label`}
                aria-describedby={`${id}-${toggle.key}-hint`}
              />
            </label>
          ))}
        </div>

        <div className="p-4">
          <DataList
            items={[
              { label: "Likes", value: wallpaper.likeCount.toLocaleString() },
              { label: "Resolution", value: wallpaper.resolution || "—" },
              {
                label: "Duration",
                value: formatDuration(wallpaper.durationSeconds),
              },
              {
                label: "File size",
                value: formatBytes(wallpaper.fileSizeBytes),
              },
              { label: "Added", value: formatDate(wallpaper.createdAt) },
              { label: "Last updated", value: formatDate(wallpaper.updatedAt) },
            ]}
            className="tabular-nums"
          />
        </div>
      </div>

      <footer className="shrink-0 space-y-3 border-t border-border px-4 py-3">
        {error ? <Notice title="Changes not saved">{error}</Notice> : null}
        <div className="flex items-center gap-2">
          <p
            aria-live="polite"
            className="mr-auto flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
          >
            {dirty ? (
              <StatusDot tone="amber" />
            ) : saved ? (
              <Check aria-hidden className="text-green size-3.5 shrink-0" />
            ) : null}
            <span className="truncate">
              {dirty
                ? "Unsaved changes"
                : saved
                  ? "Changes saved"
                  : "No unsaved changes"}
            </span>
          </p>
          {dirty ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDiscard}
              disabled={saving}
            >
              Discard
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={!canSave}>
            {saving ? (
              <Spinner className="size-3.5 text-primary-foreground" />
            ) : null}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </footer>
    </form>
  )
}
