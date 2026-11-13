"use client"

/**
 * Timeline of the video trim editor: a filmstrip with a start handle, an end
 * handle and a playhead. All three are sliders (arrow keys, Shift for bigger
 * steps, Page Up/Down, Home/End) and can be dragged; clicking the strip moves
 * the playhead. The parent owns the values and clamps them in `onMove`.
 */

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { Skeleton } from "@/components/admin/ui"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import {
  formatTimecode,
  MIN_TRIM_SECONDS,
  roundTenth,
  type TrimTarget,
} from "./video-editor-frames"

const NUDGE_SECONDS = 0.1
const NUDGE_SECONDS_SHIFT = 1
const NUDGE_SECONDS_PAGE = 5

export function TrimTimeline({
  duration,
  trimStart,
  trimEnd,
  currentTime,
  frames,
  loading,
  onMove,
  onHandleGrab,
}: Readonly<{
  duration: number
  trimStart: number
  trimEnd: number
  currentTime: number
  /** Filmstrip frames as data URLs, evenly spaced over the clip. */
  frames: readonly string[]
  loading: boolean
  /** Asks to move a target to `seconds`; the parent clamps and applies. */
  onMove: (target: TrimTarget, seconds: number) => void
  /** A trim handle is about to move (pointer or keyboard). */
  onHandleGrab: () => void
}>) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  /** Pointer distance from the edge of the handle being dragged. */
  const dragOffsetRef = useRef(0)
  const dragTargetRef = useRef<TrimTarget | null>(null)
  const [dragging, setDragging] = useState<TrimTarget | null>(null)

  const hasTimeline = duration > 0

  function positionPercent(seconds: number) {
    if (duration <= 0) return 0
    return Math.min(100, Math.max(0, (seconds / duration) * 100))
  }

  function secondsFromClientX(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return 0
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return ratio * duration
  }

  function onTrackPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasTimeline || event.button !== 0) return
    const handle = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-trim-handle]"
    )
    const target: TrimTarget =
      handle?.dataset.trimHandle === "start"
        ? "start"
        : handle?.dataset.trimHandle === "end"
          ? "end"
          : "playhead"

    // Keep the grabbed point of a handle under the pointer; a click on the
    // strip itself jumps the playhead straight there.
    const pointerSeconds = secondsFromClientX(event.clientX)
    dragOffsetRef.current =
      target === "start"
        ? pointerSeconds - trimStart
        : target === "end"
          ? pointerSeconds - trimEnd
          : 0
    dragTargetRef.current = target
    setDragging(target)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (target === "playhead") {
      onMove("playhead", pointerSeconds)
    } else {
      onHandleGrab()
    }
  }

  function onTrackPointerMove(event: PointerEvent<HTMLDivElement>) {
    const target = dragTargetRef.current
    if (!target) return
    onMove(target, secondsFromClientX(event.clientX) - dragOffsetRef.current)
  }

  function endDrag() {
    dragTargetRef.current = null
    setDragging(null)
  }

  function onHandleKeyDown(
    target: TrimTarget,
    event: KeyboardEvent<HTMLDivElement>
  ) {
    const value =
      target === "start" ? trimStart : target === "end" ? trimEnd : currentTime
    const step = event.shiftKey ? NUDGE_SECONDS_SHIFT : NUDGE_SECONDS

    let next: number
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step
        break
      case "ArrowRight":
      case "ArrowUp":
        next = value + step
        break
      case "PageDown":
        next = value - NUDGE_SECONDS_PAGE
        break
      case "PageUp":
        next = value + NUDGE_SECONDS_PAGE
        break
      case "Home":
        next = 0
        break
      case "End":
        next = duration
        break
      default:
        return
    }

    event.preventDefault()
    if (target !== "playhead") onHandleGrab()
    onMove(target, next)
  }

  const startPercent = positionPercent(trimStart)
  const endPercent = positionPercent(trimEnd)

  return (
    <>
      {/* Side padding leaves room for the handles at 0% and 100%. */}
      <div className="px-3.5">
        <div
          ref={trackRef}
          className={cn(
            "relative h-16 touch-none select-none",
            hasTimeline &&
              (dragging === "playhead" ? "cursor-grabbing" : "cursor-pointer")
          )}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <div className="bg-fill absolute inset-0 flex overflow-hidden rounded-md">
            {loading ? (
              <Skeleton className="size-full rounded-none" />
            ) : (
              frames.map((frame, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={frame}
                  alt=""
                  draggable={false}
                  className="h-full min-w-0 flex-1 object-cover"
                />
              ))
            )}
          </div>

          {hasTimeline ? (
            <>
              {/* Everything outside the range is dimmed. */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-l-md bg-background/75"
                style={{ width: `${startPercent}%` }}
              />
              <div
                aria-hidden
                className="absolute inset-y-0 right-0 rounded-r-md bg-background/75"
                style={{ width: `${100 - endPercent}%` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 border-y-2 border-foreground"
                style={{
                  left: `${startPercent}%`,
                  right: `${100 - endPercent}%`,
                }}
              />

              <TrimHandle
                target="start"
                label="Trim start"
                percent={startPercent}
                value={trimStart}
                min={0}
                max={trimEnd - MIN_TRIM_SECONDS}
                active={dragging === "start"}
                onKeyDown={onHandleKeyDown}
              />
              <TrimHandle
                target="end"
                label="Trim end"
                percent={endPercent}
                value={trimEnd}
                min={trimStart + MIN_TRIM_SECONDS}
                max={duration}
                active={dragging === "end"}
                onKeyDown={onHandleKeyDown}
              />

              <div
                role="slider"
                tabIndex={0}
                aria-label="Playhead"
                aria-orientation="horizontal"
                aria-valuemin={roundTenth(trimStart)}
                aria-valuemax={roundTenth(trimEnd)}
                aria-valuenow={roundTenth(currentTime)}
                aria-valuetext={formatTimecode(currentTime)}
                onKeyDown={(event) => onHandleKeyDown("playhead", event)}
                className="group/playhead pointer-events-none absolute -inset-y-1.5 z-20 w-3 -translate-x-1/2 outline-none"
                style={{ left: `${positionPercent(currentTime)}%` }}
              >
                <span
                  aria-hidden
                  className="bg-blue absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full group-focus-visible/playhead:ring-2 group-focus-visible/playhead:ring-ring"
                />
                <span
                  aria-hidden
                  className="bg-blue absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

/** One end of the range: draggable, and a slider for the keyboard. */
function TrimHandle({
  target,
  label,
  percent,
  value,
  min,
  max,
  active,
  onKeyDown,
}: Readonly<{
  target: "start" | "end"
  label: string
  percent: number
  value: number
  min: number
  max: number
  active: boolean
  onKeyDown: (target: TrimTarget, event: KeyboardEvent<HTMLDivElement>) => void
}>) {
  return (
    <div
      role="slider"
      tabIndex={0}
      data-trim-handle={target}
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={roundTenth(min)}
      aria-valuemax={roundTenth(max)}
      aria-valuenow={roundTenth(value)}
      aria-valuetext={formatTimecode(value)}
      onKeyDown={(event) => onKeyDown(target, event)}
      className={cn(
        "absolute inset-y-0 z-10 flex w-3.5 cursor-ew-resize items-center justify-center bg-foreground transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
        // The inner edge of each handle marks the exact time.
        target === "start" ? "-translate-x-full rounded-l-md" : "rounded-r-md",
        active && "bg-blue"
      )}
      style={{ left: `${percent}%` }}
    >
      <span aria-hidden className="h-5 w-0.5 rounded-full bg-background/55" />
    </div>
  )
}

/**
 * Seconds as free text while typing; committed (and clamped by the caller) on
 * Enter or blur.
 */
export function SecondsInput({
  id,
  value,
  disabled,
  onCommit,
}: Readonly<{
  id: string
  value: number
  disabled?: boolean
  onCommit: (seconds: number) => void
}>) {
  const [text, setText] = useState<string | null>(null)

  function commit() {
    if (text === null) return
    const parsed = Number.parseFloat(text.replace(",", "."))
    setText(null)
    if (Number.isFinite(parsed)) onCommit(parsed)
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      disabled={disabled}
      value={text ?? value.toFixed(1)}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          commit()
        }
      }}
      className="tabular-nums"
    />
  )
}

export function Readout({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-soft text-xs font-medium">{label}</p>
      <p className="flex h-8 items-center text-[15px] font-semibold tracking-[-0.01em] text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}
