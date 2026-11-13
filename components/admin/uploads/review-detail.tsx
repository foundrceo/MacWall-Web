"use client"

/**
 * Right pane of the review workspace: the open submission with its preview,
 * facts, rights declaration, moderation log and the decision bar.
 *
 * The pane is a size container: once it is wide enough the rights and the log
 * move into their own column beside the preview, so a moderator sees the
 * video and the declaration together.
 */

import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
  VideoOff,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Badge,
  DataList,
  EmptyState,
  IconButton,
  Notice,
  Skeleton,
} from "@/components/admin/ui"
import {
  formatBytes,
  formatDuration,
  formatRelativeTime,
} from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import type { ModerationLogState } from "./review-data"
import { ReviewDecisionBar } from "./review-decision-bar"
import { requestUploadMedia, useUploadMedia } from "./review-media"
import { ReviewModerationLog } from "./review-moderation-log"
import { ReviewRightsPanel } from "./review-rights-panel"
import { DetailSection } from "./review-section"
import {
  authorLabel,
  formatDateTime,
  statusMeta,
  type DecisionResult,
  type ReviewAction,
  type UploadItem,
} from "./review-types"

const PREVIEW_FRAME = "aspect-video max-h-[min(58svh,540px)] w-full"

export function ReviewDetail({
  upload,
  loading,
  position,
  onStep,
  onBack,
  log,
  onRetryLog,
  acting,
  onDecide,
  className,
}: Readonly<{
  upload: UploadItem | null
  /** The queue itself is loading for the first time. */
  loading: boolean
  position: { index: number; total: number } | null
  onStep: (delta: 1 | -1) => void
  /** Phones only: back to the queue. */
  onBack: () => void
  log: ModerationLogState
  onRetryLog: () => void
  acting: ReviewAction | null
  onDecide: (
    upload: UploadItem,
    action: ReviewAction,
    note: string
  ) => Promise<DecisionResult>
  className?: string
}>) {
  const status = upload ? statusMeta(upload) : null

  return (
    <section
      aria-label="Submission"
      className={cn("@container min-h-0 min-w-0 flex-1 flex-col", className)}
    >
      {loading ? (
        <DetailSkeleton />
      ) : !upload || !status ? (
        <EmptyState
          icon={<MousePointerClick />}
          title="No submission selected"
          description="Pick a submission from the queue to review it."
          className="flex-1"
        />
      ) : (
        <>
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 sm:px-6">
            <IconButton
              label="Back to queue"
              side="bottom"
              className="-ml-1.5 lg:hidden"
              onClick={onBack}
            >
              <ArrowLeft aria-hidden />
            </IconButton>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                  {upload.title}
                </h2>
                <Badge tone={status.tone} dot>
                  {status.label}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {upload.category}
                <Separator />
                {authorLabel(upload)}
                <Separator />
                <time dateTime={upload.createdAt}>
                  {formatRelativeTime(upload.createdAt)}
                </time>
              </p>
            </div>
            {position ? (
              <div className="flex shrink-0 items-center gap-0.5">
                <p className="mr-1.5 hidden text-xs text-muted-foreground tabular-nums @lg:block">
                  {position.index + 1} of {position.total}
                </p>
                <IconButton
                  label="Previous submission"
                  side="bottom"
                  disabled={position.index === 0}
                  onClick={() => onStep(-1)}
                >
                  <ChevronUp aria-hidden />
                </IconButton>
                <IconButton
                  label="Next submission"
                  side="bottom"
                  disabled={position.index >= position.total - 1}
                  onClick={() => onStep(1)}
                >
                  <ChevronDown aria-hidden />
                </IconButton>
              </div>
            ) : null}
          </header>

          <div
            // Remounts per submission, so each one opens scrolled to the top.
            key={upload.id}
            className="min-h-0 flex-1 overflow-y-auto @3xl:flex @3xl:overflow-hidden"
          >
            <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 @3xl:min-h-0 @3xl:flex-1 @3xl:overflow-y-auto">
              <ReviewPreview upload={upload} />
              <Callouts upload={upload} />
              <DetailSection title="Submission">
                <DataList
                  layout="grid"
                  columns={2}
                  className="grid-cols-2"
                  items={[
                    { label: "Category", value: upload.category },
                    { label: "Resolution", value: upload.resolution },
                    {
                      label: "Duration",
                      value: formatDuration(upload.durationSeconds),
                    },
                    {
                      label: "File size",
                      value: formatBytes(upload.fileSizeBytes),
                    },
                    {
                      label: "Submitted",
                      value: formatDateTime(upload.createdAt),
                    },
                    {
                      label: "Last updated",
                      value: formatDateTime(upload.updatedAt),
                    },
                  ]}
                />
              </DetailSection>
            </div>

            <aside
              aria-label="Rights and history"
              className="space-y-5 border-t border-border px-4 py-5 sm:px-6 @3xl:w-[320px] @3xl:shrink-0 @3xl:overflow-y-auto @3xl:border-t-0 @3xl:border-l @3xl:px-5 @5xl:w-[360px]"
            >
              <ReviewRightsPanel upload={upload} />
              <ReviewModerationLog state={log} onRetry={onRetryLog} />
            </aside>
          </div>

          {upload.status === "pending" ? (
            <ReviewDecisionBar
              // A draft note belongs to one submission.
              key={upload.id}
              upload={upload}
              acting={acting}
              onDecide={(action, note) => onDecide(upload, action, note)}
            />
          ) : null}
        </>
      )}
    </section>
  )
}

function Separator() {
  return (
    <span aria-hidden className="text-faint mx-1.5">
      ·
    </span>
  )
}

/** The submitted video, played from a signed link that lasts an hour. */
function ReviewPreview({ upload }: Readonly<{ upload: UploadItem }>) {
  const media = useUploadMedia(upload.id, { priority: true })
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const ready = media?.status === "ready" ? media : null
  const playbackFailed = ready !== null && ready.videoUrl === failedUrl
  const failed = media?.status === "error" || playbackFailed

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-black">
      {ready && !playbackFailed ? (
        <video
          key={ready.videoUrl}
          src={ready.videoUrl}
          poster={ready.thumbUrl}
          controls
          playsInline
          preload="metadata"
          aria-label={`Preview of ${upload.title}`}
          onError={() => setFailedUrl(ready.videoUrl)}
          className={cn(PREVIEW_FRAME, "block object-contain")}
        />
      ) : failed ? (
        <div
          role="alert"
          className={cn(
            PREVIEW_FRAME,
            "flex flex-col items-center justify-center gap-3 px-6 text-center"
          )}
        >
          <VideoOff aria-hidden className="text-faint size-5" />
          <p className="text-soft max-w-xs text-[13px] text-pretty">
            {media?.status === "error"
              ? media.message
              : "The preview couldn't be played. Its signed link may have expired."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              requestUploadMedia(upload.id, { priority: true, force: true })
            }
          >
            Reload preview
          </Button>
        </div>
      ) : (
        <Skeleton className={cn(PREVIEW_FRAME, "rounded-none")} />
      )}
    </div>
  )
}

/** What a moderator should know before deciding, right under the preview. */
function Callouts({ upload }: Readonly<{ upload: UploadItem }>) {
  const waiting = upload.status === "pending" && upload.infoRequestedAt
  if (
    upload.ipFlags.length === 0 &&
    !waiting &&
    !upload.reviewNotes &&
    !upload.approvedWallpaperId
  ) {
    return null
  }

  return (
    <div className="space-y-2">
      {upload.ipFlags.length > 0 ? (
        <Notice tone="warning" title="IP-risk keyword hints">
          <ul className="my-1.5 flex flex-wrap gap-1.5">
            {upload.ipFlags.map((flag) => (
              <li key={flag} className="flex">
                <Badge tone="amber">{flag}</Badge>
              </li>
            ))}
          </ul>
          Matched words in the title or display name, not a finding. Check the
          source and license before approving.
        </Notice>
      ) : null}

      {waiting && upload.infoRequestedAt ? (
        <Notice tone="info" title="Waiting on the uploader">
          More information was requested on{" "}
          {formatDateTime(upload.infoRequestedAt)}.
        </Notice>
      ) : null}

      {upload.reviewNotes ? (
        <Notice tone="info" title="Review note">
          <p className="break-words whitespace-pre-wrap">
            {upload.reviewNotes}
          </p>
        </Notice>
      ) : null}

      {upload.approvedWallpaperId ? (
        <Notice
          tone="success"
          title="Published to the catalog"
          action={
            <Button asChild variant="outline" size="xs">
              <Link
                href={`/admin/wallpapers?q=${encodeURIComponent(upload.approvedWallpaperId)}`}
              >
                Open in catalog
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          }
        >
          <span className="font-mono text-xs break-all">
            {upload.approvedWallpaperId}
          </span>
        </Notice>
      ) : null}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 border-b border-border px-4 py-3 sm:px-6">
        <Skeleton className="h-4 w-56 max-w-[60%]" />
        <Skeleton className="h-3 w-40 max-w-[40%]" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden @3xl:flex">
        <div className="min-w-0 flex-1 space-y-5 px-4 py-5 sm:px-6">
          <Skeleton className={cn(PREVIEW_FRAME, "rounded-[10px]")} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3.5 w-28 max-w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden w-[320px] shrink-0 space-y-3 border-l border-border px-5 py-5 @3xl:block @5xl:w-[360px]">
          <Skeleton className="h-3.5 w-24" />
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-3.5 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
