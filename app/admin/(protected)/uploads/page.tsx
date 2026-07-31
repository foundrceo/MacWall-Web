"use client"

/**
 * Uploads — community submission review plus the bulk catalog uploader.
 * The review queue lives inline here; the uploader keeps its own file because
 * it is a self-contained pipeline (chunking, thumbnails, retries).
 */

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Check,
  CircleCheck,
  CircleX,
  Clock,
  ExternalLink,
  FileVideo,
  RefreshCw,
  TriangleAlert,
  X,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  AdminBadge,
  AdminInfoGrid,
  PanelHeader,
  type Tone,
} from "@/components/admin/admin-ui"
import { CatalogBulkUploadPanel } from "@/components/admin/catalog-bulk-upload-panel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatBytes, formatDuration } from "@/lib/admin/format"
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
  media: { videoUrl: string; thumbUrl: string; expiresAt: string }
}

const STATUS_FILTERS: Array<{ id: UploadStatus; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
]

const STATUS_META: Record<
  UploadItem["status"],
  { label: string; tone: Tone; icon: typeof Clock }
> = {
  pending: { label: "Pending", tone: "amber", icon: Clock },
  approved: { label: "Approved", tone: "green", icon: CircleCheck },
  rejected: { label: "Rejected", tone: "red", icon: CircleX },
}

export default function AdminUploadsPage() {
  const [tab, setTab] = useState("review")
  const [filter, setFilter] = useState<UploadStatus>("pending")
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const loadedOnce = useRef(false)

  const load = useCallback(async (status: UploadStatus) => {
    if (loadedOnce.current) setRefreshing(true)
    else setLoading(true)
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
      setSelectedId((current) =>
        current && rows.some((row) => row.id === current)
          ? current
          : (rows[0]?.id ?? null)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load uploads")
      setUploads([])
      setSelectedId(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
      loadedOnce.current = true
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load(filter)
    })
  }, [filter, load])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false

    async function loadMedia() {
      setMediaError(null)
      setVideoUrl(null)
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

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const selected = uploads.find((upload) => upload.id === selectedId) ?? null

  async function review(action: "approve" | "reject") {
    if (!selected) return
    setActing(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/uploads/${selected.id}/${action}`, {
        method: "POST",
        ...(action === "reject"
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reviewNotes: rejectNotes }),
            }
          : {}),
        credentials: "same-origin",
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? `${action} failed`)
      setMessage(
        action === "approve"
          ? `Approved “${selected.title}” and published it to the catalog.`
          : `Rejected “${selected.title}”.`
      )
      setRejectNotes("")
      await load(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`)
    } finally {
      setActing(false)
    }
  }

  return (
    <AdminShell
      title="Uploads"
      actions={
        tab === "review" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load(filter)}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("size-3.5", refreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        ) : null
      }
    >
      <Tabs value={tab} onValueChange={setTab} className="gap-5">
        <TabsList className="h-9">
          <TabsTrigger value="review" className="px-4 text-[13px]">
            Review queue
          </TabsTrigger>
          <TabsTrigger value="bulk" className="px-4 text-[13px]">
            Bulk upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-red-soft)] px-4 py-2.5 text-[13px] text-[var(--admin-red)]">
              <TriangleAlert className="size-4 shrink-0" />
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-green-soft)] px-4 py-2.5 text-[13px] text-[var(--admin-green)]">
              {message}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            {/* Queue */}
            <Card
              className={cn(
                "gap-0 py-0 transition-opacity",
                refreshing && "opacity-60"
              )}
            >
              <div className="flex min-h-16 items-center border-b border-[var(--admin-border)] px-4 py-3">
                <Tabs
                  className="w-full"
                  value={filter}
                  onValueChange={(value) => setFilter(value as UploadStatus)}
                >
                  <TabsList className="h-9 w-full justify-between gap-0.5">
                    {STATUS_FILTERS.map((item) => (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        className="h-7 flex-1 px-1.5 text-xs"
                      >
                        {item.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="admin-scroll max-h-[min(70vh,36rem)] overflow-y-auto p-2">
                {loading ? (
                  <div className="space-y-2 p-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : uploads.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                    <FileVideo className="size-6 text-[var(--admin-border-strong)]" />
                    <p className="text-[13px] text-[var(--admin-muted)]">
                      No uploads in this filter.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {uploads.map((upload) => {
                      const meta = STATUS_META[upload.status]
                      const active = selectedId === upload.id
                      return (
                        <li key={upload.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(upload.id)}
                            className={cn(
                              "w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/30",
                              active
                                ? "bg-[var(--admin-blue-soft)]"
                                : "hover:bg-[var(--admin-fill)]"
                            )}
                          >
                            <p className="truncate text-[13px] font-medium text-[var(--admin-fg)]">
                              {upload.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="truncate text-xs text-[var(--admin-muted)]">
                                {upload.category}
                              </span>
                              <AdminBadge tone={meta.tone} className="ml-auto">
                                <meta.icon className="size-3" />
                                {meta.label}
                              </AdminBadge>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </Card>

            {/* Preview + review */}
            <Card className="gap-0 py-0">
              <PanelHeader
                title="Preview & review"
                description={
                  selected
                    ? selected.title
                    : "Pick a submission from the queue to review it."
                }
                action={
                  selected ? (
                    <AdminBadge tone={STATUS_META[selected.status].tone}>
                      {STATUS_META[selected.status].label}
                    </AdminBadge>
                  ) : null
                }
              />

              {!selected ? (
                <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
                  <FileVideo className="size-7 text-[var(--admin-border-strong)]" />
                  <p className="text-[13px] text-[var(--admin-muted)]">
                    Nothing selected.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-5">
                  {videoUrl ? (
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      poster={thumbUrl ?? undefined}
                      controls
                      playsInline
                      className="aspect-video w-full rounded-lg bg-black object-contain"
                    />
                  ) : (
                    <Skeleton className="aspect-video w-full rounded-lg" />
                  )}

                  {mediaError ? (
                    <p className="flex items-center gap-1.5 text-xs text-[var(--admin-red)]">
                      <TriangleAlert className="size-3.5" />
                      {mediaError}
                    </p>
                  ) : null}

                  <AdminInfoGrid
                    columns={3}
                    items={[
                      { label: "Category", value: selected.category },
                      { label: "Resolution", value: selected.resolution },
                      {
                        label: "Duration",
                        value: formatDuration(selected.durationSeconds),
                      },
                      {
                        label: "File size",
                        value: formatBytes(selected.fileSizeBytes),
                      },
                      {
                        label: "Submitted",
                        value: new Date(selected.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" }
                        ),
                      },
                      {
                        label: "Status",
                        value: STATUS_META[selected.status].label,
                      },
                    ]}
                  />

                  {selected.reviewNotes ? (
                    <div className="rounded-lg bg-[var(--admin-amber-soft)] px-3.5 py-2.5 text-[13px] text-[var(--admin-amber)]">
                      <span className="font-medium">Review notes:</span>{" "}
                      {selected.reviewNotes}
                    </div>
                  ) : null}

                  {selected.approvedWallpaperId ? (
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--admin-green-soft)] px-3.5 py-2.5 text-[13px] text-[var(--admin-green)]">
                      <CircleCheck className="size-4 shrink-0" />
                      Published to the catalog as{" "}
                      <Link
                        href={`/admin/wallpapers?q=${encodeURIComponent(selected.approvedWallpaperId)}`}
                        className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
                      >
                        {selected.approvedWallpaperId}
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  ) : null}

                  {selected.status === "pending" ? (
                    <div className="space-y-3 border-t border-[var(--admin-border)] pt-4">
                      <Textarea
                        value={rejectNotes}
                        onChange={(event) => setRejectNotes(event.target.value)}
                        placeholder="Optional note sent to the submitter when rejecting…"
                        className="min-h-20 resize-y"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => void review("approve")}
                          disabled={acting}
                        >
                          <Check className="size-4" />
                          Approve & publish
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => void review("reject")}
                          disabled={acting}
                        >
                          <X className="size-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <CatalogBulkUploadPanel />
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}
