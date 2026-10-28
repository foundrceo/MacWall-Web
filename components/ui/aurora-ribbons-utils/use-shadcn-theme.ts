"use client"

import * as React from "react"
import * as THREE from "three"

export type ThemeMode = "auto" | "light" | "dark"

/** Reads a colour token from :root (hex or rgb; three can't parse oklch). */
function readToken(name: string, fallback: string): THREE.Color {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  const color = new THREE.Color(fallback)
  if (value) {
    try {
      color.setStyle(value)
    } catch {
      // Keep the fallback for a format three doesn't understand.
    }
  }
  return color
}

/**
 * The site's --primary, --accent and --muted as three.js colours, plus
 * whether the page is dark. "auto" goes by the page background's lightness.
 * Client only: it reads computed styles.
 */
export function useShadcnTheme(theme: ThemeMode = "auto") {
  return React.useMemo(() => {
    const background = readToken("--background", "#000000")
    const isDark =
      theme === "dark" ||
      (theme === "auto" && background.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5)
    return {
      primaryColor: readToken("--primary", isDark ? "#fafafa" : "#111111"),
      accentColor: readToken("--accent", isDark ? "#222222" : "#e5e5e5"),
      mutedColor: readToken("--muted", isDark ? "#181818" : "#f4f4f4"),
      isDark,
    }
  }, [theme])
}
