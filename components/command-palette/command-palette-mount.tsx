"use client"

import { CommandPaletteDialog } from "@/components/command-palette/command-palette-dialog"
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider"
import type { ReactNode } from "react"

export function CommandPaletteMount({
  children,
}: Readonly<{ children?: ReactNode }>) {
  return (
    <CommandPaletteProvider>
      {children}
      <CommandPaletteDialog />
    </CommandPaletteProvider>
  )
}
