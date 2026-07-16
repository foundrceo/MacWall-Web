"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  CheckIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  InboxIcon,
  MenuIcon,
  CursorPointer01Icon,
  ArrowReloadHorizontalIcon,
  Cancel01Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import {
  AdminBadge,
  AdminButton,
  AdminInfoGrid,
  AdminNotice,
  AdminPill,
  AdminRowListItem,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
  AdminTextarea,
  AdminToolbar,
} from "@/components/admin/admin-ui"

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

const FILTERS: Array<{
  id: UploadStatus
  label: string
  icon: IconSvgElement
}> = [
  { id: "pending", label: "Pending", icon: Clock01Icon },
  { id: "approved", label: "Approved", icon: CheckmarkCircle01Icon },
  { id: "rejected", label: "Rejected", icon: CancelCircleIcon },
  { id: "all", label: "All", icon: MenuIcon },
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
  const [mediaError, setMediaError] = useState<string | null>(null)
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
      setMediaError(null)
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
          setMediaError(
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
    <div className="space-y-5 sm:space-y-6">
      <AdminToolbar>
        {FILTERS.map((item) => (
          <AdminPill
            key={item.id}
            active={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            <HugeiconsIcon icon={item.icon} className="size-3.5" />
            {item.label}
          </AdminPill>
        ))}
        <AdminButton
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => void loadUploads(filter)}
        >
          <HugeiconsIcon
            icon={ArrowReloadHorizontalIcon}
            className="size-3.5"
          />
          Refresh
        </AdminButton>
      </AdminToolbar>

      {loading ? (
        <p className="text-[14px] text-[#86868b]">Loading uploads…</p>
      ) : null}
      {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

      <div className="grid gap-4 min-[1024px]:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] sm:gap-5">
        <AdminSurface className="min-h-0">
          <AdminSurfaceHeader
            title="Queue"
            description="Community submissions awaiting review"
          />
          <AdminSurfaceBody className="max-h-[min(70vh,560px)] space-y-2 overflow-y-auto sm:space-y-2.5">
            {uploads.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <HugeiconsIcon
                  icon={InboxIcon}
                  className="size-8 text-[#86868b]/60"
                />
                <p className="text-[14px] text-[#86868b]">
                  No uploads in this filter.
                </p>
              </div>
            ) : (
              uploads.map((upload) => (
                <AdminRowListItem
                  key={upload.id}
                  active={selectedId === upload.id}
                  title={upload.title}
                  onClick={() => setSelectedId(upload.id)}
                  meta={
                    <span className="text-[12px] text-[#86868b]">
                      {upload.category}
                    </span>
                  }
                  badge={<StatusBadge status={upload.status} />}
                />
              ))
            )}
          </AdminSurfaceBody>
        </AdminSurface>

        <AdminSurface>
          <AdminSurfaceHeader title="Preview & review" />
          <AdminSurfaceBody className="space-y-4 sm:space-y-5">
            {!selected ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center sm:py-14">
                <HugeiconsIcon
                  icon={CursorPointer01Icon}
                  className="size-8 text-[#86868b]/60"
                />
                <p className="text-[14px] text-[#86868b]">
                  Select an upload to preview.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-[20px] bg-[#f5f5f7]">
                  {videoUrl ? (
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      poster={thumbUrl ?? undefined}
                      controls
                      playsInline
                      className="aspect-video w-full bg-black/[0.03]"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center text-[14px] text-[#86868b]">
                      Loading preview…
                    </div>
                  )}
                </div>

                <AdminInfoGrid
                  items={[
                    { label: "Title", value: selected.title },
                    { label: "Category", value: selected.category },
                    { label: "Resolution", value: selected.resolution },
                    {
                      label: "Duration",
                      value: formatDuration(selected.durationSeconds),
                    },
                    {
                      label: "Size",
                      value: formatBytes(selected.fileSizeBytes),
                    },
                    { label: "Status", value: selected.status },
                  ]}
                />

                {selected.reviewNotes ? (
                  <AdminNotice tone="warning">
                    {selected.reviewNotes}
                  </AdminNotice>
                ) : null}

                {mediaError ? (
                  <AdminNotice tone="warning">{mediaError}</AdminNotice>
                ) : null}

                {selected.approvedWallpaperId ? (
                  <AdminNotice tone="success">
                    Published as{" "}
                    <Link
                      href={`/admin/wallpapers?q=${encodeURIComponent(selected.approvedWallpaperId)}`}
                      className="font-medium text-[#0071e3] underline-offset-2 hover:underline"
                    >
                      {selected.approvedWallpaperId}
                    </Link>
                  </AdminNotice>
                ) : null}

                {selected.status === "pending" ? (
                  <div className="space-y-3">
                    <AdminTextarea
                      value={rejectNotes}
                      onChange={(event) => setRejectNotes(event.target.value)}
                      placeholder="Optional rejection notes for the submitter"
                    />
                    <div className="flex flex-wrap gap-2">
                      <AdminButton
                        className="gap-1.5"
                        onClick={() => void approveSelected()}
                        disabled={actionLoading}
                      >
                        <HugeiconsIcon icon={CheckIcon} className="size-4" />
                        Approve & publish
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        className="gap-1.5"
                        onClick={() => void rejectSelected()}
                        disabled={actionLoading}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                        Reject
                      </AdminButton>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </AdminSurfaceBody>
        </AdminSurface>
      </div>
    </div>
  )
}

function StatusBadge({ status }: Readonly<{ status: UploadItem["status"] }>) {
  if (status === "approved")
    return (
      <AdminBadge tone="green">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" />
        Approved
      </AdminBadge>
    )
  if (status === "rejected")
    return (
      <AdminBadge tone="red">
        <HugeiconsIcon icon={CancelCircleIcon} className="size-3" />
        Rejected
      </AdminBadge>
    )
  return (
    <AdminBadge tone="amber">
      <HugeiconsIcon icon={Clock01Icon} className="size-3" />
      Pending
    </AdminBadge>
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
