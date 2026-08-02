"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type CommandPaletteContextValue = {
  open: boolean
  session: number
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null
)

export function CommandPaletteProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [open, setOpenState] = useState(false)
  const [session, setSession] = useState(0)

  const setOpen = useCallback((nextOpen: boolean) => {
    setOpenState((current) => {
      if (nextOpen && !current) {
        setSession((value) => value + 1)
      }
      return nextOpen
    })
  }, [])

  const toggle = useCallback(() => {
    setOpenState((current) => {
      const nextOpen = !current
      if (nextOpen) {
        setSession((value) => value + 1)
      }
      return nextOpen
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        toggle()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggle])

  const value = useMemo(
    () => ({
      open,
      session,
      setOpen,
      toggle,
    }),
    [open, session, setOpen, toggle]
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette(): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider"
    )
  }
  return context
}

export function useCommandPaletteOptional():
  | CommandPaletteContextValue
  | null {
  return useContext(CommandPaletteContext)
}
