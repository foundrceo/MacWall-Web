"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/command-palette/command-palette-provider"

const loadCommandPaletteDialog = () =>
  import("@/components/command-palette/command-palette-dialog").then(
    (m) => m.CommandPaletteDialog
  )

const CommandPaletteDialog = dynamic(loadCommandPaletteDialog, { ssr: false })

/** Warm the palette chunk on intent (hover/focus) so the first open is instant. */
export function preloadCommandPaletteDialog() {
  void loadCommandPaletteDialog()
}

/**
 * The dialog (and motion) stays out of every page's bundle until the palette
 * is first opened; `session` only moves past 0 on the first open.
 */
function LazyCommandPaletteDialog() {
  const { session } = useCommandPalette()
  return session > 0 ? <CommandPaletteDialog /> : null
}

export function CommandPaletteMount({
  children,
}: Readonly<{ children?: ReactNode }>) {
  return (
    <CommandPaletteProvider>
      {children}
      <LazyCommandPaletteDialog />
    </CommandPaletteProvider>
  )
}
