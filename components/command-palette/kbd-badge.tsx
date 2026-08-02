"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import {
  COMMAND_PALETTE_SHORTCUT_SERVER_KEYS,
  COMMAND_PALETTE_SHORTCUT_SERVER_LABEL,
  getCommandPaletteShortcutKeys,
  getCommandPaletteShortcutLabel,
} from "@/lib/command-palette/platform-shortcut"
import { cn } from "@/lib/utils"

function subscribeNoop() {
  return () => {}
}

export function useCommandPaletteShortcutLabel(): string {
  return useSyncExternalStore(
    subscribeNoop,
    getCommandPaletteShortcutLabel,
    () => COMMAND_PALETTE_SHORTCUT_SERVER_LABEL
  )
}

export function useCommandPaletteShortcutKeys(): readonly string[] {
  return useSyncExternalStore(
    subscribeNoop,
    getCommandPaletteShortcutKeys,
    () => COMMAND_PALETTE_SHORTCUT_SERVER_KEYS
  )
}

export type KbdBadgeSize = "sm" | "md"

function isWideKey(label: string): boolean {
  return label === "Ctrl" || label === "Tab" || label === "Esc"
}

function kbdKeyClass(size: KbdBadgeSize, wide: boolean): string {
  switch (size) {
    case "sm":
      return cn(
        "h-5 min-h-5 min-w-5 rounded-[5px] border border-white/[0.08] bg-white/[0.08] px-0.5 text-[10px] text-white/55",
        wide && "min-w-7 px-1.5"
      )
    case "md":
      return cn(
        "h-[22px] min-h-[22px] min-w-[22px] rounded-[6px] border border-white/[0.08] bg-white/[0.08] px-0.5 text-[11px] text-white/60",
        wide && "min-w-8 px-1.5"
      )
    default: {
      const _exhaustive: never = size
      return _exhaustive
    }
  }
}

export function KbdBadge({
  children,
  className,
  size = "sm",
  wide,
}: Readonly<{
  children: ReactNode
  className?: string
  size?: KbdBadgeSize
  wide?: boolean
}>) {
  const label = typeof children === "string" ? children : ""
  const resolvedWide = wide ?? isWideKey(label)

  return (
    <kbd
      className={cn(
        "box-border grid shrink-0 place-items-center p-0 font-sans font-medium leading-none",
        kbdKeyClass(size, resolvedWide),
        className
      )}
    >
      <span className="block leading-none">{children}</span>
    </kbd>
  )
}

/** Renders modifier + key as separate keycaps (⌘ K or Ctrl K). */
export function KbdShortcut({
  size = "sm",
  className,
}: Readonly<{ size?: KbdBadgeSize; className?: string }>) {
  const keys = useCommandPaletteShortcutKeys()

  return (
    <span
      className={cn("flex items-center gap-1 leading-none", className)}
      aria-hidden
    >
      {keys.map((key) => (
        <KbdBadge key={key} size={size} wide={key === "Ctrl"}>
          {key}
        </KbdBadge>
      ))}
    </span>
  )
}
