"use client"

/** Left pane of the review workspace: status filter and the submissions. */

import { Film, FileVideo, TriangleAlert } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Badge,
  EmptyState,
  Kbd,
  Notice,
  Segmented,
  Skeleton,
} from "@/components/admin/ui"
import { formatRelativeTime } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import { useUploadMedia, type UploadMedia } from "./review-media"
import {
  STATUS_FILTERS,
  authorLabel,
  statusMeta,
  type UploadFilter,
  type UploadItem,
} from "./review-types"

/** The API returns at most this many rows per filter. */
const PAGE_LIMIT = 200

const EMPTY_COPY: Record<UploadFilter, { title: string; description: string }> =
  {
    pending: {
      title: "Nothing to review",
      description: "New community uploads show up here as they arrive.",
    },
    approved: {
      title: "No approved uploads",
      description: "Submissions you approve and publish are listed here.",
    },
    rejected: {
      title: "No rejected uploads",
      description: "Submissions you reject are listed here.",
    },
    all: {
      title: "No submissions yet",
      description: "Wallpapers sent from the MacWall app show up here.",
    },
  }

export function ReviewQueue({
  filter,
  onFilterChange,
  rows,
  error,
  onRetry,
  refreshing,
  selectedId,
  onSelect,
  className,
}: Readonly<{
  filter: UploadFilter
  onFilterChange: (filter: UploadFilter) => void
  /** `null` while the filter loads for the first time. */
  rows: readonly UploadItem[] | null
  error: string | null
  onRetry: () => void
  refreshing: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  className?: string
}>) {
  const retry = (
    <Button variant="outline" size="xs" onClick={onRetry} disabled={refreshing}>
      Retry
    </Button>
  )

  return (
    <aside
      aria-label="Review queue"
      className={cn(
        "min-h-0 min-w-0 flex-1 flex-col border-border lg:w-[340px] lg:flex-none lg:border-r",
        className
      )}
    >
      <div className="shrink-0 border-b border-border p-3">
        <Segmented
          label="Filter by status"
          size="sm"
          className="grid w-full"
          value={filter}
          onChange={onFilterChange}
          options={STATUS_FILTERS}
        />
      </div>

      {error && rows ? (
        <div className="shrink-0 border-b border-border p-3">
          <Notice title="Couldn't refresh the queue" action={retry}>
            {error}
          </Notice>
        </div>
      ) : null}

      <div
        aria-busy={rows === null || refreshing}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2 transition-opacity duration-200 motion-reduce:transition-none",
          refreshing && rows && "opacity-60"
        )}
      >
        {rows === null ? (
          error ? (
            <Notice
              title="Couldn't load the queue"
              action={retry}
              className="m-1"
            >
              {error}
            </Notice>
          ) : (
            <QueueSkeleton />
          )
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileVideo />}
            title={EMPTY_COPY[filter].title}
            description={EMPTY_COPY[filter].description}
            className="py-20"
          />
        ) : (
          <ul className="space-y-0.5">
            {rows.map((upload) => (
              <QueueRow
                key={upload.id}
                upload={upload}
                active={upload.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>

      {rows && rows.length > 0 ? (
        <footer className="flex h-9 shrink-0 items-center justify-between gap-3 border-t border-border px-3 text-xs text-muted-foreground">
          <p className="truncate tabular-nums">
            {rows.length >= PAGE_LIMIT
              ? `Latest ${PAGE_LIMIT} submissions`
              : `${rows.length} ${rows.length === 1 ? "submission" : "submissions"}`}
          </p>
          <p className="hidden shrink-0 items-center gap-1 lg:flex">
            <Kbd>J</Kbd>
            <Kbd>K</Kbd>
            <span className="ml-0.5">to move</span>
          </p>
        </footer>
      ) : null}
    </aside>
  )
}

function QueueRow({
  upload,
  active,
  onSelect,
}: Readonly<{
  upload: UploadItem
  active: boolean
  onSelect: (id: string) => void
}>) {
  const ref = useRef<HTMLButtonElement>(null)
  const [seen, setSeen] = useState(false)
  const media = useUploadMedia(upload.id, { enabled: seen })
  const status = statusMeta(upload)

  // Thumbnails are signed per upload, so only rows that scroll into view ask.
  useEffect(() => {
    const node = ref.current
    if (!node || seen) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true)
      },
      { rootMargin: "240px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [seen])

  // Keep the selection in view when it moves by keyboard or after a decision.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" })
  }, [active])

  return (
    <li>
      <button
        ref={ref}
        type="button"
        onClick={() => onSelect(upload.id)}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "bg-fill-hover" : "hover:bg-fill"
        )}
      >
        <Thumbnail media={media} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "truncate text-[13px] font-medium",
                active ? "text-foreground" : "text-soft"
              )}
            >
              {upload.title}
            </span>
            {upload.ipFlags.length > 0 ? (
              <TriangleAlert
                role="img"
                aria-label="IP-risk keyword in the title"
                className="text-amber size-3.5 shrink-0"
              />
            ) : null}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{authorLabel(upload)}</span>
            <span aria-hidden className="text-faint">
              ·
            </span>
            <time dateTime={upload.createdAt} className="shrink-0">
              {formatRelativeTime(upload.createdAt)}
            </time>
          </span>
        </span>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </button>
    </li>
  )
}

function Thumbnail({ media }: Readonly<{ media: UploadMedia | undefined }>) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const url = media?.status === "ready" ? media.thumbUrl : null
  const showImage = url !== null && url !== failedUrl
  const unavailable = media?.status === "error" || (url !== null && !showImage)

  return (
    <span
      aria-hidden
      className={cn(
        "bg-fill text-faint flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border",
        !showImage && !unavailable && "admin-skeleton"
      )}
    >
      {showImage ? (
        // A short-lived signed R2 link; next/image can't optimise or cache it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(url)}
          className="size-full object-cover"
        />
      ) : unavailable ? (
        <Film className="size-3.5" />
      ) : null}
    </span>
  )
}

function QueueSkeleton() {
  return (
    <div aria-hidden className="space-y-0.5">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="h-9 w-14 shrink-0 rounded-[8px]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}
