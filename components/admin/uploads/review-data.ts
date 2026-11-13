"use client"

/**
 * Data for the review queue: the filtered list, the selection, the moderation
 * log of the open submission and the four review actions.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  describeApiError,
  type DecisionResult,
  type ModerationEvent,
  type ReviewAction,
  type UploadFilter,
  type UploadItem,
} from "./review-types"

async function readJson<T>(res: Response): Promise<T & { error?: string }> {
  try {
    return (await res.json()) as T & { error?: string }
  } catch {
    return {} as T & { error?: string }
  }
}

function errorMessage(error: unknown, fallback: string) {
  // fetch rejects with a TypeError when the request never reached the server.
  if (error instanceof TypeError) {
    return "Couldn't reach the server. Check your connection and try again."
  }
  return error instanceof Error && error.message ? error.message : fallback
}

async function fetchUploads(filter: UploadFilter): Promise<UploadItem[]> {
  const res = await fetch(`/api/admin/uploads?status=${filter}`, {
    cache: "no-store",
    credentials: "same-origin",
  })
  const json = await readJson<{ uploads?: UploadItem[] }>(res)
  if (!res.ok) {
    throw new Error(
      describeApiError(json.error, "The queue couldn't be loaded.")
    )
  }
  return json.uploads ?? []
}

type QueueResult =
  | { ok: true; rows: UploadItem[]; pending: number | null }
  | { ok: false; message: string }

/** One filter's rows plus how many uploads are pending. Never rejects. */
async function fetchQueue(target: UploadFilter): Promise<QueueResult> {
  try {
    const [rows, pending] = await Promise.all([
      fetchUploads(target),
      // The tab always shows what is waiting, whichever filter is open.
      target === "pending"
        ? null
        : fetchUploads("pending")
            .then((pendingRows) => pendingRows.length)
            .catch(() => null),
    ])
    return {
      ok: true,
      rows,
      pending: pending ?? (target === "pending" ? rows.length : null),
    }
  } catch (error) {
    return {
      ok: false,
      message: errorMessage(error, "The queue couldn't be loaded."),
    }
  }
}

/** Pending submissions after the current one, wrapping round to the start. */
function nextInQueue(rows: readonly UploadItem[], currentId: string) {
  const index = rows.findIndex((row) => row.id === currentId)
  if (index < 0) return []
  return [...rows.slice(index + 1), ...rows.slice(0, index)]
    .filter((row) => row.status === "pending")
    .map((row) => row.id)
}

function pickSelection(
  rows: readonly UploadItem[],
  current: string | null,
  preferred: readonly string[]
) {
  for (const id of preferred) {
    if (rows.some((row) => row.id === id && row.status === "pending")) return id
  }
  if (current && rows.some((row) => row.id === current)) return current
  return rows[0]?.id ?? null
}

const ACTION_FAILURE: Record<ReviewAction, string> = {
  approve: "The upload couldn't be approved. Try again.",
  reject: "The upload couldn't be rejected. Try again.",
  "request-info": "The request couldn't be sent. Try again.",
  block: "The uploader couldn't be blocked. Try again.",
}

function successMessage(action: ReviewAction, title: string) {
  switch (action) {
    case "approve":
      return `Approved “${title}” and published it to the catalog.`
    case "reject":
      return `Rejected “${title}”.`
    case "request-info":
      return `Asked the uploader of “${title}” for more information.`
    case "block":
      return "Blocked the uploader and rejected their pending uploads."
  }
}

export type ReviewQueueState = ReturnType<typeof useReviewQueue>

export function useReviewQueue() {
  const [filter, setFilterState] = useState<UploadFilter>("pending")
  const [list, setList] = useState<{
    filter: UploadFilter
    rows: UploadItem[]
  } | null>(null)
  const [listError, setListError] = useState<{
    filter: UploadFilter
    message: string
  } | null>(null)
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [acting, setActing] = useState<ReviewAction | null>(null)

  // Reloads started from handlers read the filter of the moment they run.
  const filterRef = useRef<UploadFilter>("pending")
  const requestSeq = useRef(0)

  const apply = useCallback(
    (
      target: UploadFilter,
      seq: number,
      result: QueueResult,
      preferred: readonly string[]
    ) => {
      // A newer request (another filter, a refresh) owns the list now.
      if (seq !== requestSeq.current) return
      if (!result.ok) {
        setListError({ filter: target, message: result.message })
        return
      }
      const { rows, pending } = result
      setList({ filter: target, rows })
      setListError(null)
      if (pending !== null) setPendingCount(pending)
      setSelectedId((current) => pickSelection(rows, current, preferred))
    },
    []
  )

  /** Reload from a handler; resolves once the list is on screen. */
  const load = useCallback(
    async (target: UploadFilter, preferred: readonly string[] = []) => {
      requestSeq.current += 1
      const seq = requestSeq.current
      apply(target, seq, await fetchQueue(target), preferred)
    },
    [apply]
  )

  useEffect(() => {
    requestSeq.current += 1
    const seq = requestSeq.current
    void fetchQueue(filter).then((result) => apply(filter, seq, result, []))
  }, [filter, apply])

  const setFilter = useCallback((next: UploadFilter) => {
    filterRef.current = next
    setFilterState(next)
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await load(filterRef.current)
    setRefreshing(false)
  }, [load])

  // Rows of another filter are never shown under the current one.
  const rows = list?.filter === filter ? list.rows : null
  const error = listError?.filter === filter ? listError.message : null
  const selected = rows?.find((row) => row.id === selectedId) ?? null

  const decide = useCallback(
    async (
      upload: UploadItem,
      action: ReviewAction,
      note: string
    ): Promise<DecisionResult> => {
      const text = note.trim()
      setActing(action)
      try {
        const res = await fetch(`/api/admin/uploads/${upload.id}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(
            action === "request-info"
              ? { message: text }
              : action === "block"
                ? { reason: text }
                : { reviewNotes: text }
          ),
        })
        const json = await readJson<object>(res)
        if (!res.ok) {
          throw new Error(describeApiError(json.error, ACTION_FAILURE[action]))
        }
      } catch (error) {
        setActing(null)
        return {
          ok: false,
          message: errorMessage(error, ACTION_FAILURE[action]),
        }
      }
      toast.success(successMessage(action, upload.title))
      // Move on to the next submission that still needs a decision.
      await load(filterRef.current, nextInQueue(rows ?? [], upload.id))
      setActing(null)
      return { ok: true }
    },
    [load, rows]
  )

  return {
    filter,
    setFilter,
    /** `null` until the current filter has loaded once. */
    rows,
    error,
    refreshing,
    refresh,
    pendingCount,
    selected,
    selectedId: selected?.id ?? null,
    select: setSelectedId,
    acting,
    decide,
    /** Changes on every reload, so dependants can refetch with it. */
    revision: list,
  }
}

export type ModerationLogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; events: ModerationEvent[] }

/** The moderation log of one upload, refetched whenever the queue reloads. */
export function useModerationEvents(
  uploadId: string | null,
  revision: unknown
) {
  const [log, setLog] = useState<{
    uploadId: string
    events: ModerationEvent[] | null
  } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!uploadId) return
    let cancelled = false
    void fetch(`/api/admin/uploads/${uploadId}/events`, {
      credentials: "same-origin",
    })
      .then((res) =>
        res.ok
          ? (res.json() as Promise<{ events?: ModerationEvent[] }>)
          : Promise.reject(new Error("events_failed"))
      )
      .then((json) => {
        if (!cancelled) setLog({ uploadId, events: json.events ?? [] })
      })
      .catch(() => {
        if (cancelled) return
        // Keep a log that is already on screen; only a first load can fail.
        setLog((current) =>
          current?.uploadId === uploadId && current.events
            ? current
            : { uploadId, events: null }
        )
      })
    return () => {
      cancelled = true
    }
  }, [uploadId, revision, attempt])

  const retry = useCallback(() => {
    setLog(null)
    setAttempt((value) => value + 1)
  }, [])

  // A log is only shown for the upload it belongs to, so no reset is needed.
  const state: ModerationLogState =
    !uploadId || log?.uploadId !== uploadId
      ? { status: "loading" }
      : log.events
        ? { status: "ready", events: log.events }
        : { status: "error" }

  return { state, retry }
}
