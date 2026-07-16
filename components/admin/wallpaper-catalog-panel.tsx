"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ImageNotFoundIcon,
  CursorPointer01Icon,
  ArrowReloadHorizontalIcon,
  SaveIcon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { CatalogBulkUploadPanel } from "@/components/admin/catalog-bulk-upload-panel"
import {
  AdminBadge,
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminNotice,
  AdminSkeleton,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
} from "@/components/admin/admin-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { WALLPAPER_CATEGORIES } from "@/lib/admin/wallpapers"
import { cn } from "@/lib/utils"

type WallpaperItem = {
  id: string
  name: string
  category: string
  tags: string[]
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  thumbUrl: string
  videoUrl: string
  isPro: boolean
  isFeatured: boolean
  isCuratedPick: boolean
  likeCount: number
  createdAt: string
  updatedAt: string
}

type WallpaperSort =
  | "likes_desc"
  | "likes_asc"
  | "name_asc"
  | "name_desc"
  | "created_desc"
  | "created_asc"

type ListResponse = {
  wallpapers: WallpaperItem[]
  total: number
  page: number
  limit: number
  sort: WallpaperSort
  categoryCounts: Array<{ category: string; count: number }> | null
  error?: string
}

const SORT_OPTIONS: Array<{ id: WallpaperSort; label: string }> = [
  { id: "likes_desc", label: "Most liked" },
  { id: "created_desc", label: "Newest" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "name_desc", label: "Name Z–A" },
]

export function WallpaperCatalogPanel({
  initialQuery = "",
}: Readonly<{ initialQuery?: string }>) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim())
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState<WallpaperSort>("likes_desc")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ListResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const loadWallpapers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "40",
        sort,
        stats: "1",
      })
      if (debouncedQuery) params.set("q", debouncedQuery)
      if (category) params.set("category", category)

      const res = await fetch(`/api/admin/wallpapers?${params}`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as ListResponse
      if (!res.ok) throw new Error(json.error ?? "Failed to load wallpapers")
      setData(json)
      setSelectedId((current) => {
        if (current && json.wallpapers.some((item) => item.id === current)) {
          return current
        }
        return json.wallpapers[0]?.id ?? null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallpapers")
      setData(null)
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }, [page, sort, debouncedQuery, category])

  useEffect(() => {
    queueMicrotask(() => {
      void loadWallpapers()
    })
  }, [loadWallpapers])

  const selected = useMemo(
    () => data?.wallpapers.find((item) => item.id === selectedId) ?? null,
    [data, selectedId]
  )

  const totalPages = useMemo(() => {
    if (!data) return 1
    return Math.max(1, Math.ceil(data.total / data.limit))
  }, [data])

  async function saveWallpaper(
    wallpaperId: string,
    patch: {
      name: string
      category: string
      tags: string[]
      isFeatured: boolean
      isCuratedPick: boolean
      isPro: boolean
    }
  ) {
    setMessage(null)
    setError(null)
    const res = await fetch(`/api/admin/wallpapers/${wallpaperId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(patch),
    })
    const json = (await res.json()) as {
      wallpaper?: WallpaperItem
      error?: string
    }
    if (!res.ok) throw new Error(json.error ?? "Save failed")
    setMessage(`Updated “${patch.name}”.`)
    await loadWallpapers()
    if (json.wallpaper) setSelectedId(json.wallpaper.id)
  }

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <CatalogBulkUploadPanel onUploaded={loadWallpapers} />

      <AdminSurface>
        <AdminSurfaceHeader
          title="Catalog search"
          description={`Browse all ${data?.total ?? "…"} wallpapers. Search by name or ID, edit metadata, and review likes.`}
        />
        <AdminSurfaceBody className="space-y-4 sm:space-y-5">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#86868b]" />
              <AdminInput
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search wallpapers…"
                className="pl-11"
              />
            </div>
            <Select
              value={category || "all"}
              onValueChange={(value) => {
                setCategory(value === "all" ? "" : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full min-w-[160px] rounded-full h-11 lg:w-auto">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {WALLPAPER_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as WallpaperSort)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full min-w-[140px] rounded-full h-11 lg:w-auto">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AdminButton
              variant="ghost"
              size="md"
              className="gap-1.5 min-h-[44px]"
              onClick={() => void loadWallpapers()}
            >
              <HugeiconsIcon icon={ArrowReloadHorizontalIcon} className="size-3.5" />
              Refresh
            </AdminButton>
          </div>

          {data?.categoryCounts?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.categoryCounts.map((row) => (
                <button
                  key={row.category}
                  type="button"
                  onClick={() => {
                    setCategory((current) =>
                      current === row.category ? "" : row.category
                    )
                    setPage(1)
                  }}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[12px] transition-all duration-200 ease-out active:scale-[0.98]",
                    category === row.category
                      ? "bg-[#0071e3]/12 text-[#0071e3]"
                      : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#ebebed] hover:text-[#1d1d1f]"
                  )}
                >
                  {row.category} · {row.count}
                </button>
              ))}
            </div>
          ) : null}
        </AdminSurfaceBody>
      </AdminSurface>

      {loading ? <WallpaperTableSkeleton /> : null}
      {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

      <div className="grid gap-4 sm:gap-5 min-[1200px]:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] min-[1200px]:gap-6">
        <AdminSurface className="min-w-0 overflow-hidden">
          <AdminSurfaceHeader
            title="Wallpapers"
            action={
              <span className="text-[14px] text-[#86868b] tabular-nums">
                {data?.total.toLocaleString() ?? 0} total
              </span>
            }
          />
          <AdminSurfaceBody className="px-0 pt-2">
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] text-[14px]">
                <thead>
                  <tr className="text-left text-[11px] font-medium tracking-wide text-[#86868b] uppercase">
                    <th className="px-4 py-2.5 sm:px-6">Preview</th>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Likes</th>
                    <th className="px-4 py-2.5 sm:px-6">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.wallpapers ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-[#86868b] sm:px-6"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <HugeiconsIcon icon={ImageNotFoundIcon} className="size-8 text-[#86868b]/60" />
                          No wallpapers match your filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data?.wallpapers.map((item) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 ease-out hover:bg-[#f5f5f7]/80",
                          selectedId === item.id && "bg-[#0071e3]/[0.06]"
                        )}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <td className="px-4 py-3 sm:px-6">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbUrl}
                            alt=""
                            className="size-12 rounded-[12px] object-cover sm:size-14 sm:rounded-[14px]"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <p className="max-w-[220px] truncate font-medium text-[#1d1d1f]">
                            {item.name}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] text-[#86868b]">
                            {item.id}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[#1d1d1f]">
                          {item.category}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 font-medium text-[#1d1d1f] tabular-nums">
                            <HugeiconsIcon icon={HeartIcon} className="size-3.5 text-[#ff2d55]" />
                            {item.likeCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <div className="flex flex-wrap gap-1">
                            {item.isFeatured ? (
                              <AdminBadge tone="blue">Featured</AdminBadge>
                            ) : null}
                            {item.isCuratedPick ? (
                              <AdminBadge tone="green">Pick</AdminBadge>
                            ) : null}
                            {item.isPro ? (
                              <AdminBadge tone="amber">Pro</AdminBadge>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-4 py-4 sm:px-6">
                <p className="text-[14px] text-[#86868b]">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <AdminButton
                    size="sm"
                    variant="secondary"
                    className="gap-1"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <HugeiconsIcon icon={ChevronLeftIcon} className="size-3.5" />
                    Previous
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="secondary"
                    className="gap-1"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                  >
                    Next
                    <HugeiconsIcon icon={ChevronRightIcon} className="size-3.5" />
                  </AdminButton>
                </div>
              </div>
            ) : null}
          </AdminSurfaceBody>
        </AdminSurface>

        {selected ? (
          <WallpaperEditor
            key={selected.id}
            wallpaper={selected}
            onClose={() => setSelectedId(null)}
            onSave={saveWallpaper}
          />
        ) : (
          <AdminSurface className="h-fit min-[1200px]:sticky min-[1200px]:top-[5.5rem]">
            <AdminSurfaceHeader
              title="Edit wallpaper"
              description="Update catalog metadata. Changes sync to the public site."
            />
            <AdminSurfaceBody>
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <HugeiconsIcon icon={CursorPointer01Icon} className="size-8 text-[#86868b]/60" />
                <p className="text-[14px] text-[#86868b]">
                  Select a wallpaper from the table.
                </p>
              </div>
            </AdminSurfaceBody>
          </AdminSurface>
        )}
      </div>
    </div>
  )
}

function WallpaperEditor({
  wallpaper,
  onClose,
  onSave,
}: Readonly<{
  wallpaper: WallpaperItem
  onClose: () => void
  onSave: (
    wallpaperId: string,
    patch: {
      name: string
      category: string
      tags: string[]
      isFeatured: boolean
      isCuratedPick: boolean
      isPro: boolean
    }
  ) => Promise<void>
}>) {
  const [name, setName] = useState(wallpaper.name)
  const [category, setCategory] = useState(wallpaper.category)
  const [tagsText, setTagsText] = useState(wallpaper.tags.join(", "))
  const [isFeatured, setIsFeatured] = useState(wallpaper.isFeatured)
  const [isCuratedPick, setIsCuratedPick] = useState(wallpaper.isCuratedPick)
  const [isPro, setIsPro] = useState(wallpaper.isPro)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave(wallpaper.id, {
        name,
        category,
        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isFeatured,
        isCuratedPick,
        isPro,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminSurface className="h-fit min-[1200px]:sticky min-[1200px]:top-[5.5rem]">
      <AdminSurfaceHeader
        title="Edit wallpaper"
        description="Update catalog metadata. Changes sync to the public site."
      />
      <AdminSurfaceBody className="space-y-4 sm:space-y-5">
        <div className="overflow-hidden rounded-[20px] bg-[#f5f5f7]">
          <video
            key={wallpaper.videoUrl}
            src={wallpaper.videoUrl}
            poster={wallpaper.thumbUrl}
            controls
            playsInline
            className="aspect-video w-full bg-black/[0.03]"
          />
        </div>

        <div className="space-y-2">
          <AdminLabel htmlFor="wallpaper-name">Name</AdminLabel>
          <AdminInput
            id="wallpaper-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <AdminLabel htmlFor="wallpaper-category">Category</AdminLabel>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="wallpaper-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WALLPAPER_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <AdminLabel htmlFor="wallpaper-tags">Tags</AdminLabel>
          <AdminInput
            id="wallpaper-tags"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="comma, separated, tags"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InfoCell
            label="Likes"
            value={wallpaper.likeCount.toLocaleString()}
          />
          <InfoCell label="Resolution" value={wallpaper.resolution} />
          <InfoCell
            label="Duration"
            value={formatDuration(wallpaper.durationSeconds)}
          />
          <InfoCell label="Size" value={formatBytes(wallpaper.fileSizeBytes)} />
        </div>

        <div className="space-y-2">
          {[
            { label: "Featured", checked: isFeatured, onChange: setIsFeatured },
            {
              label: "Curated pick",
              checked: isCuratedPick,
              onChange: setIsCuratedPick,
            },
            { label: "Pro only", checked: isPro, onChange: setIsPro },
          ].map((toggle) => (
            <label
              key={toggle.label}
              className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#f5f5f7] px-3.5 py-3"
            >
              <span className="text-[14px] text-[#1d1d1f]">{toggle.label}</span>
              <Switch
                checked={toggle.checked}
                onCheckedChange={toggle.onChange}
              />
            </label>
          ))}
        </div>

        {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}

        <div className="flex gap-2">
          <AdminButton
            size="lg"
            className="flex-1 gap-1.5"
            onClick={() => void handleSave()}
            disabled={saving || name.trim().length < 2}
          >
            <HugeiconsIcon icon={SaveIcon} className="size-4" />
            {saving ? "Saving…" : "Save changes"}
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close editor"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </AdminButton>
        </div>

        <p className="text-[12px] text-[#86868b]">ID: {wallpaper.id}</p>
      </AdminSurfaceBody>
    </AdminSurface>
  )
}

function InfoCell({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5">
      <p className="text-[12px] text-[#86868b]">{label}</p>
      <p className="mt-0.5 font-medium text-[#1d1d1f] tabular-nums">{value}</p>
    </div>
  )
}

function WallpaperTableSkeleton() {
  return (
    <AdminSurface>
      <AdminSurfaceBody className="space-y-3 py-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <AdminSkeleton key={index} className="h-16" />
        ))}
      </AdminSurfaceBody>
    </AdminSurface>
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
