"use client"

import { Search } from "lucide-react"

import { useCommandPalette } from "@/components/command-palette/command-palette-provider"
import { getCommandPaletteShortcutKeys } from "@/lib/command-palette/platform-shortcut"
import { cn } from "@/lib/utils"

export function NavSearchButton({ className }: Readonly<{ className?: string }>) {
  const { setOpen } = useCommandPalette()
  const keys = getCommandPaletteShortcutKeys()

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-1.5 ps-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      aria-label="Search"
    >
      <Search className="size-4" />
      Search
      <span className="ms-auto inline-flex gap-0.5">
        {keys.map((key) => (
          <kbd
            key={key}
            className="rounded-md border border-border bg-background px-1.5 text-[11px]"
          >
            {key}
          </kbd>
        ))}
      </span>
    </button>
  )
}
