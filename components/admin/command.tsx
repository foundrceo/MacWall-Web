"use client"

import { useRouter } from "next/navigation"
import { ArrowUpRight, CornerDownLeft, LogOut, Search } from "lucide-react"
import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import { ADMIN_NAV } from "@/components/admin/nav"
import { Kbd } from "@/components/admin/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type CommandItem = {
  id: string
  group: string
  label: string
  keywords: string
  icon: ReactNode
  run: () => void
}

/** ⌘K palette: jump to a page or run a console-wide action. */
export function AdminCommand({
  open,
  onOpenChange,
  onSignOut,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignOut: () => void
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[16%] translate-y-0 gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-[520px]"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search for a page or an action, then press Enter.
        </DialogDescription>
        {/* Mounted per open, so the query and highlight start fresh. */}
        <CommandList
          onClose={() => onOpenChange(false)}
          onSignOut={onSignOut}
        />
      </DialogContent>
    </Dialog>
  )
}

function CommandList({
  onClose,
  onSignOut,
}: Readonly<{ onClose: () => void; onSignOut: () => void }>) {
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo<CommandItem[]>(() => {
    const pages = ADMIN_NAV.flatMap((group) =>
      group.items.map((item) => {
        const Icon = item.icon
        return {
          id: item.href,
          group: "Go to",
          label: item.label,
          keywords: `${item.label} ${item.keywords ?? ""}`.toLowerCase(),
          icon: <Icon aria-hidden />,
          run: () => router.push(item.href),
        }
      })
    )
    return [
      ...pages,
      {
        id: "view-website",
        group: "Actions",
        label: "View website",
        keywords: "view website open site macwall.app",
        icon: <ArrowUpRight aria-hidden />,
        run: () => window.open("/", "_blank", "noopener"),
      },
      {
        id: "sign-out",
        group: "Actions",
        label: "Sign out",
        keywords: "sign out log out logout",
        icon: <LogOut aria-hidden />,
        run: onSignOut,
      },
    ]
  }, [router, onSignOut])

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return items
    return items.filter((item) =>
      terms.every((term) => item.keywords.includes(term))
    )
  }, [items, query])

  const active = Math.min(activeIndex, Math.max(0, results.length - 1))

  function run(item: CommandItem | undefined) {
    if (!item) return
    onClose()
    item.run()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex(results.length ? (active + 1) % results.length : 0)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex(
        results.length ? (active - 1 + results.length) % results.length : 0
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      run(results[active])
    }
  }

  const groups = [...new Set(results.map((item) => item.group))]

  return (
    <>
      <div className="flex h-12 items-center gap-2.5 border-b border-border px-4">
        <Search aria-hidden className="text-faint size-4 shrink-0" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={
            results[active] ? `${listId}-${results[active].id}` : undefined
          }
          aria-label="Search pages and actions"
          placeholder="Search pages and actions"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Kbd>Esc</Kbd>
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[min(50vh,340px)] overflow-y-auto p-1.5"
      >
        {results.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
            Nothing matches “{query.trim()}”.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group} role="group" aria-label={group}>
              <p
                aria-hidden
                className="text-faint px-2.5 pt-2 pb-1 text-[11px] font-medium"
              >
                {group}
              </p>
              {results
                .filter((item) => item.group === group)
                .map((item) => {
                  const index = results.indexOf(item)
                  const selected = index === active
                  return (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setActiveIndex(index)}
                      onClick={() => run(item)}
                      className={cn(
                        "flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[13px] [&_svg]:size-4 [&_svg]:shrink-0",
                        selected
                          ? "bg-fill-hover text-foreground [&_svg]:text-foreground"
                          : "text-soft [&_svg]:text-muted-foreground"
                      )}
                    >
                      {item.icon}
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      {selected ? (
                        <CornerDownLeft
                          aria-hidden
                          className="size-3.5! text-muted-foreground!"
                        />
                      ) : null}
                    </div>
                  )
                })}
            </div>
          ))
        )}
      </div>
    </>
  )
}
