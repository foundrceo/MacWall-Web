"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react"
import { flushSync } from "react-dom"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  KbdShortcut,
  useCommandPaletteShortcutLabel,
} from "@/components/command-palette/kbd-badge"
import { useCommandPalette } from "@/components/command-palette/command-palette-provider"
import { ChevronDown, Search, X } from "lucide-react"
import { CategoryIcon } from "@/components/wallpaper-gallery/category-icons"
import { WallpaperCard } from "@/components/wallpaper-gallery/wallpaper-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  GALLERY_CAPSULE_BTN_CLASS,
  GALLERY_CAPSULE_CLASS,
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_CHIP_ACTIVE_CLASS,
  GALLERY_CHIP_CLASS,
  GALLERY_CONTROLS_AFTER_TITLE_BLOCK_CLASS,
  GALLERY_DIVIDER_CLASS,
  GALLERY_SEARCH_INPUT_CLASS,
  GALLERY_SORT_MENU_CLASS,
  GALLERY_SORT_MENU_ITEM_CLASS,
  GALLERY_SORT_TRIGGER_CLASS,
  GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
  GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
  GALLERY_TITLE_BLOCK_BOTTOM_CLASS,
} from "@/lib/public-catalog/chrome"
import type {
  PublicCatalogSort,
  PublicWallpaper,
  PublicWallpaperListResult,
} from "@/lib/public-catalog/types"
import {
  WALLPAPER_DISPLAY_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
} from "@/lib/public-catalog/typography"
import {
  getGalleryReturnForFilters,
  galleryReturnFiltersMatch,
  readGalleryReturnSnapshot,
  scrollGalleryToWallpaper,
  shouldRestoreGallerySnapshot,
  writeGalleryReturnSnapshot,
  type GalleryReturnFilters,
} from "@/lib/public-catalog/gallery-return-state"
import {
  wallpapersGalleryHref,
  wallpapersGalleryPath,
} from "@/lib/public-catalog/urls"
import { categorySlugFromName } from "@/lib/seo/category-slugs"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type WallpaperGalleryProps = {
  initial: PublicWallpaperListResult
  activeCategory?: string | null
  title?: string
  subtitle?: string
  loadError?: boolean
}

function parseSort(value: string | null): PublicCatalogSort {
  switch (value) {
    case "popular":
    case "older":
    case "newest":
      return value
    default:
      return "newest"
  }
}

function sortLabel(sort: PublicCatalogSort): string {
  switch (sort) {
    case "popular":
      return "Popular"
    case "older":
      return "Older"
    case "newest":
      return "Newest"
    default: {
      const _exhaustive: never = sort
      return _exhaustive
    }
  }
}

function buildEntranceIndices(
  wallpapers: PublicWallpaper[]
): Record<string, number> {
  return Object.fromEntries(
    wallpapers.map((wallpaper, index) => [wallpaper.id, index])
  )
}

function mergeEntranceIndices(
  previous: Record<string, number>,
  batch: PublicWallpaper[]
): Record<string, number> {
  const next = { ...previous }
  let batchIndex = 0
  for (const wallpaper of batch) {
    if (wallpaper.id in next) continue
    next[wallpaper.id] = batchIndex
    batchIndex += 1
  }
  return next
}

const GALLERY_GRID_LAYOUT_CLASS =
  "grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8"

function LoadMoreSkeletonRow() {
  return (
    <div className={cn(GALLERY_GRID_LAYOUT_CLASS, "mt-7 lg:mt-8")} aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2.5">
          <Skeleton
            className={cn(
              "aspect-video bg-white/[0.06]",
              GALLERY_MEDIA_RADIUS_CLASS
            )}
          />
          <Skeleton className="h-3.5 w-3/5 rounded-full bg-white/[0.08]" />
          <Skeleton className="h-3 w-1/4 rounded-full bg-white/[0.06]" />
        </div>
      ))}
    </div>
  )
}

export function WallpaperGallery({
  initial,
  activeCategory = null,
  title = "Live wallpapers for Mac",
  subtitle,
  loadError = false,
}: WallpaperGalleryProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setOpen: openCommandPalette } = useCommandPalette()
  const paletteShortcut = useCommandPaletteShortcutLabel()
  const [isPending, startTransition] = useTransition()

  const qParam = searchParams.get("q") ?? ""
  const tagParam = searchParams.get("tag") ?? ""
  const sort = parseSort(searchParams.get("sort"))

  /**
   * Cache key MUST be the gallery route — never `usePathname()`.
   * On detail navigation Next updates pathname to `/wallpaper/...` before this
   * component unmounts; persisting under that path made Back miss the snapshot
   * and fall back to SSR page 1 (browser-verified: 48 → 24 wipe).
   */
  const galleryPathname = useMemo(() => {
    if (!activeCategory) return wallpapersGalleryPath()
    const slug = categorySlugFromName(activeCategory)
    return slug ? wallpapersGalleryPath(slug) : wallpapersGalleryPath()
  }, [activeCategory])

  const returnFilters = useMemo<GalleryReturnFilters>(
    () => ({
      pathname: galleryPathname,
      category: activeCategory,
      q: qParam,
      tag: tagParam,
      sort,
    }),
    [galleryPathname, activeCategory, qParam, tagParam, sort]
  )

  const onGalleryRoute =
    pathname === galleryPathname || pathname.startsWith("/wallpapers")

  // SSR + first client paint must match `initial` (no sessionStorage in RSC).
  // Cache is applied in useLayoutEffect before paint when returning from detail.
  const [query, setQuery] = useState(qParam)
  const [wallpapers, setWallpapers] = useState(initial.wallpapers)
  const [page, setPage] = useState(initial.page)
  const [hasMore, setHasMore] = useState(initial.hasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [entranceIndices, setEntranceIndices] = useState<
    Record<string, number>
  >(() => buildEntranceIndices(initial.wallpapers))
  /** Skip card fade/slide after back-nav restore (set false again on user Show more). */
  const [suppressEntrance, setSuppressEntrance] = useState(false)

  const persistSnapshot = useCallback(
    (
      next: {
        wallpapers: PublicWallpaper[]
        page: number
        hasMore: boolean
        focusWallpaperId?: string | null
        scrollY?: number
      },
      options?: { replace?: boolean }
    ) => {
      const existing = readGalleryReturnSnapshot()
      const sameView =
        existing && galleryReturnFiltersMatch(existing.filters, returnFilters)
      writeGalleryReturnSnapshot(
        {
          filters: returnFilters,
          wallpapers: next.wallpapers,
          page: next.page,
          hasMore: next.hasMore,
          focusWallpaperId:
            next.focusWallpaperId !== undefined
              ? next.focusWallpaperId
              : sameView
                ? existing.focusWallpaperId
                : null,
          scrollY:
            next.scrollY !== undefined
              ? next.scrollY
              : sameView
                ? existing.scrollY
                : 0,
        },
        options
      )
    },
    [returnFilters]
  )

  useEffect(() => {
    setQuery(qParam)
  }, [qParam])

  const persistSnapshotRef = useRef(persistSnapshot)
  persistSnapshotRef.current = persistSnapshot

  // Only refetch when the user changes filters — NOT when callback identity churns.
  // (Including `persistSnapshot` in deps re-fired this on Back and wiped Show more
  // via `{ replace: true }` → browser-verified 48→24 regression.)
  const filterKey = `${activeCategory ?? ""}|${qParam}|${tagParam}|${sort}|${initial.limit}`
  const filterKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (filterKeyRef.current === null) {
      filterKeyRef.current = filterKey
      return
    }
    if (filterKeyRef.current === filterKey) return
    filterKeyRef.current = filterKey

    let cancelled = false

    async function refresh() {
      setRefreshError(null)
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: String(initial.limit),
          sort,
        })
        if (activeCategory) params.set("category", activeCategory)
        if (qParam) params.set("q", qParam)
        if (tagParam) params.set("tag", tagParam)

        const res = await fetch(`/api/wallpapers?${params}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as PublicWallpaperListResult
        if (cancelled) return
        setWallpapers(data.wallpapers)
        setPage(data.page)
        setHasMore(data.hasMore)
        setEntranceIndices(buildEntranceIndices(data.wallpapers))
        setSuppressEntrance(false)
        persistSnapshotRef.current(
          {
            wallpapers: data.wallpapers,
            page: data.page,
            hasMore: data.hasMore,
            focusWallpaperId: null,
            scrollY: 0,
          },
          { replace: true }
        )
      } catch {
        if (!cancelled) {
          setRefreshError("Couldn’t refresh wallpapers. Try again.")
        }
      }
    }

    void refresh()
    return () => {
      cancelled = true
    }
  }, [filterKey, activeCategory, qParam, tagParam, sort, initial.limit])

  // Own scroll — Next/browser restoration is what dumps you on the footer.
  useEffect(() => {
    const previous = window.history.scrollRestoration
    try {
      window.history.scrollRestoration = "manual"
    } catch {
      // ignore
    }
    return () => {
      try {
        window.history.scrollRestoration = previous
      } catch {
        // ignore
      }
    }
  }, [])

  // Keep cache warm for focus marking — only while still on a gallery route.
  useEffect(() => {
    if (!onGalleryRoute) return
    persistSnapshot({
      wallpapers,
      page,
      hasMore,
    })
  }, [wallpapers, page, hasMore, persistSnapshot, onGalleryRoute])

  // Restore expanded list + lock scroll to the opened card after Back.
  useLayoutEffect(() => {
    const saved = getGalleryReturnForFilters(returnFilters)
    if (
      !saved ||
      !shouldRestoreGallerySnapshot(saved, initial.wallpapers.length)
    ) {
      return
    }

    // Re-apply whenever React remounted behind the cache (Strict Mode / Back).
    const behindCache = wallpapers.length < saved.wallpapers.length
    const needsFocusScroll = Boolean(saved.focusWallpaperId)
    if (!behindCache && !needsFocusScroll) return

    setSuppressEntrance(true)
    if (behindCache) {
      flushSync(() => {
        setWallpapers(saved.wallpapers)
        setPage(saved.page)
        setHasMore(saved.hasMore)
        setEntranceIndices(buildEntranceIndices(saved.wallpapers))
      })
    }

    if (needsFocusScroll) {
      return scrollGalleryToWallpaper(saved.focusWallpaperId)
    }
  }, [
    returnFilters,
    initial.wallpapers.length,
    wallpapers.length,
  ])

  const resolvedSubtitle = useMemo(() => {
    if (subtitle) return subtitle
    if (activeCategory) {
      return `Cinematic ${activeCategory} loops, curated for desktop Macs.`
    }
    return "Cinematic loops for every genre — preview here, set in MacWall."
  }, [activeCategory, subtitle])

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (!value) next.delete(key)
        else next.set(key, value)
      }
      const qs = next.toString()
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateParams({ q: query.trim() || null })
  }

  const clearSearch = () => {
    setQuery("")
    updateParams({ q: null })
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    // Fresh user pagination — allow entrance animation on the new batch only.
    setSuppressEntrance(false)
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(initial.limit),
        sort,
      })
      if (activeCategory) params.set("category", activeCategory)
      if (qParam) params.set("q", qParam)
      if (tagParam) params.set("tag", tagParam)

      const res = await fetch(`/api/wallpapers?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as PublicWallpaperListResult
      // Build the merged list before setState so the cache always gets the full grid.
      const seen = new Set(wallpapers.map((item) => item.id))
      const merged = [...wallpapers]
      for (const item of data.wallpapers) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          merged.push(item)
        }
      }
      setWallpapers(merged)
      setEntranceIndices((prev) => mergeEntranceIndices(prev, data.wallpapers))
      setPage(data.page)
      setHasMore(data.hasMore)
      // Persist the full expanded list — this is what Back restores (no re-fetch).
      persistSnapshot({
        wallpapers: merged,
        page: data.page,
        hasMore: data.hasMore,
      })
    } catch {
      setLoadMoreError("Couldn’t load more wallpapers. Try again.")
    } finally {
      setLoadingMore(false)
    }
  }

  const showLoadMoreFooter = hasMore || Boolean(loadMoreError)

  const categories: Array<{
    name: string | null
    label: string
    href: string
  }> = [
    { name: null, label: "All", href: wallpapersGalleryPath() },
    ...macwall.categories.map((name) => {
      const slug = categorySlugFromName(name)
      return {
        name: name as string,
        label: name as string,
        href: slug ? wallpapersGalleryPath(slug) : wallpapersGalleryPath(),
      }
    }),
  ]

  const galleryQuery = {
    q: qParam || null,
    tag: tagParam || null,
    sort,
  }

  return (
    <div className={WALLPAPER_SECTION_FONT_CLASS}>
      <Breadcrumb>
        <BreadcrumbList
          className={cn(
            "flex-wrap gap-y-1 text-[13px]",
            GALLERY_TEXT_TERTIARY_CLASS
          )}
        >
          {activeCategory ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="transition hover:text-white">
                  <Link href={wallpapersGalleryPath()}>Wallpapers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/35" />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                  {activeCategory}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                Wallpapers
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <header
        className={cn(
          GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
          GALLERY_TITLE_BLOCK_BOTTOM_CLASS
        )}
      >
        <h1
          className={cn(
            WALLPAPER_DISPLAY_HEADING_CLASS,
            GALLERY_TEXT_PRIMARY_CLASS
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
            "text-[15px] leading-[1.5] sm:text-[16px] sm:leading-[1.55]",
            GALLERY_TEXT_SECONDARY_CLASS
          )}
        >
          {resolvedSubtitle}
        </p>

        <form
          onSubmit={onSearchSubmit}
          className={cn(
            "relative w-full max-w-lg",
            GALLERY_CONTROLS_AFTER_TITLE_BLOCK_CLASS
          )}
          role="search"
        >
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 left-4 size-[17px] -translate-y-1/2",
              GALLERY_TEXT_TERTIARY_CLASS
            )}
            aria-hidden
          />
          <Input
            type="text"
            role="searchbox"
            enterKeyHint="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, style, or mood…"
            aria-label="Search wallpapers"
            className={cn(
              GALLERY_SEARCH_INPUT_CLASS,
              query ? "pr-12" : "pr-[4.5rem]"
            )}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                className={cn(
                  "pointer-events-auto flex size-7 shrink-0 appearance-none items-center justify-center border-0 bg-white/[0.08] p-0 leading-none text-white/55 transition duration-200 hover:bg-white/[0.14] hover:text-white focus-visible:ring-2 focus-visible:ring-white/25",
                  GALLERY_CAPSULE_CLASS
                )}
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openCommandPalette(true)}
                className="pointer-events-auto flex h-[22px] shrink-0 appearance-none items-center justify-center border-0 bg-transparent p-0 leading-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none"
                aria-label={`Open command palette (${paletteShortcut})`}
              >
                <KbdShortcut size="md" />
              </button>
            )}
          </div>
        </form>
      </header>

      <div
        className="mt-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="navigation"
        aria-label="Categories"
      >
        {categories.map((category) => {
          const active =
            category.name === null
              ? !activeCategory
              : category.name === activeCategory
          const href = wallpapersGalleryHref(
            category.name ? categorySlugFromName(category.name) : null,
            galleryQuery
          )

          return (
            <Link
              key={category.label}
              href={href}
              className={
                active ? GALLERY_CHIP_ACTIVE_CLASS : GALLERY_CHIP_CLASS
              }
            >
              <CategoryIcon
                category={category.name}
                className={cn(
                  "size-3.5 shrink-0",
                  active ? "text-black/70" : "text-white/55"
                )}
              />
              {category.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className={cn("h-px min-w-0 flex-1", GALLERY_DIVIDER_CLASS)} />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                GALLERY_SORT_TRIGGER_CLASS,
                "inline-flex items-center justify-between gap-1.5"
              )}
              aria-label="Sort wallpapers"
            >
              <span>{sortLabel(sort)}</span>
              <ChevronDown className="size-3.5 shrink-0 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            onCloseAutoFocus={(event) => event.preventDefault()}
            className={GALLERY_SORT_MENU_CLASS}
          >
            {(["newest", "popular", "older"] as const).map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() =>
                  updateParams({
                    sort: value === "newest" ? null : value,
                  })
                }
                className={cn(
                  GALLERY_SORT_MENU_ITEM_CLASS,
                  sort === value
                    ? "bg-white/12 text-white data-[highlighted]:bg-white/12"
                    : "text-white/70"
                )}
              >
                {sortLabel(value)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {wallpapers.length === 0 ? (
        <div className="py-16 text-center sm:py-20">
          {loadError ? (
            <>
              <p className={cn("text-[17px]", GALLERY_TEXT_PRIMARY_CLASS)}>
                Couldn&apos;t load wallpapers
              </p>
              <p
                className={cn("mt-2 text-[15px]", GALLERY_TEXT_SECONDARY_CLASS)}
              >
                Check your connection and try again.
              </p>
              <a
                href={wallpapersGalleryPath()}
                className={cn(
                  "mt-5 inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[14px] font-medium text-black transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50"
                )}
              >
                Retry
              </a>
            </>
          ) : (
            <>
              <p className={cn("text-[17px]", GALLERY_TEXT_PRIMARY_CLASS)}>
                No wallpapers match
              </p>
              <p
                className={cn("mt-2 text-[15px]", GALLERY_TEXT_SECONDARY_CLASS)}
              >
                Try another search, tag, or category.
              </p>
            </>
          )}
        </div>
      ) : (
        <div
          className={cn(
            GALLERY_GRID_LAYOUT_CLASS,
            "mt-5",
            isPending && "opacity-60 transition-opacity duration-300"
          )}
        >
          {wallpapers.map((wallpaper: PublicWallpaper, index) => (
            <WallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              priority={index < 6}
              index={index}
              entranceIndex={entranceIndices[wallpaper.id] ?? index}
              animateEntrance={!suppressEntrance}
            />
          ))}
        </div>
      )}

      {refreshError ? (
        <p
          role="alert"
          className="mt-8 text-center text-[14px] leading-snug text-red-300/90"
        >
          {refreshError}
        </p>
      ) : null}

      {loadingMore ? <LoadMoreSkeletonRow /> : null}

      {showLoadMoreFooter ? (
        <div
          className="mt-8 flex flex-col items-center gap-3 sm:mt-10"
          aria-busy={loadingMore}
          aria-live="polite"
        >
          {loadMoreError ? (
            <p
              id="gallery-load-more-error"
              role="alert"
              className="max-w-sm text-center text-[14px] leading-snug text-red-300/90"
            >
              {loadMoreError}
            </p>
          ) : null}

          {hasMore ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              aria-busy={loadingMore}
              aria-describedby={
                loadMoreError ? "gallery-load-more-error" : undefined
              }
              className={cn(
                GALLERY_CAPSULE_BTN_CLASS,
                "inline-flex min-w-[9.75rem] items-center justify-center gap-2 px-6",
                loadingMore &&
                  "cursor-not-allowed opacity-60 hover:bg-white/[0.08] hover:text-white/70"
              )}
            >
              {loadingMore ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    strokeWidth={1.75}
                    className="animate-spin text-white/55"
                    aria-hidden
                  />
                  <span>Loading…</span>
                </>
              ) : (
                <span>{loadMoreError ? "Try again" : "Show more"}</span>
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
