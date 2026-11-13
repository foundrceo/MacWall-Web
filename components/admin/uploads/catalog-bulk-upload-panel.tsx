"use client"

/**
 * Bulk catalog upload: add videos, review the drafts, publish. This file is
 * the layout; the pipeline lives in `catalog-use-bulk-upload.ts` (see
 * `catalog-types.ts` for the map of helper files).
 */

import { Film, RotateCcw, Upload, Video } from "lucide-react"
import { useCallback, useState } from "react"

import {
  EmptyState,
  Meter,
  Notice,
  Panel,
  Spinner,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatBytes } from "@/lib/admin/format"
import { UPLOAD_FILE_CONCURRENCY } from "@/lib/admin/r2-browser-upload"

import { CatalogDraftRow } from "./catalog-draft-row"
import { formatRecoveryTime } from "./catalog-session"
import { MAX_FILES, type CatalogDraft } from "./catalog-types"
import {
  BrowseHint,
  overallPercent,
  UploadActionBar,
  UploadDropZone,
  UploadStep,
  type UploadCount,
} from "./catalog-upload-blocks"
import { useCatalogBulkUpload } from "./catalog-use-bulk-upload"
import { VideoEditorModal } from "./video-editor-modal"

/** Largest video the sign route accepts (lib/admin/catalog-bulk-upload.ts). */
const MAX_VIDEO_SIZE_LABEL = "2 GB"

type PendingConfirm = "clear" | "discard" | null

function wallpapers(count: number) {
  return `${count.toLocaleString()} wallpaper${count === 1 ? "" : "s"}`
}

export function CatalogBulkUploadPanel({
  onUploaded,
}: Readonly<{ onUploaded?: () => Promise<void> | void }>) {
  const {
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
    openEditor,
    closeEditor,
    applyEditorTrim,
  } = useCatalogBulkUpload({ onUploaded })

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null)

  const analyzeOne = useCallback(
    (draft: CatalogDraft) => {
      void analyzeDraftMetadata([draft])
    },
    [analyzeDraftMetadata]
  )
  const replaceOneThumb = useCallback(
    (localId: string, file: File | undefined) => {
      void replaceThumb(localId, file)
    },
    [replaceThumb]
  )

  const readyDrafts = drafts.filter(
    (draft) => draft.status !== "committed" && validation.get(draft.localId)?.ok
  )
  const readyBytes = readyDrafts.reduce(
    (total, draft) => total + draft.fileSizeBytes,
    0
  )
  const needsFixCount = drafts.filter(
    (draft) =>
      draft.status !== "committed" &&
      draft.status !== "analyzing" &&
      !validation.get(draft.localId)?.ok
  ).length
  /** Everything left to send has already failed once. */
  const retrying =
    readyDrafts.length > 0 &&
    readyDrafts.every((draft) => draft.status === "error")
  const unpublishedCount = drafts.length - committedCount
  const batchFull = drafts.length >= MAX_FILES
  const recoveryBlocked = busy || analyzing || drafts.length > 0

  const counts: UploadCount[] = drafts.length
    ? [
        { label: "Staged", value: drafts.length.toLocaleString() },
        { label: "Ready", value: readyCount.toLocaleString() },
        ...(needsFixCount
          ? [
              {
                label: "Need a fix",
                value: needsFixCount.toLocaleString(),
                tone: "amber" as const,
              },
            ]
          : []),
        ...(committedCount
          ? [
              {
                label: "Published",
                value: committedCount.toLocaleString(),
                tone: "green" as const,
              },
            ]
          : []),
        { label: "To upload", value: formatBytes(readyBytes) },
      ]
    : []

  const runPercent = uploadRun
    ? uploadRun.phase === "complete"
      ? 100
      : overallPercent(
          uploadRun.localIds.map((localId) => {
            const draft = drafts.find((item) => item.localId === localId)
            return !draft || draft.status === "error" ? 100 : draft.progress
          })
        )
    : 0
  const runLeft = uploadRun
    ? Math.max(0, uploadRun.total - uploadRun.published - uploadRun.failed)
    : 0

  function requestClear() {
    // Nothing is lost by clearing a list that is fully published.
    if (unpublishedCount === 0) clearDrafts()
    else setPendingConfirm("clear")
  }

  function confirmPending() {
    if (pendingConfirm === "clear") clearDrafts()
    else if (pendingConfirm === "discard") discardLastUploadSession()
    setPendingConfirm(null)
  }

  return (
    <div className="space-y-6">
      {recoverableSession ? (
        <Notice tone="info" title="Unfinished upload session">
          <p>
            {wallpapers(recoverableSession.count)} staged{" "}
            {formatRecoveryTime(recoverableSession.updatedAt)}.{" "}
            {recoveryBlocked
              ? "Clear the current list to restore them."
              : "Restore them to carry on where you stopped."}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={recoveryBlocked}
              onClick={() => void restoreLastUploadSession()}
            >
              <RotateCcw aria-hidden />
              Restore session
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={recoveryBlocked}
              onClick={() => setPendingConfirm("discard")}
            >
              Discard
            </Button>
          </div>
        </Notice>
      ) : null}

      <UploadStep
        step={1}
        title="Add videos"
        description="Each video gets a title, category, tags and thumbnail, read from the file and refined by AI."
      >
        <UploadDropZone
          icon={<Video />}
          title={
            analyzing ? (
              "Reading videos…"
            ) : busy ? (
              "Upload in progress"
            ) : batchFull ? (
              "This batch is full"
            ) : (
              <>
                Drop videos here or <BrowseHint>browse</BrowseHint>
              </>
            )
          }
          activeTitle="Drop to stage these videos"
          description={
            batchFull && !busy && !analyzing
              ? `Remove a staged wallpaper to add another. ${MAX_FILES} fit in one batch.`
              : `MP4, MOV, M4V or WebM · up to ${MAX_VIDEO_SIZE_LABEL} each · ${MAX_FILES} per batch`
          }
          active={dragActive}
          disabled={!canStageMore}
          busy={analyzing}
          compact={drafts.length > 0}
          onChoose={() => void pickFiles()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(event) => void handleDrop(event)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm"
          multiple
          hidden
          tabIndex={-1}
          aria-hidden
          onChange={(event) => void handleFilesSelected(event)}
        />
        {error ? <Notice>{error}</Notice> : null}
        {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      </UploadStep>

      <UploadStep
        step={2}
        title="Review details"
        description={
          <>
            Check each draft before it goes live. Files are saved to{" "}
            <span className="text-soft font-mono text-xs">videos/</span> and{" "}
            <span className="text-soft font-mono text-xs">thumbs/</span> under
            the wallpaper ID.
          </>
        }
        actions={
          drafts.length ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={requestClear}
              disabled={busy}
            >
              Clear all
            </Button>
          ) : null
        }
      >
        <Panel className="overflow-hidden">
          {drafts.length ? (
            <ul className="@container divide-y divide-border">
              {drafts.map((draft) => {
                const result = validation.get(draft.localId)
                return (
                  <CatalogDraftRow
                    key={draft.localId}
                    draft={draft}
                    valid={result?.ok ?? false}
                    issue={result?.message ?? null}
                    issueField={result?.field ?? null}
                    busy={busy}
                    onUpdate={updateDraft}
                    onUpdateId={updateDraftId}
                    onRemove={removeDraft}
                    onReplaceThumb={replaceOneThumb}
                    onAnalyze={analyzeOne}
                    onOpenEditor={openEditor}
                  />
                )
              })}
            </ul>
          ) : (
            <EmptyState
              icon={<Film />}
              title="No videos staged"
              description="Videos you add show up here as editable drafts. Nothing is uploaded until you publish."
              className="py-10"
            />
          )}
        </Panel>
      </UploadStep>

      <UploadActionBar
        step={3}
        title="Upload and publish"
        counts={counts}
        note={
          drafts.length
            ? undefined
            : "Videos and thumbnails go to R2, then each wallpaper is added to the catalog."
        }
        action={
          <Button
            onClick={() => void handleUpload()}
            disabled={busy || analyzing || readyCount === 0}
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
                ? "Upload wallpapers"
                : `${retrying ? "Retry" : "Upload"} ${wallpapers(readyCount)}`}
          </Button>
        }
      >
        {uploadRun ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
              <p className="font-medium text-foreground">
                {uploadRun.phase === "processing"
                  ? "Uploading to R2 and publishing"
                  : "Upload finished"}
              </p>
              <p className="text-muted-foreground tabular-nums">
                {uploadRun.published.toLocaleString()} of{" "}
                {uploadRun.total.toLocaleString()} published
                {uploadRun.failed
                  ? ` · ${uploadRun.failed.toLocaleString()} failed`
                  : ""}
                {uploadRun.phase === "processing"
                  ? ` · ${runLeft.toLocaleString()} left`
                  : ""}
              </p>
            </div>
            <Meter
              label="Overall upload progress"
              value={runPercent}
              tone={
                uploadRun.phase === "processing"
                  ? "blue"
                  : uploadRun.failed
                    ? "amber"
                    : "green"
              }
            />
            <p className="text-xs text-pretty text-muted-foreground">
              {uploadRun.phase === "processing"
                ? `Started ${uploadRun.current.toLocaleString()} of ${uploadRun.total.toLocaleString()}, up to ${UPLOAD_FILE_CONCURRENCY} at a time. Keep this tab open until it finishes.`
                : uploadRun.failed
                  ? `${wallpapers(uploadRun.failed)} failed. Fix the rows marked Failed, then upload again: only those are sent.`
                  : "Everything in this run is live in the catalog."}
            </p>
          </div>
        ) : null}
      </UploadActionBar>

      <VideoEditorModal
        open={editorDraft !== null}
        onOpenChange={(open) => {
          if (!open) closeEditor()
        }}
        file={editorDraft?.file ?? null}
        title={editorDraft?.name}
        initialTrim={editorInitialTrim}
        onApply={applyEditorTrim}
      />

      <Dialog
        open={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConfirm(null)
        }}
      >
        <DialogContent className="gap-4 p-5 sm:max-w-sm">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-[15px] leading-snug font-semibold tracking-[-0.01em]">
              {pendingConfirm === "discard"
                ? "Discard the saved session?"
                : "Clear all staged wallpapers?"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-pretty">
              {pendingConfirm === "discard"
                ? `The saved session with ${wallpapers(recoverableSession?.count ?? 0)} is deleted. Nothing in the catalog changes. This cannot be undone.`
                : `${wallpapers(unpublishedCount)} not yet published and all edits are removed, along with the saved session. Published wallpapers stay in the catalog. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmPending}>
              {pendingConfirm === "discard" ? "Discard session" : "Clear all"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
