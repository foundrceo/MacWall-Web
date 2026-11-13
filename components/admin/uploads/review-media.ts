"use client"

/**
 * Signed preview URLs for community uploads. One small store shared by the
 * queue thumbnails and the detail preview, so each upload is signed once and
 * reused until the link is about to expire.
 */

import { useEffect, useSyncExternalStore } from "react"

export type UploadMedia =
  | { status: "loading" }
  | { status: "ready"; videoUrl: string; thumbUrl: string; expiresAt: number }
  | { status: "error"; message: string }

type MediaResponse = {
  media?: { videoUrl: string; thumbUrl: string; expiresAt: string }
  error?: string
}

/** Thumbnails load a few at a time so a long queue doesn't flood the API. */
const MAX_CONCURRENT = 4
const EXPIRY_MARGIN_MS = 60_000
const LOADING: UploadMedia = { status: "loading" }

const entries = new Map<string, UploadMedia>()
const listeners = new Set<() => void>()
const waiting: string[] = []
let active = 0

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setEntry(id: string, entry: UploadMedia) {
  entries.set(id, entry)
  listeners.forEach((listener) => listener())
}

async function fetchMedia(id: string): Promise<UploadMedia> {
  try {
    const res = await fetch(`/api/admin/uploads/${id}/media`, {
      cache: "no-store",
      credentials: "same-origin",
    })
    const json = (await res.json().catch(() => ({}))) as MediaResponse
    if (!res.ok || !json.media) {
      return {
        status: "error",
        message: json.error ?? "The preview couldn't be loaded.",
      }
    }
    const expiresAt = Date.parse(json.media.expiresAt)
    return {
      status: "ready",
      videoUrl: json.media.videoUrl,
      thumbUrl: json.media.thumbUrl,
      expiresAt: Number.isFinite(expiresAt)
        ? expiresAt
        : Date.now() + 3_600_000,
    }
  } catch {
    return {
      status: "error",
      message: "The preview couldn't be loaded. Check your connection.",
    }
  }
}

function pump() {
  while (active < MAX_CONCURRENT && waiting.length > 0) {
    const id = waiting.shift() as string
    active += 1
    void fetchMedia(id).then((entry) => {
      active -= 1
      setEntry(id, entry)
      pump()
    })
  }
}

/**
 * Ask for an upload's signed URLs. `priority` jumps the thumbnail queue (the
 * open submission); `retry` asks again after a failure or to replace a link
 * that stopped working.
 */
export function requestUploadMedia(
  id: string,
  options: { priority?: boolean; retry?: boolean; force?: boolean } = {}
) {
  const current = entries.get(id)
  if (current?.status === "loading") {
    const position = waiting.indexOf(id)
    if (options.priority && position > 0) {
      waiting.splice(position, 1)
      waiting.unshift(id)
    }
    return
  }
  if (!options.force) {
    if (
      current?.status === "ready" &&
      current.expiresAt - EXPIRY_MARGIN_MS > Date.now()
    ) {
      return
    }
    if (current?.status === "error" && !options.retry) return
  }
  setEntry(id, LOADING)
  if (options.priority) waiting.unshift(id)
  else waiting.push(id)
  pump()
}

export function useUploadMedia(
  id: string | null,
  options: { enabled?: boolean; priority?: boolean } = {}
): UploadMedia | undefined {
  const { enabled = true, priority = false } = options
  const entry = useSyncExternalStore(
    subscribe,
    () => (id ? entries.get(id) : undefined),
    () => undefined
  )

  useEffect(() => {
    if (id && enabled) requestUploadMedia(id, { priority, retry: priority })
  }, [id, enabled, priority])

  return entry
}
