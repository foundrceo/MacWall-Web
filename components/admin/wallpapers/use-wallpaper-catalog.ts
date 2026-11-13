"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  PAGE_SIZE,
  isDirty,
  toDraft,
  toPatch,
  type CatalogFilters,
  type Wallpaper,
  type WallpaperDraft,
  type WallpaperList,
  type WallpaperSort,
} from "./catalog"

/** The wallpaper open in the editor and the form's current values. */
type Editing = { item: Wallpaper; draft: WallpaperDraft }

function filterKeyOf(filters: CatalogFilters) {
  return [filters.q, filters.category, filters.sort, filters.page].join("\n")
}

function requestKeyOf(filters: CatalogFilters, reloadToken: number) {
  return `${reloadToken}\n${filterKeyOf(filters)}`
}

async function readJson<T>(res: Response): Promise<T & { error?: string }> {
  try {
    return (await res.json()) as T & { error?: string }
  } catch {
    throw new Error(
      res.ok
        ? "The server sent a response that could not be read."
        : `The request failed (${res.status}).`
    )
  }
}

/**
 * State for the catalog screen: the filtered, paged list from
 * /api/admin/wallpapers and the wallpaper being edited.
 */
export function useWallpaperCatalog(initialQuery: string) {
  const [query, setQueryText] = useState(initialQuery)
  const [filters, setFilters] = useState<CatalogFilters>({
    q: initialQuery.trim(),
    category: "",
    sort: "likes_desc",
    page: 1,
  })
  const [reloadToken, setReloadToken] = useState(0)
  /** The last list that loaded; stays on screen while the next one loads. */
  const [loaded, setLoaded] = useState<{
    list: WallpaperList
    filterKey: string
  } | null>(null)
  /** Which request finished last, and how. */
  const [settled, setSettled] = useState<{
    key: string
    error: string | null
  } | null>(null)

  const [editing, setEditing] = useState<Editing | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<{
    id: string
    message: string
  } | null>(null)
  /** The wallpaper whose last save went through, until it is edited again. */
  const [savedId, setSavedId] = useState<string | null>(null)
  /** A select or close that is waiting for "discard changes?" to be answered. */
  const [pendingSwitch, setPendingSwitch] = useState<{
    item: Wallpaper | null
  } | null>(null)

  // Search as you type, 300ms after the last key.
  useEffect(() => {
    const next = query.trim()
    const timer = window.setTimeout(() => {
      setFilters((current) =>
        current.q === next ? current : { ...current, q: next, page: 1 }
      )
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    const filterKey = filterKeyOf(filters)
    const requestKey = requestKeyOf(filters, reloadToken)

    const params = new URLSearchParams({
      page: String(filters.page),
      limit: String(PAGE_SIZE),
      sort: filters.sort,
      stats: "1",
    })
    if (filters.q) params.set("q", filters.q)
    if (filters.category) params.set("category", filters.category)

    fetch(`/api/admin/wallpapers?${params}`, {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await readJson<WallpaperList>(res)
        if (!res.ok) throw new Error(json.error ?? "Failed to load wallpapers.")
        return json
      })
      .then((list) => {
        setLoaded({ list, filterKey })
        setSettled({ key: requestKey, error: null })
        // Follow the wallpaper being edited: refresh it from the new list, or
        // close the editor when it left the list. Unsaved edits are kept.
        setEditing((current) => {
          if (!current) return current
          const dirty = isDirty(current.draft, current.item)
          const fresh = list.wallpapers.find(
            (item) => item.id === current.item.id
          )
          if (!fresh) return dirty ? current : null
          return { item: fresh, draft: dirty ? current.draft : toDraft(fresh) }
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setSettled({
          key: requestKey,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load wallpapers.",
        })
      })

    return () => controller.abort()
  }, [filters, reloadToken])

  const pending = settled?.key !== requestKeyOf(filters, reloadToken)
  const list = loaded?.list ?? null
  const dirty = editing ? isDirty(editing.draft, editing.item) : false

  function setQuery(value: string) {
    setQueryText(value)
    // Clearing the box should not wait for the debounce.
    if (!value.trim()) {
      setFilters((current) =>
        current.q ? { ...current, q: "", page: 1 } : current
      )
    }
  }

  function open(item: Wallpaper | null) {
    setEditing(item ? { item, draft: toDraft(item) } : null)
    setSaveError(null)
    setSavedId(null)
  }

  /** Open a wallpaper (or close the editor with `null`), asking first if edits would be lost. */
  function requestSwitch(item: Wallpaper | null) {
    if (!editing) {
      open(item)
    } else if (item?.id === editing.item.id) {
      return
    } else if (dirty) {
      setPendingSwitch({ item })
    } else {
      open(item)
    }
  }

  async function save() {
    if (!editing || savingId) return
    const { item, draft } = editing
    setSavingId(item.id)
    setSaveError(null)
    try {
      const res = await fetch(
        `/api/admin/wallpapers/${encodeURIComponent(item.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(toPatch(draft)),
        }
      )
      const json = await readJson<{ wallpaper?: Wallpaper }>(res)
      if (!res.ok || !json.wallpaper) {
        throw new Error(json.error ?? "The wallpaper could not be saved.")
      }
      const saved = json.wallpaper

      // Show the saved values straight away, then reload so sorting, filters
      // and category counts catch up.
      setLoaded((current) =>
        current
          ? {
              ...current,
              list: {
                ...current.list,
                wallpapers: current.list.wallpapers.map((entry) =>
                  entry.id === saved.id ? saved : entry
                ),
              },
            }
          : current
      )
      setEditing((current) =>
        current?.item.id === saved.id
          ? { item: saved, draft: toDraft(saved) }
          : current
      )
      setSavedId(saved.id)
      setReloadToken((token) => token + 1)
      toast.success(`Saved “${saved.name}”`)
    } catch (error) {
      setSaveError({
        id: item.id,
        message:
          error instanceof Error
            ? error.message
            : "The wallpaper could not be saved.",
      })
    } finally {
      setSavingId(null)
    }
  }

  return {
    /** Search box text; `filters.q` follows it after the debounce. */
    query,
    setQuery,
    filters,
    setCategory(category: string) {
      setFilters((current) => ({ ...current, category, page: 1 }))
    },
    setSort(sort: WallpaperSort) {
      setFilters((current) => ({ ...current, sort, page: 1 }))
    },
    setPage(page: number) {
      setFilters((current) => ({ ...current, page: Math.max(1, page) }))
    },
    hasFilters: Boolean(query.trim() || filters.category),
    clearFilters() {
      setQueryText("")
      setFilters((current) => ({ ...current, q: "", category: "", page: 1 }))
    },

    list,
    /** A request is in flight. */
    pending,
    /** First load: nothing to show yet. */
    loading: pending && !list,
    /** The list on screen belongs to earlier filters or an earlier page. */
    stale: pending && loaded?.filterKey !== filterKeyOf(filters),
    error: pending ? null : (settled?.error ?? null),
    reload() {
      setReloadToken((token) => token + 1)
    },

    editing,
    dirty,
    saving: Boolean(editing && savingId === editing.item.id),
    saveError:
      editing && saveError?.id === editing.item.id ? saveError.message : null,
    /** The last save went through and nothing has changed since. */
    saved: Boolean(editing && savedId === editing.item.id && !dirty),
    select: (item: Wallpaper) => requestSwitch(item),
    close: () => requestSwitch(null),
    updateDraft(patch: Partial<WallpaperDraft>) {
      setEditing((current) =>
        current
          ? { ...current, draft: { ...current.draft, ...patch } }
          : current
      )
    },
    discardDraft() {
      setEditing((current) =>
        current ? { ...current, draft: toDraft(current.item) } : current
      )
      setSaveError(null)
    },
    save,

    /** The "discard unsaved changes?" question is open. */
    confirmingDiscard: pendingSwitch !== null,
    confirmDiscard() {
      if (pendingSwitch) open(pendingSwitch.item)
      setPendingSwitch(null)
    },
    cancelDiscard() {
      setPendingSwitch(null)
    },
  }
}

export type WallpaperCatalog = ReturnType<typeof useWallpaperCatalog>
