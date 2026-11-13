"use client"

/**
 * Rows and tiles of the static wallpaper uploader: a queued image and a
 * published image. Presentation only.
 */

import { CircleAlert, CircleCheck, X } from "lucide-react"

import {
  Badge,
  CopyButton,
  IconButton,
  Meter,
  Spinner,
} from "@/components/admin/ui"
import { formatBytes } from "@/lib/admin/format"

import {
  formatListedDate,
  type DraftStatus,
  type ListedImage,
  type StaticDraft,
} from "./static-upload-files"

export function StaticDraftRow({
  draft,
  removeDisabled,
  onRemove,
}: Readonly<{
  draft: StaticDraft
  removeDisabled: boolean
  onRemove: (localId: string) => void
}>) {
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={draft.previewUrl}
        alt=""
        className="bg-fill aspect-video w-16 shrink-0 rounded-md border border-border object-cover sm:w-20"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">
          {draft.fileName}
        </p>
        {draft.status === "uploading" ? (
          <div className="mt-1.5 flex items-center gap-2.5">
            <Meter
              label={`Uploading ${draft.fileName}`}
              value={draft.progress}
              className="max-w-56 flex-1"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {draft.progress}%
            </span>
          </div>
        ) : draft.status === "error" && draft.error ? (
          <p className="text-red mt-0.5 text-xs">
            {draft.error} Upload again to retry.
          </p>
        ) : draft.status === "uploaded" && draft.publicUrl ? (
          <a
            href={draft.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-soft mt-0.5 block truncate rounded-sm text-xs underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {draft.publicUrl}
          </a>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {formatBytes(draft.sizeBytes)}
          </p>
        )}
      </div>
      <StaticStatusBadge status={draft.status} />
      {draft.status === "uploaded" && draft.publicUrl ? (
        <CopyButton value={draft.publicUrl} label="Copy URL" />
      ) : null}
      <IconButton
        label={`Remove ${draft.fileName}`}
        onClick={() => onRemove(draft.localId)}
        disabled={removeDisabled}
      >
        <X aria-hidden />
      </IconButton>
    </li>
  )
}

function StaticStatusBadge({ status }: Readonly<{ status: DraftStatus }>) {
  switch (status) {
    case "uploaded":
      return (
        <Badge tone="green">
          <CircleCheck aria-hidden />
          Uploaded
        </Badge>
      )
    case "error":
      return (
        <Badge tone="red">
          <CircleAlert aria-hidden />
          Failed
        </Badge>
      )
    case "uploading":
      return (
        <Badge tone="blue">
          <Spinner className="text-current" />
          Uploading
        </Badge>
      )
    case "ready":
    default:
      return <Badge>Ready</Badge>
  }
}

export function PublishedImage({ image }: Readonly<{ image: ListedImage }>) {
  const date = formatListedDate(image.lastModified)
  return (
    <li className="min-w-0">
      <a
        href={image.publicUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${image.fileName} in a new tab`}
        className="bg-fill hover:border-line-strong block overflow-hidden rounded-lg border border-border transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.publicUrl}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      </a>
      <div className="mt-2 flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">
            {image.fileName}
          </p>
          <p className="truncate text-xs text-muted-foreground tabular-nums">
            {formatBytes(image.sizeBytes)}
            {date ? ` · ${date}` : ""}
          </p>
        </div>
        <CopyButton value={image.publicUrl} label="Copy URL" />
      </div>
    </li>
  )
}
