"use client"

/**
 * The moderation workspace: queue on the left, the open submission on the
 * right. Below `lg` only one of the two is on screen at a time.
 */

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { useModerationEvents, type ReviewQueueState } from "./review-data"
import { ReviewDetail } from "./review-detail"
import { ReviewQueue } from "./review-queue"

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.matches("input, textarea, select, [role='textbox']"))
  )
}

export function ReviewWorkspace({
  queue,
}: Readonly<{ queue: ReviewQueueState }>) {
  const { rows, selected, select } = queue
  // Phones show the queue first; opening a row swaps in the detail.
  const [detailOpen, setDetailOpen] = useState(false)
  const log = useModerationEvents(selected?.id ?? null, queue.revision)

  const index =
    selected && rows ? rows.findIndex((row) => row.id === selected.id) : -1

  const step = useCallback(
    (delta: 1 | -1) => {
      const next = rows?.[index + delta]
      if (index >= 0 && next) select(next.id)
    },
    [rows, index, select]
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (key !== "j" && key !== "k") return
      // Not while writing a note or with a dialog (or ⌘K) open.
      if (isTyping(event.target) || document.querySelector("[role='dialog']")) {
        return
      }
      event.preventDefault()
      step(key === "j" ? 1 : -1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [step])

  const showDetail = detailOpen && selected !== null

  return (
    <div className="flex min-h-0 flex-1">
      <ReviewQueue
        className={cn(showDetail ? "hidden lg:flex" : "flex")}
        filter={queue.filter}
        onFilterChange={queue.setFilter}
        rows={rows}
        error={queue.error}
        onRetry={() => void queue.refresh()}
        refreshing={queue.refreshing}
        selectedId={queue.selectedId}
        onSelect={(id) => {
          select(id)
          setDetailOpen(true)
        }}
      />
      <ReviewDetail
        className={cn(showDetail ? "flex" : "hidden lg:flex")}
        upload={selected}
        loading={rows === null && !queue.error}
        position={index >= 0 && rows ? { index, total: rows.length } : null}
        onStep={step}
        onBack={() => setDetailOpen(false)}
        log={log.state}
        onRetryLog={log.retry}
        acting={queue.acting}
        onDecide={queue.decide}
      />
    </div>
  )
}
