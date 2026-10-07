"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useCommandPaletteOptional } from "@/components/command-palette/command-palette-provider"
import { KbdShortcut } from "@/components/command-palette/kbd-badge"

/** Opens the site-wide ⌘K search, which already indexes every help article. */
export function HelpSearchButton() {
  const palette = useCommandPaletteOptional()

  return (
    <button
      type="button"
      onClick={() => palette?.setOpen(true)}
      className="mt-6 flex h-11 w-full max-w-md items-center gap-2.5 rounded-full bg-white/[0.06] px-4 text-left text-[14px] text-white/55 ring-1 ring-white/[0.08] transition hover:bg-white/[0.09] hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.75} aria-hidden />
      <span className="flex-1">Search help…</span>
      <KbdShortcut className="max-sm:hidden" />
    </button>
  )
}
