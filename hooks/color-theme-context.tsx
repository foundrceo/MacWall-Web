"use client"

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react"

const STORAGE_KEY = "color-theme"
const VALID_THEMES = new Set(["basil", "forest", "sunny"])

function readStoredTheme(): string {
  if (typeof window === "undefined") return "sunny"
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && VALID_THEMES.has(saved)) return saved
  return "sunny"
}

function emitThemeUpdate() {
  window.dispatchEvent(new Event("macwall-color-theme"))
}

function subscribe(onChange: () => void) {
  const storage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange()
  }
  const local = () => onChange()
  window.addEventListener("storage", storage)
  window.addEventListener("macwall-color-theme", local)
  return () => {
    window.removeEventListener("storage", storage)
    window.removeEventListener("macwall-color-theme", local)
  }
}

function getSnapshot() {
  return readStoredTheme()
}

function getServerSnapshot() {
  return "sunny"
}

type ColorThemeContextType = {
  colorTheme: string
  setColorTheme: (theme: string) => void
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(
  undefined
)

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const colorTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const setColorTheme = useCallback((theme: string) => {
    if (!VALID_THEMES.has(theme)) return
    localStorage.setItem(STORAGE_KEY, theme)
    emitThemeUpdate()
  }, [])

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error("useColorTheme must be used within ColorThemeProvider")
  }
  return context
}
