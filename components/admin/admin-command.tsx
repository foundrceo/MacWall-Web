"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { ADMIN_NAV } from "@/components/admin/admin-nav"
import { KbdShortcut } from "@/components/command-palette/kbd-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AdminCommandContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AdminCommandContext = createContext<AdminCommandContextValue | null>(null)

export function useAdminCommand() {
  const value = useContext(AdminCommandContext)
  if (!value) {
    throw new Error("useAdminCommand must be used within AdminCommandProvider")
  }
  return value
}

export function AdminCommandProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const enabled = pathname.startsWith("/admin") && pathname !== "/admin/login"

  // Navigating away closes the palette. Adjusting state during render rather
  // than in an effect avoids a second render pass with the dialog still open.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    if (open) setOpen(false)
  }

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled])

  const value = useMemo(() => ({ open, setOpen }), [open])

  return (
    <AdminCommandContext.Provider value={value}>
      {children}
      {enabled ? <AdminCommandDialog /> : null}
    </AdminCommandContext.Provider>
  )
}

function AdminCommandDialog() {
  const { open, setOpen } = useAdminCommand()
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const onOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setQuery("")
        setActiveIndex(0)
      }
    },
    [setOpen]
  )

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return [...ADMIN_NAV]
    return ADMIN_NAV.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.href.toLowerCase().includes(needle)
    )
  }, [query])

  useEffect(() => {
    if (!open) return
    const el = document.getElementById(`${listId}-option-${activeIndex}`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open, listId])

  const go = useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [router, onOpenChange]
  )

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((i) => (items.length === 0 ? 0 : (i + 1) % items.length))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((i) =>
        items.length === 0 ? 0 : (i - 1 + items.length) % items.length
      )
    } else if (event.key === "Home") {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === "End") {
      event.preventDefault()
      setActiveIndex(Math.max(0, items.length - 1))
    } else if (event.key === "Enter") {
      const target = items[activeIndex]
      if (target) {
        event.preventDefault()
        go(target.href)
      }
    }
  }

  const activeDescendant =
    items.length > 0 ? `${listId}-option-${activeIndex}` : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] translate-y-0 gap-0 overflow-hidden border-[var(--admin-border)] bg-[var(--admin-surface)] p-0 shadow-[var(--admin-shadow-pop)] sm:max-w-md"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Jump to</DialogTitle>
          <DialogDescription>
            Search admin pages. Use arrow keys to move, Enter to open.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] px-3">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={1.6}
            aria-hidden
            className="size-4 shrink-0 text-[var(--admin-muted)]"
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Jump to a page…"
            aria-label="Jump to a page"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            className="h-11 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:outline-none"
          />
          <KbdShortcut />
        </div>
        <ul
          id={listId}
          role="listbox"
          aria-label="Admin pages"
          className="admin-scroll max-h-72 overflow-y-auto p-2"
        >
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-[13px] text-[var(--admin-muted)]">
              No pages match “{query.trim()}”.
            </li>
          ) : (
            items.map((item, idx) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              const highlighted = idx === activeIndex
              return (
                <li key={item.href} role="presentation">
                  <button
                    id={`${listId}-option-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={highlighted}
                    aria-current={active ? "page" : undefined}
                    onClick={() => go(item.href)}
                    onMouseMove={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] outline-none transition-colors",
                      highlighted
                        ? "bg-[var(--admin-fill)] text-[var(--admin-fg)]"
                        : active
                          ? "bg-[var(--admin-fill)]/50 text-[var(--admin-fg)]"
                          : "text-[var(--admin-fg-soft)] hover:bg-[var(--admin-fill)] hover:text-[var(--admin-fg)]"
                    )}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      strokeWidth={highlighted || active ? 2 : 1.6}
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0",
                        highlighted || active
                          ? "text-[var(--admin-blue-fg)]"
                          : "text-[var(--admin-muted)]"
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {item.label}
                    </span>
                    {active ? (
                      <span className="shrink-0 text-[11px] text-[var(--admin-muted)]">
                        current
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
        <div className="flex items-center gap-3 border-t border-[var(--admin-border)] px-3 py-2 text-[11px] text-[var(--admin-muted)]">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-[var(--admin-border)] bg-[var(--admin-fill)] px-1 font-sans">↑↓</kbd>
            move
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-[var(--admin-border)] bg-[var(--admin-fill)] px-1 font-sans">↵</kbd>
            open
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-[var(--admin-border)] bg-[var(--admin-fill)] px-1 font-sans">esc</kbd>
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
