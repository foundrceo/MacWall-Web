"use client"

/**
 * Trim editor for a staged catalog video. Applying hands back the chosen
 * range and a fresh thumbnail taken from it; the source file is not
 * re-encoded here.
 */

import { Film, Pause, Play, RotateCcw, Scissors } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { EmptyState, Field, Kbd, Notice, Spinner } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  canvasToJpeg,
  captureFrame,
  captureFrameElement,
  formatTimecode,
  MIN_TRIM_SECONDS,
  waitForEvent,
  type TrimTarget,
} from "./video-editor-frames"
import { Readout, SecondsInput, TrimTimeline } from "./video-editor-timeline"

export type VideoTrimRange = {
  startSeconds: number
  endSeconds: number
}

type VideoEditorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  title?: string
  initialTrim?: VideoTrimRange | null
  onApply: (trim: VideoTrimRange, thumbBlob: Blob, thumbUrl: string) => void
}

const FRAME_COUNT = 12

export function VideoEditorModal({
  open,
  onOpenChange,
  file,
  title,
  initialTrim,
  onApply,
}: Readonly<VideoEditorModalProps>) {
  const workspaceKey = file
    ? `${file.name}-${file.size}-${file.lastModified}`
    : "empty"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-border py-3.5 pr-14 pl-5">
          <DialogTitle className="truncate text-[15px] leading-snug font-semibold tracking-[-0.01em]">
            {title ? `Edit ${title}` : "Edit video"}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Pick the part of the clip to keep. The thumbnail is retaken from
            that range.
          </DialogDescription>
        </DialogHeader>

        {open && file ? (
          <VideoEditorWorkspace
            key={workspaceKey}
            file={file}
            initialTrim={initialTrim}
            onApply={onApply}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <EmptyState
            icon={<Film />}
            title="No video selected"
            description="Choose a staged video to edit."
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function VideoEditorWorkspace({
  file,
  initialTrim,
  onApply,
  onClose,
}: Readonly<{
  file: File
  initialTrim?: VideoTrimRange | null
  onApply: (trim: VideoTrimRange, thumbBlob: Blob, thumbUrl: string) => void
  onClose: () => void
}>) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fieldId = useId()

  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [frames, setFrames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  // The parent builds `initialTrim` inline, so key the load on its values:
  // an unrelated re-render must not reset the handles.
  const initialStart = initialTrim?.startSeconds
  const initialEnd = initialTrim?.endSeconds

  useEffect(() => {
    // Created and revoked here (not in render) so a re-run always gets a
    // live URL.
    const objectUrl = URL.createObjectURL(file)
    const preview = videoRef.current
    if (preview) preview.src = objectUrl

    const probe = document.createElement("video")
    probe.preload = "metadata"
    probe.muted = true
    probe.playsInline = true
    probe.src = objectUrl

    let cancelled = false

    void (async () => {
      try {
        await waitForEvent(probe, "loadedmetadata")
        const total = Number.isFinite(probe.duration) ? probe.duration : 0
        if (cancelled || total <= 0) return

        const start = initialStart ?? 0
        const end = initialEnd ?? total
        const clampedStart = Math.max(0, Math.min(start, total))
        setDuration(total)
        setTrimStart(clampedStart)
        setTrimEnd(Math.max(start + MIN_TRIM_SECONDS, Math.min(end, total)))
        setCurrentTime(clampedStart)
        if (preview && clampedStart > 0) preview.currentTime = clampedStart

        const thumbnails: string[] = []
        for (let index = 0; index < FRAME_COUNT; index += 1) {
          const time = (total * index) / Math.max(FRAME_COUNT - 1, 1)
          probe.currentTime = time
          await waitForEvent(probe, "seeked")
          if (cancelled) return
          thumbnails.push(captureFrame(probe))
        }
        if (!cancelled) setFrames(thumbnails)
      } catch {
        if (!cancelled) setLoadFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      probe.removeAttribute("src")
      probe.load()
      if (preview) {
        preview.pause()
        preview.removeAttribute("src")
        preview.load()
      }
      URL.revokeObjectURL(objectUrl)
    }
  }, [file, initialStart, initialEnd])

  const trimDuration = Math.max(MIN_TRIM_SECONDS, trimEnd - trimStart)
  const hasTimeline = duration > 0

  /** Show `seconds` in the preview and move the playhead there. */
  function seekPreview(seconds: number) {
    setCurrentTime(seconds)
    if (videoRef.current) videoRef.current.currentTime = seconds
  }

  function pausePlayback() {
    videoRef.current?.pause()
    setPlaying(false)
  }

  function moveTarget(target: TrimTarget, seconds: number) {
    if (target === "start") {
      const next = Math.max(0, Math.min(seconds, trimEnd - MIN_TRIM_SECONDS))
      setTrimStart(next)
      seekPreview(next)
    } else if (target === "end") {
      const next = Math.min(
        duration,
        Math.max(seconds, trimStart + MIN_TRIM_SECONDS)
      )
      setTrimEnd(next)
      seekPreview(next)
    } else {
      seekPreview(Math.max(trimStart, Math.min(seconds, trimEnd)))
    }
  }

  function onTimeUpdate() {
    const element = videoRef.current
    if (!element) return
    setCurrentTime(element.currentTime)
    // Loop guard for playback only: a paused seek (scrubbing, handle preview)
    // must be able to rest on the last frame of the range.
    if (!element.paused && element.currentTime >= trimEnd - 0.05) {
      element.pause()
      setPlaying(false)
      element.currentTime = trimStart
    }
  }

  async function togglePlayback() {
    const video = videoRef.current
    if (!video) return

    if (playing) {
      video.pause()
      setPlaying(false)
      return
    }

    if (video.currentTime < trimStart || video.currentTime >= trimEnd - 0.05) {
      video.currentTime = trimStart
    }
    try {
      await video.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  function resetTrim() {
    pausePlayback()
    setTrimStart(0)
    setTrimEnd(duration)
    seekPreview(0)
  }

  async function handleApply() {
    const video = videoRef.current
    if (!video) return

    setApplying(true)
    setApplyError(null)
    try {
      video.pause()
      setPlaying(false)
      video.currentTime = trimStart + trimDuration * 0.12
      await waitForEvent(video, "seeked")
      const blob = await canvasToJpeg(captureFrameElement(video))
      const thumbUrl = URL.createObjectURL(blob)
      onApply(
        {
          startSeconds: trimStart,
          endSeconds: trimEnd,
        },
        blob,
        thumbUrl
      )
      onClose()
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Could not create thumbnail."
      )
      setApplying(false)
    }
  }

  const isFullClip =
    trimStart <= 0.001 && hasTimeline && trimEnd >= duration - 0.001

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {loadFailed ? (
          <Notice title="This video could not be read">
            The browser could not decode the file, so the timeline is empty.
            Close the editor and stage the video again, or convert it to MP4.
          </Notice>
        ) : !loading && !hasTimeline ? (
          <Notice tone="warning" title="No readable length">
            The file does not report a duration, so the range cannot be changed
            here.
          </Notice>
        ) : null}
        {applyError ? (
          <Notice title="Could not apply the trim">{applyError}</Notice>
        ) : null}

        <div className="overflow-hidden rounded-[10px] border border-border bg-black">
          <video
            ref={videoRef}
            aria-label="Video preview"
            className="mx-auto block aspect-video max-h-[44svh] w-full object-contain"
            playsInline
            muted
            onTimeUpdate={onTimeUpdate}
            onPause={() => setPlaying(false)}
            onLoadedMetadata={(event) => {
              const video = event.currentTarget
              if (!duration && Number.isFinite(video.duration)) {
                setDuration(video.duration)
                setTrimEnd(video.duration)
              }
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void togglePlayback()}
            disabled={loading}
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            {playing ? "Pause" : "Play selection"}
          </Button>
          <p className="text-[13px] text-muted-foreground tabular-nums">
            <span className="sr-only">Playhead at </span>
            <span className="font-medium text-foreground">
              {formatTimecode(currentTime)}
            </span>{" "}
            / {formatTimecode(duration)}
          </p>
          <p className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <span>nudge a focused handle 0.1s,</span>
            <Kbd>Shift</Kbd>
            <span>for 1s</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex min-h-7 items-center justify-between gap-3">
            <p className="text-soft text-xs font-medium">Timeline</p>
            <Button
              size="xs"
              variant="ghost"
              onClick={resetTrim}
              disabled={loading || !hasTimeline || isFullClip}
            >
              <RotateCcw aria-hidden />
              Use full clip
            </Button>
          </div>

          <TrimTimeline
            duration={duration}
            trimStart={trimStart}
            trimEnd={trimEnd}
            currentTime={currentTime}
            frames={frames}
            loading={loading}
            onMove={moveTarget}
            onHandleGrab={pausePlayback}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Field label="Start (seconds)" htmlFor={`${fieldId}-start`}>
            <SecondsInput
              id={`${fieldId}-start`}
              value={trimStart}
              disabled={loading || !hasTimeline}
              onCommit={(seconds) => {
                pausePlayback()
                moveTarget("start", seconds)
              }}
            />
          </Field>
          <Field label="End (seconds)" htmlFor={`${fieldId}-end`}>
            <SecondsInput
              id={`${fieldId}-end`}
              value={trimEnd}
              disabled={loading || !hasTimeline}
              onCommit={(seconds) => {
                pausePlayback()
                moveTarget("end", seconds)
              }}
            />
          </Field>
          <Readout label="Selection" value={formatTimecode(trimDuration)} />
          <Readout label="Full clip" value={formatTimecode(duration)} />
        </div>
      </div>

      <DialogFooter className="shrink-0 flex-col items-stretch gap-x-4 gap-y-3 border-t border-border px-5 py-3 sm:items-center sm:justify-between">
        <p className="text-xs text-pretty text-muted-foreground">
          Applying saves this range as the wallpaper&apos;s duration and retakes
          its thumbnail. The file itself is uploaded in full.
        </p>
        <div className="flex w-full shrink-0 flex-col-reverse gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading || applying}
            onClick={() => void handleApply()}
          >
            {applying ? (
              <Spinner className="text-current" />
            ) : (
              <Scissors aria-hidden />
            )}
            Apply trim
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
