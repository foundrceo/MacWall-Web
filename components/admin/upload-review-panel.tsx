"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type UploadStatus = "pending" | "approved" | "rejected" | "all"

type UploadItem = {
  id: string
  title: string
  category: string
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  status: "pending" | "approved" | "rejected"
  reviewNotes: string | null
  approvedWallpaperId: string | null
  createdAt: string
}

type MediaResponse = {
  media: {
    videoUrl: string
    thumbUrl: string
    expiresAt: string
  }
}

const FILTERS: Array<{ id: UploadStatus; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
]

export function UploadReviewPanel() {
  const [filter, setFilter] = useState<UploadStatus>("pending")
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadUploads = useCallback(async (status: UploadStatus) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/uploads?status=${status}`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as {
        uploads?: UploadItem[]
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Failed to load uploads")
      const rows = json.uploads ?? []
      setUploads(rows)
      setSelectedId((current) => {
        if (current && rows.some((row) => row.id === current)) return current
        return rows[0]?.id ?? null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load uploads")
      setUploads([])
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadUploads(filter)
    })
  }, [filter, loadUploads])

  useEffect(() => {
    if (!selectedId) return

    let cancelled = false

    async function loadMedia() {
      try {
        const res = await fetch(`/api/admin/uploads/${selectedId}/media`, {
          cache: "no-store",
          credentials: "same-origin",
        })
        const json = (await res.json()) as MediaResponse & { error?: string }
        if (!res.ok) throw new Error(json.error ?? "Failed to load preview")
        if (!cancelled) {
          setVideoUrl(json.media.videoUrl)
          setThumbUrl(json.media.thumbUrl)
        }
      } catch (err) {
        if (!cancelled) {
          setVideoUrl(null)
          setThumbUrl(null)
          setError(
            err instanceof Error ? err.message : "Failed to load preview"
          )
        }
      }
    }

    void loadMedia()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const selected = uploads.find((upload) => upload.id === selectedId) ?? null

  async function approveSelected() {
    if (!selected) return
    setActionLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/uploads/${selected.id}/approve`, {
        method: "POST",
        credentials: "same-origin",
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Approve failed")
      setMessage(`Approved “${selected.title}” and published to catalog.`)
      await loadUploads(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function rejectSelected() {
    if (!selected) return
    setActionLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/uploads/${selected.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reviewNotes: rejectNotes }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Reject failed")
      setMessage(`Rejected “${selected.title}”.`)
      setRejectNotes("")
      await loadUploads(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void loadUploads(filter)}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/55">Loading uploads…</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="border-white/10 bg-white/[0.03] text-white">
          <CardHeader>
            <CardTitle className="text-base">Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uploads.length === 0 ? (
              <p className="text-sm text-white/50">
                No uploads in this filter.
              </p>
            ) : (
              uploads.map((upload) => (
                <button
                  key={upload.id}
                  type="button"
                  onClick={() => setSelectedId(upload.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                    selectedId === upload.id
                      ? "border-[#0071e3]/60 bg-[#0071e3]/10"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.04]"
                  )}
                >
                  <p className="truncate text-sm font-medium">{upload.title}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {upload.category} · {upload.status}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03] text-white">
          <CardHeader>
            <CardTitle className="text-base">Preview & review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected ? (
              <p className="text-sm text-white/50">
                Select an upload to preview.
              </p>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                  {videoUrl ? (
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      poster={thumbUrl ?? undefined}
                      controls
                      playsInline
                      className="aspect-video w-full bg-black"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center text-sm text-white/45">
                      Loading preview…
                    </div>
                  )}
                </div>

                <div className="grid gap-2 text-sm text-white/75 sm:grid-cols-2">
                  <p>
                    <span className="text-white/45">Title:</span>{" "}
                    {selected.title}
                  </p>
                  <p>
                    <span className="text-white/45">Category:</span>{" "}
                    {selected.category}
                  </p>
                  <p>
                    <span className="text-white/45">Resolution:</span>{" "}
                    {selected.resolution}
                  </p>
                  <p>
                    <span className="text-white/45">Duration:</span>{" "}
                    {formatDuration(selected.durationSeconds)}
                  </p>
                  <p>
                    <span className="text-white/45">Size:</span>{" "}
                    {formatBytes(selected.fileSizeBytes)}
                  </p>
                  <p>
                    <span className="text-white/45">Status:</span>{" "}
                    {selected.status}
                  </p>
                </div>

                {selected.reviewNotes ? (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {selected.reviewNotes}
                  </p>
                ) : null}

                {selected.status === "pending" ? (
                  <div className="space-y-3">
                    <textarea
                      value={rejectNotes}
                      onChange={(event) => setRejectNotes(event.target.value)}
                      placeholder="Optional rejection notes for the submitter"
                      className="min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white ring-[#0071e3]/40 outline-none focus:ring-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => void approveSelected()}
                        disabled={actionLoading}
                      >
                        Approve & publish
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => void rejectSelected()}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}
