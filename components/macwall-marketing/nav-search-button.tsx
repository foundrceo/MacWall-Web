"use client"

import { Search } from "lucide-react"
import { useSyncExternalStore } from "react"

import { preloadCommandPaletteDialog } from "@/components/command-palette/command-palette-mount"
import { useCommandPalette } from "@/components/command-palette/command-palette-provider"
import {
  COMMAND_PALETTE_SHORTCUT_SERVER_KEYS,
  getCommandPaletteShortcutKeys,
} from "@/lib/command-palette/platform-shortcut"
import { cn } from "@/lib/utils"

const subscribeNever = () => () => {}

/**
 * The visible way into the ⌘K palette (wallpapers, collections and pages).
 * Icon-only by default; pass `showLabel` for the wide "Search ⌘K" pill.
 * The shortcut keys come from the browser after hydration (server: ⌘ K),
 * so Windows visitors see Ctrl K without a hydration mismatch.
 */
export function NavSearchButton({
  className,
  showLabel = false,
}: Readonly<{ className?: string; showLabel?: boolean }>) {
  const { setOpen } = useCommandPalette()
  const keys = useSyncExternalStore(
    subscribeNever,
    getCommandPaletteShortcutKeys,
    () => COMMAND_PALETTE_SHORTCUT_SERVER_KEYS
  )

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      onPointerEnter={preloadCommandPaletteDialog}
      onFocus={preloadCommandPaletteDialog}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-label="Search wallpapers"
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      {showLabel ? (
        <>
          <span>Search</span>
          <span className="ms-auto inline-flex gap-0.5" aria-hidden>
            {keys.map((key) => (
              <kbd
                key={key}
                className="rounded-md border border-border bg-background px-1.5 text-[11px]"
              >
                {key}
              </kbd>
            ))}
          </span>
        </>
      ) : null}
    </button>
  )
}
