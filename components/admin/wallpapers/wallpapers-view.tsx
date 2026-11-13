"use client"

/**
 * Wallpapers catalog: a filterable grid on the left and the metadata editor
 * on the right (a sheet below 1280px). Data comes from /api/admin/wallpapers.
 */

import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MousePointerClick,
  RefreshCw,
} from "lucide-react"
import { useRef, useSyncExternalStore } from "react"

import { AdminPage } from "@/components/admin/page"
import { EmptyState, Notice } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { CatalogToolbar } from "./catalog-toolbar"
import { useWallpaperCatalog } from "./use-wallpaper-catalog"
import { WallpaperEditor } from "./wallpaper-editor"
import { WallpaperGrid, WallpaperGridSkeleton } from "./wallpaper-grid"

const DESKTOP_EDITOR_QUERY = "(min-width: 1280px)"

function subscribeToDesktopEditor(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_EDITOR_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** True when there is room for the editor beside the grid. */
function useDesktopEditor() {
  return useSyncExternalStore(
    subscribeToDesktopEditor,
    () => window.matchMedia(DESKTOP_EDITOR_QUERY).matches,
    () => false
  )
}

/** API errors come without a full stop; the notice adds a sentence after them. */
function asSentence(message: string) {
  const trimmed = message.trim()
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

export function WallpapersView({
  initialQuery = "",
}: Readonly<{ initialQuery?: string }>) {
  const catalog = useWallpaperCatalog(initialQuery)
  const desktopEditor = useDesktopEditor()
  const gridScrollRef = useRef<HTMLDivElement>(null)

  const { list, editing, filters } = catalog
  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.limit)) : 1
  const firstOnPage = list ? (list.page - 1) * list.limit + 1 : 0
  const lastOnPage = list ? firstOnPage + list.wallpapers.length - 1 : 0

  function goToPage(page: number) {
    catalog.setPage(page)
    gridScrollRef.current?.scrollTo({ top: 0 })
  }

  const editor = editing ? (
    <WallpaperEditor
      key={editing.item.id}
      wallpaper={editing.item}
      draft={editing.draft}
      dirty={catalog.dirty}
      saving={catalog.saving}
      saved={catalog.saved}
      error={catalog.saveError}
      onChange={catalog.updateDraft}
      onSave={() => void catalog.save()}
      onDiscard={catalog.discardDraft}
      onClose={catalog.close}
    />
  ) : null

  return (
    <AdminPage
      title="Wallpapers"
      description="Browse and edit the catalog."
      fill
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={catalog.reload}
          disabled={catalog.pending}
        >
          <RefreshCw
            aria-hidden
            className={cn(
              "size-3.5",
              catalog.pending && "animate-spin motion-reduce:animate-none"
            )}
          />
          Refresh
        </Button>
      }
    >
      <CatalogToolbar
        query={catalog.query}
        onQueryChange={catalog.setQuery}
        category={filters.category}
        onCategoryChange={catalog.setCategory}
        sort={filters.sort}
        onSortChange={catalog.setSort}
        categoryCounts={list?.categoryCounts ?? null}
        total={list ? list.total : null}
        filtered={catalog.hasFilters}
        busy={catalog.pending && Boolean(list)}
      />

      <div
        className="flex min-h-0 flex-1"
        onKeyDown={(event) => {
          // Escape closes the side editor from the grid or the form. An open
          // select or tooltip takes the key first and marks it handled.
          if (event.key === "Escape" && editing && !event.defaultPrevented) {
            event.preventDefault()
            catalog.close()
          }
        }}
      >
        <section
          aria-label="Catalog"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          {/* `relative` keeps the cards' screen-reader-only text inside this
              scroller; without it that text stretches the page itself. */}
          <div
            ref={gridScrollRef}
            className="relative min-h-0 flex-1 overflow-y-auto"
          >
            <div className="flex min-h-full flex-col gap-4 p-4 sm:p-6">
              {catalog.error ? (
                <Notice
                  title="Wallpapers could not be loaded"
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={catalog.reload}
                    >
                      Retry
                    </Button>
                  }
                >
                  {asSentence(catalog.error)}
                  {list ? " The list below is the last one that loaded." : null}
                </Notice>
              ) : null}

              {catalog.loading ? (
                <WallpaperGridSkeleton />
              ) : list && list.wallpapers.length > 0 ? (
                <WallpaperGrid
                  wallpapers={list.wallpapers}
                  selectedId={editing?.item.id ?? null}
                  onSelect={catalog.select}
                  stale={catalog.stale}
                />
              ) : list ? (
                catalog.hasFilters ? (
                  <EmptyState
                    icon={<ImageOff />}
                    title="No wallpapers match"
                    description="Try another search term or category."
                    className="flex-1"
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={catalog.clearFilters}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={<ImageOff />}
                    title="The catalog is empty"
                    description="Wallpapers appear here once they are uploaded."
                    className="flex-1"
                  />
                )
              ) : null}
            </div>
          </div>

          {list && list.wallpapers.length > 0 ? (
            <footer className="flex h-[57px] shrink-0 items-center justify-between gap-3 border-t border-border px-4 sm:px-6">
              <p className="text-xs text-muted-foreground tabular-nums">
                {firstOnPage.toLocaleString()}–{lastOnPage.toLocaleString()} of{" "}
                {list.total.toLocaleString()}
              </p>
              {totalPages > 1 ? (
                <nav
                  aria-label="Pages"
                  className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums"
                >
                  <span className="mr-1 hidden sm:inline">
                    Page {list.page.toLocaleString()} of{" "}
                    {totalPages.toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => goToPage(filters.page - 1)}
                  >
                    <ChevronLeft aria-hidden className="size-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => goToPage(filters.page + 1)}
                  >
                    Next
                    <ChevronRight aria-hidden className="size-3.5" />
                  </Button>
                </nav>
              ) : null}
            </footer>
          ) : null}
        </section>

        <aside
          aria-label="Wallpaper editor"
          className="hidden w-[380px] shrink-0 flex-col border-l border-border xl:flex"
        >
          {desktopEditor && editor ? (
            editor
          ) : (
            <EmptyState
              icon={<MousePointerClick />}
              title="No wallpaper selected"
              description="Select a wallpaper to preview it and edit its details."
              className="flex-1"
            />
          )}
        </aside>
      </div>

      <Sheet
        open={!desktopEditor && Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) catalog.close()
        }}
      >
        <SheetContent
          showCloseButton={false}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            // Focus the sheet, not its first button, so no tooltip pops up.
            event.preventDefault()
            if (event.currentTarget instanceof HTMLElement) {
              event.currentTarget.focus()
            }
          }}
          className="w-full! gap-0 border-border bg-background p-0 outline-none sm:max-w-[420px]!"
        >
          <SheetTitle className="sr-only">Edit wallpaper</SheetTitle>
          {desktopEditor ? null : editor}
        </SheetContent>
      </Sheet>

      <Dialog
        open={catalog.confirmingDiscard}
        onOpenChange={(open) => {
          if (!open) catalog.cancelDiscard()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-5 rounded-[14px] sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-[15px] leading-snug font-semibold">
              Discard unsaved changes?
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {editing
                ? `Your edits to “${editing.item.name}” have not been saved and will be lost.`
                : "Your edits have not been saved and will be lost."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={catalog.cancelDiscard}>
              Keep editing
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={catalog.confirmDiscard}
            >
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
