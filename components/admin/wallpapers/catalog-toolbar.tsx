"use client"

import { SearchInput, Spinner } from "@/components/admin/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

import { SORT_OPTIONS, type CategoryCount, type WallpaperSort } from "./catalog"

const ALL_CATEGORIES = "__all__"

/** Search, category and sort above the grid, with the result count. */
export function CatalogToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categoryCounts,
  total,
  filtered,
  busy,
}: Readonly<{
  query: string
  onQueryChange: (value: string) => void
  /** Empty for all categories. */
  category: string
  onCategoryChange: (category: string) => void
  sort: WallpaperSort
  onSortChange: (sort: WallpaperSort) => void
  categoryCounts: readonly CategoryCount[] | null
  /** Wallpapers matching the current filters; null until the first load. */
  total: number | null
  filtered: boolean
  busy: boolean
}>) {
  const counts = new Map(
    (categoryCounts ?? []).map((row) => [row.category, row.count])
  )
  // Categories that exist in the catalog but were retired from the site list
  // stay filterable.
  const retired = [...counts.keys(), category].filter(
    (name, index, names) =>
      name &&
      !WALLPAPER_CATEGORIES.includes(name) &&
      names.indexOf(name) === index
  )
  const catalogTotal = categoryCounts
    ? categoryCounts.reduce((sum, row) => sum + row.count, 0)
    : null

  let countLabel = ""
  if (total !== null) {
    countLabel =
      filtered && catalogTotal !== null
        ? `${total.toLocaleString()} of ${catalogTotal.toLocaleString()} wallpapers`
        : `${total.toLocaleString()} ${total === 1 ? "wallpaper" : "wallpapers"}`
  }

  return (
    <div className="@container shrink-0 border-b border-border">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search by name or ID"
          label="Search wallpapers by name or ID"
          className="sm:w-full @[40rem]:w-64"
        />

        <div className="flex min-w-0 flex-1 gap-2 @[40rem]:flex-none">
          <Select
            value={category || ALL_CATEGORIES}
            onValueChange={(value) =>
              onCategoryChange(value === ALL_CATEGORIES ? "" : value)
            }
          >
            <SelectTrigger
              aria-label="Filter by category"
              className="min-w-0 flex-1 rounded-[9px] @[40rem]:w-40 @[40rem]:flex-none"
            >
              <SelectValue>{category || "All categories"}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="min-w-52">
              <CategoryItem
                value={ALL_CATEGORIES}
                label="All categories"
                count={catalogTotal}
              />
              {[...WALLPAPER_CATEGORIES, ...retired].map((name) => (
                <CategoryItem
                  key={name}
                  value={name}
                  label={name}
                  count={categoryCounts ? (counts.get(name) ?? 0) : null}
                />
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as WallpaperSort)}
          >
            <SelectTrigger
              aria-label="Sort wallpapers"
              className="min-w-0 flex-1 rounded-[9px] @[40rem]:w-36 @[40rem]:flex-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p
          aria-live="polite"
          className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground tabular-nums @[50rem]:flex"
        >
          {busy ? <Spinner className="size-3.5" /> : null}
          {countLabel}
        </p>
      </div>
    </div>
  )
}

/** A category with its wallpaper count on the right. */
function CategoryItem({
  value,
  label,
  count,
}: Readonly<{ value: string; label: string; count: number | null }>) {
  return (
    <SelectItem
      value={value}
      textValue={label}
      className="*:[span]:last:flex-1 *:[span]:last:justify-between"
    >
      <span className="truncate">{label}</span>
      {count !== null ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {count.toLocaleString()}
        </span>
      ) : null}
    </SelectItem>
  )
}
