"use client"

import { Loader2, Pause, Play, Scissors } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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
        className="flex max-h-[92vh] w-[min(96vw,1120px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="size-4" />
            {title ? `Edit ${title}` : "Video editor"}
          </DialogTitle>
          <DialogDescription>
            Preview the clip, set trim markers, and refresh the thumbnail from
            the trimmed range.
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
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No video selected
          </div>
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
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file])
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [frames, setFrames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [dragging, setDragging] = useState<"start" | "end" | "playhead" | null>(
    null
  )

  useEffect(() => () => URL.revokeObjectURL(objectUrl), [objectUrl])

  useEffect(() => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    video.playsInline = true
    video.src = objectUrl

    let cancelled = false

    void (async () => {
      try {
        await waitForEvent(video, "loadedmetadata")
        const total = Number.isFinite(video.duration) ? video.duration : 0
        if (cancelled || total <= 0) return

        const start = initialTrim?.startSeconds ?? 0
        const end = initialTrim?.endSeconds ?? total
        setDuration(total)
        setTrimStart(Math.max(0, Math.min(start, total)))
        setTrimEnd(Math.max(start + 0.1, Math.min(end, total)))
        setCurrentTime(Math.max(0, Math.min(start, total)))

        const thumbnails: string[] = []
        for (let index = 0; index < FRAME_COUNT; index += 1) {
          const time = (total * index) / Math.max(FRAME_COUNT - 1, 1)
          video.currentTime = time
          await waitForEvent(video, "seeked")
          thumbnails.push(captureFrame(video))
        }
        if (!cancelled) setFrames(thumbnails)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      video.removeAttribute("src")
      video.load()
    }
  }, [objectUrl, initialTrim])

  const trimDuration = Math.max(0.1, trimEnd - trimStart)

  const positionPercent = useCallback(
    (seconds: number) => {
      if (duration <= 0) return 0
      return Math.min(100, Math.max(0, (seconds / duration) * 100))
    },
    [duration]
  )

  const secondsFromClientX = useCallback(
    (clientX: number, rect: DOMRect) => {
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return ratio * duration
    },
    [duration]
  )

  useEffect(() => {
    if (!dragging || duration <= 0) return

    function onMove(event: PointerEvent) {
      const track = document.getElementById("video-editor-track")
      if (!track) return
      const rect = track.getBoundingClientRect()
      const seconds = secondsFromClientX(event.clientX, rect)

      if (dragging === "start") {
        setTrimStart(Math.max(0, Math.min(seconds, trimEnd - 0.1)))
      } else if (dragging === "end") {
        setTrimEnd(Math.min(duration, Math.max(seconds, trimStart + 0.1)))
      } else if (dragging === "playhead") {
        const next = Math.max(trimStart, Math.min(seconds, trimEnd))
        setCurrentTime(next)
        if (videoRef.current) videoRef.current.currentTime = next
      }
    }

    function onUp() {
      setDragging(null)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [dragging, duration, secondsFromClientX, trimEnd, trimStart])

  useEffect(() => {
    const element = videoRef.current
    if (!element) return

    function onTimeUpdate() {
      if (!element) return
      setCurrentTime(element.currentTime)
      if (element.currentTime >= trimEnd - 0.05) {
        element.pause()
        setPlaying(false)
        element.currentTime = trimStart
      }
    }

    element.addEventListener("timeupdate", onTimeUpdate)
    return () => element.removeEventListener("timeupdate", onTimeUpdate)
  }, [trimEnd, trimStart, objectUrl])

  const formatted = useMemo(
    () => ({
      current: formatTime(currentTime),
      start: formatTime(trimStart),
      end: formatTime(trimEnd),
      duration: formatTime(trimDuration),
    }),
    [currentTime, trimDuration, trimEnd, trimStart]
  )

  async function togglePlayback() {
    const video = videoRef.current
    if (!video) return

    if (playing) {
      video.pause()
      setPlaying(false)
      return
    }

    if (video.currentTime < trimStart || video.currentTime >= trimEnd) {
      video.currentTime = trimStart
    }
    await video.play()
    setPlaying(true)
  }

  async function handleApply() {
    const video = videoRef.current
    if (!video) return

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
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
        <div className="overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            src={objectUrl}
            className="aspect-video w-full bg-black"
            playsInline
            muted
            onLoadedMetadata={(event) => {
              const video = event.currentTarget
              if (!duration && Number.isFinite(video.duration)) {
                setDuration(video.duration)
                setTrimEnd(video.duration)
              }
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void togglePlayback()}
            disabled={loading}
          >
            {playing ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {playing ? "Pause" : "Play trim"}
          </Button>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {formatted.current} · trim {formatted.start}–{formatted.end} (
            {formatted.duration})
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-[12px] font-medium text-muted-foreground">
            Timeline
          </p>
          <div
            id="video-editor-track"
            className="relative h-16 overflow-hidden rounded-xl bg-muted"
          >
            <div className="absolute inset-0 flex">
              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                frames.map((frame, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${frame.slice(0, 24)}-${index}`}
                    src={frame}
                    alt=""
                    className="h-full flex-1 object-cover"
                  />
                ))
              )}
            </div>

            <div
              className="absolute inset-y-0 rounded-xl bg-black/45"
              style={{
                left: `${positionPercent(trimStart)}%`,
                right: `${100 - positionPercent(trimEnd)}%`,
              }}
            />

            <button
              type="button"
              aria-label="Trim start"
              className="absolute top-0 bottom-0 z-10 w-3 -translate-x-1/2 cursor-ew-resize rounded-full bg-[var(--admin-blue)]"
              style={{ left: `${positionPercent(trimStart)}%` }}
              onPointerDown={() => setDragging("start")}
            />
            <button
              type="button"
              aria-label="Trim end"
              className="absolute top-0 bottom-0 z-10 w-3 -translate-x-1/2 cursor-ew-resize rounded-full bg-[var(--admin-blue)]"
              style={{ left: `${positionPercent(trimEnd)}%` }}
              onPointerDown={() => setDragging("end")}
            />
            <button
              type="button"
              aria-label="Playhead"
              className={cn(
                "absolute top-1 bottom-1 z-20 w-0.5 -translate-x-1/2 cursor-grab bg-white",
                dragging === "playhead" && "cursor-grabbing"
              )}
              style={{ left: `${positionPercent(currentTime)}%` }}
              onPointerDown={() => setDragging("playhead")}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="border-t border-border px-6 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} onClick={() => void handleApply()}>
          <Scissors className="size-3.5" />
          Apply trim
        </Button>
      </DialogFooter>
    </>
  )
}

function waitForEvent(
  element: HTMLMediaElement,
  eventName: keyof HTMLMediaElementEventMap
) {
  return new Promise<void>((resolve, reject) => {
    function cleanup() {
      element.removeEventListener(eventName, onSuccess)
      element.removeEventListener("error", onError)
    }
    function onSuccess() {
      cleanup()
      resolve()
    }
    function onError() {
      cleanup()
      reject(new Error("Could not read video frame."))
    }
    element.addEventListener(eventName, onSuccess, { once: true })
    element.addEventListener("error", onError, { once: true })
  })
}

function captureFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(video.videoWidth / 4))
  canvas.height = Math.max(1, Math.round(video.videoHeight / 4))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas unavailable.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg", 0.72)
}

function captureFrameElement(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas")
  const scale = Math.min(1, 1280 / Math.max(video.videoWidth, 1))
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas unavailable.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not create thumbnail."))
        else resolve(blob)
      },
      "image/jpeg",
      0.86
    )
  })
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
