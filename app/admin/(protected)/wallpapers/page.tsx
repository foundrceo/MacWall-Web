"use client"

/**
 * Wallpapers — catalog browser and metadata editor. Table on the left,
 * sticky editor rail on the right; everything lives in this page.
 */

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageOff,
  MousePointerClick,
  RefreshCw,
  Save,
  Search,
  TriangleAlert,
  X,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  AdminBadge,
  AdminInfoGrid,
  PanelHeader,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatBytes, formatDuration } from "@/lib/admin/format"
import { cn } from "@/lib/utils"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

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
  { id: "created_desc", label: "Newest first" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "name_desc", label: "Name Z–A" },
]

export default function AdminWallpapersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const initialQuery = use(searchParams).q ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim())
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState<WallpaperSort>("likes_desc")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ListResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const loadedOnce = useRef(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const load = useCallback(async () => {
    if (loadedOnce.current) setRefreshing(true)
    else setLoading(true)
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
      setSelectedId((current) =>
        current && json.wallpapers.some((item) => item.id === current)
          ? current
          : (json.wallpapers[0]?.id ?? null)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallpapers")
      setData(null)
      setSelectedId(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
      loadedOnce.current = true
    }
  }, [page, sort, debouncedQuery, category])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const selected = useMemo(
    () => data?.wallpapers.find((item) => item.id === selectedId) ?? null,
    [data, selectedId]
  )

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

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
    setMessage(`Saved “${patch.name}”.`)
    await load()
    if (json.wallpaper) setSelectedId(json.wallpaper.id)
  }

  return (
    <AdminShell
      title="Wallpapers"
      actions={
        <>
          {data ? (
            <span className="hidden items-center gap-1.5 rounded-full bg-[var(--admin-fill)] px-2.5 py-1 text-xs font-medium text-[var(--admin-fg-soft)] sm:inline-flex">
              <span className="tabular-nums">
                {data.total.toLocaleString()}
              </span>
              wallpapers
              {category ? (
                <span className="hidden md:inline">in {category}</span>
              ) : null}
            </span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("size-3.5", refreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <Card className="gap-0 py-0">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search by name or ID…"
                className="h-9 pl-9"
              />
            </div>

            <div className="flex gap-3">
              <Select
                value={category || "all"}
                onValueChange={(value) => {
                  setCategory(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 w-full min-w-40 lg:w-44">
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
                <SelectTrigger className="h-9 w-full min-w-36 lg:w-40">
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
            </div>
          </div>

          {data?.categoryCounts?.length ? (
            <div className="flex flex-wrap gap-1.5 border-t border-[var(--admin-border)] px-4 py-3">
              {data.categoryCounts.map((row) => {
                const active = category === row.category
                return (
                  <button
                    key={row.category}
                    type="button"
                    onClick={() => {
                      setCategory(active ? "" : row.category)
                      setPage(1)
                    }}
                    className={cn(
                      "cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/30",
                      active
                        ? "bg-[var(--admin-blue-soft)] text-[var(--admin-blue)]"
                        : "bg-[var(--admin-fill)] text-[var(--admin-fg-soft)] hover:bg-[var(--admin-fill-hover)]"
                    )}
                  >
                    {row.category}
                    <span className="ml-1.5 text-[var(--admin-muted)] tabular-nums">
                      {row.count}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </Card>

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

        <div className="grid gap-4 min-[1200px]:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Table */}
          <Card
            className={cn(
              "gap-0 py-0 transition-opacity",
              refreshing && "opacity-60"
            )}
          >
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-11 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/5 rounded-md" />
                      <Skeleton className="h-3 w-3/5 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (data?.wallpapers.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <ImageOff className="size-7 text-[var(--admin-border-strong)]" />
                <p className="text-[13px] font-medium text-[var(--admin-fg)]">
                  No wallpapers found
                </p>
                <p className="text-xs text-[var(--admin-muted)]">
                  Try a different search term or clear the filters.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--admin-border)] hover:bg-transparent">
                    <TableHead className="h-9 w-16 pl-5 text-[11px] font-semibold tracking-wide text-[var(--admin-muted)] uppercase">
                      Preview
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold tracking-wide text-[var(--admin-muted)] uppercase">
                      Name
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold tracking-wide text-[var(--admin-muted)] uppercase">
                      Category
                    </TableHead>
                    <TableHead className="h-9 text-right text-[11px] font-semibold tracking-wide text-[var(--admin-muted)] uppercase">
                      Likes
                    </TableHead>
                    <TableHead className="h-9 pr-5 text-[11px] font-semibold tracking-wide text-[var(--admin-muted)] uppercase">
                      Flags
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.wallpapers.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      aria-selected={selectedId === item.id}
                      className={cn(
                        "cursor-pointer border-[var(--admin-border)]",
                        selectedId === item.id &&
                          "bg-[var(--admin-blue-soft)] hover:bg-[var(--admin-blue-soft)]"
                      )}
                    >
                      <TableCell className="py-2.5 pl-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbUrl}
                          alt=""
                          loading="lazy"
                          className="size-11 rounded-lg bg-[var(--admin-fill)] object-cover"
                        />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <p className="max-w-56 truncate text-[13px] font-medium text-[var(--admin-fg)]">
                          {item.name}
                        </p>
                        <p className="max-w-56 truncate text-xs text-[var(--admin-muted)]">
                          {item.id}
                        </p>
                      </TableCell>
                      <TableCell className="py-2.5 text-[13px] text-[var(--admin-fg-soft)]">
                        {item.category}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--admin-fg)] tabular-nums">
                          <Heart className="size-3.5 text-[var(--admin-red)]" />
                          {item.likeCount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 pr-5">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3 border-t border-[var(--admin-border)] px-5 py-3">
                <p className="text-[13px] text-[var(--admin-muted)] tabular-nums">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="size-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Editor rail */}
          <div className="min-[1200px]:sticky min-[1200px]:top-[calc(var(--admin-topbar-height)+1.5rem)] min-[1200px]:self-start">
            {selected ? (
              <WallpaperEditor
                key={selected.id}
                wallpaper={selected}
                onClose={() => setSelectedId(null)}
                onSave={saveWallpaper}
              />
            ) : (
              <Card className="gap-0 py-0">
                <PanelHeader title="Edit wallpaper" />
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <MousePointerClick className="size-6 text-[var(--admin-border-strong)]" />
                  <p className="text-[13px] text-[var(--admin-muted)]">
                    Select a row to edit its metadata.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
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
    id: string,
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

  const toggles = [
    {
      id: "featured",
      label: "Featured",
      hint: "Highlighted on the app home",
      checked: isFeatured,
      onChange: setIsFeatured,
    },
    {
      id: "pick",
      label: "Curated pick",
      hint: "Included in editor picks",
      checked: isCuratedPick,
      onChange: setIsCuratedPick,
    },
    {
      id: "pro",
      label: "Pro only",
      hint: "Requires a licence",
      checked: isPro,
      onChange: setIsPro,
    },
  ]

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
    <Card className="gap-0 py-0">
      <PanelHeader
        title="Edit wallpaper"
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X className="size-4" />
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <video
          key={wallpaper.videoUrl}
          src={wallpaper.videoUrl}
          poster={wallpaper.thumbUrl}
          controls
          playsInline
          className="aspect-video w-full rounded-lg bg-[var(--admin-fill)] object-cover"
        />

        <div className="space-y-1.5">
          <Label htmlFor="wallpaper-name" className="text-xs">
            Name
          </Label>
          <Input
            id="wallpaper-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wallpaper-category" className="text-xs">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="wallpaper-category" className="h-9 w-full">
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

        <div className="space-y-1.5">
          <Label htmlFor="wallpaper-tags" className="text-xs">
            Tags
          </Label>
          <Input
            id="wallpaper-tags"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="comma, separated, tags"
            className="h-9"
          />
        </div>

        <AdminInfoGrid
          items={[
            { label: "Likes", value: wallpaper.likeCount.toLocaleString() },
            { label: "Resolution", value: wallpaper.resolution },
            {
              label: "Duration",
              value: formatDuration(wallpaper.durationSeconds),
            },
            { label: "Size", value: formatBytes(wallpaper.fileSizeBytes) },
          ]}
        />

        <div className="divide-y divide-[var(--admin-border)] overflow-hidden rounded-lg border border-[var(--admin-border)]">
          {toggles.map((toggle) => (
            <label
              key={toggle.id}
              className="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5"
            >
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-[var(--admin-fg)]">
                  {toggle.label}
                </span>
                <span className="block text-xs text-[var(--admin-muted)]">
                  {toggle.hint}
                </span>
              </span>
              <Switch
                checked={toggle.checked}
                onCheckedChange={toggle.onChange}
              />
            </label>
          ))}
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 text-xs text-[var(--admin-red)]">
            <TriangleAlert className="size-3.5" />
            {error}
          </p>
        ) : null}

        <Button
          className="w-full"
          onClick={() => void handleSave()}
          disabled={saving || name.trim().length < 2}
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save changes"}
        </Button>

        <p className="truncate text-xs text-[var(--admin-muted)]">
          ID: {wallpaper.id}
        </p>
      </div>
    </Card>
  )
}
