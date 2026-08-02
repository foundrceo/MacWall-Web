export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return true

  const uaData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData
  if (uaData?.platform) {
    return /mac/i.test(uaData.platform)
  }

  if (/Mac|iPhone|iPad/i.test(navigator.platform)) {
    return true
  }

  return /Macintosh|Mac OS X/i.test(navigator.userAgent)
}

/** Combined label for aria-labels and screen readers. */
export function getCommandPaletteShortcutLabel(): string {
  return isMacPlatform() ? "⌘K" : "Ctrl+K"
}

const COMMAND_PALETTE_SHORTCUT_MAC_KEYS = ["⌘", "K"] as const
const COMMAND_PALETTE_SHORTCUT_WIN_KEYS = ["Ctrl", "K"] as const

/** Split keys for visual keycap rendering. Returns a stable cached array per platform. */
export function getCommandPaletteShortcutKeys(): readonly string[] {
  return isMacPlatform()
    ? COMMAND_PALETTE_SHORTCUT_MAC_KEYS
    : COMMAND_PALETTE_SHORTCUT_WIN_KEYS
}

export const COMMAND_PALETTE_SHORTCUT_SERVER_LABEL = "⌘K"

export const COMMAND_PALETTE_SHORTCUT_SERVER_KEYS =
  COMMAND_PALETTE_SHORTCUT_MAC_KEYS
