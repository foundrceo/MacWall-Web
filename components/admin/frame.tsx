"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowUpRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import { AdminCommand } from "@/components/admin/command"
import { ADMIN_NAV, isAdminNavActive } from "@/components/admin/nav"
import { Kbd } from "@/components/admin/ui"
import { useCommandPaletteShortcutKeys } from "@/components/command-palette/kbd-badge"
import { MacWallAppIcon } from "@/components/macwall-app-icon"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* ----------------------------------------------------------------------------
 * Sidebar collapse, remembered per browser.
 * -------------------------------------------------------------------------- */

const SIDEBAR_KEY = "macwall-admin-sidebar"
const sidebarListeners = new Set<() => void>()

function subscribeSidebar(listener: () => void) {
  sidebarListeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    sidebarListeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function readSidebarCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === "collapsed"
  } catch {
    return false
  }
}

function writeSidebarCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(
      SIDEBAR_KEY,
      collapsed ? "collapsed" : "expanded"
    )
  } catch {
    // Private mode: the choice just won't survive a reload.
  }
  sidebarListeners.forEach((listener) => listener())
}

/* ----------------------------------------------------------------------------
 * Tickets waiting on a reply, shown on the Live support nav item.
 * -------------------------------------------------------------------------- */

function useAwaitingReplyCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Hidden tabs don't poll; the inbox stream owns liveness when visible.
      if (document.hidden) return
      try {
        const res = await fetch("/api/admin/feedback?totals=1", {
          credentials: "same-origin",
        })
        if (!res.ok) return
        const json = (await res.json()) as {
          totals?: { awaitingReply?: number }
        }
        if (!cancelled) setCount(json.totals?.awaitingReply ?? 0)
      } catch {
        // Keep the last known count; the inbox itself surfaces errors.
      }
    }

    void load()
    const timer = window.setInterval(() => void load(), 30_000)
    const onVisible = () => void load()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return count
}

/* ----------------------------------------------------------------------------
 * Frame
 * -------------------------------------------------------------------------- */

/** Persistent chrome for every signed-in admin page: sidebar, ⌘K, main area. */
export function AdminFrame({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter()
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    readSidebarCollapsed,
    () => false
  )
  const [commandOpen, setCommandOpen] = useState(false)
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const awaitingReply = useAwaitingReplyCount()

  // The drawer is open only for the page it was opened on, so following a
  // link closes it without an effect.
  const drawerOpen = drawerPath === pathname

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return
      }
      event.preventDefault()
      setCommandOpen((open) => !open)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const signOut = useCallback(async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      })
      router.replace("/admin/login")
    } finally {
      setSigningOut(false)
    }
  }, [router, signingOut])

  const sidebarProps = {
    pathname,
    awaitingReply,
    signingOut,
    onSearch: () => setCommandOpen(true),
    onSignOut: () => void signOut(),
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <aside
        aria-label="Admin"
        className={cn(
          "hidden shrink-0 flex-col border-r border-border transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex",
          collapsed ? "w-[57px]" : "w-[236px]"
        )}
      >
        <Sidebar
          {...sidebarProps}
          collapsed={collapsed}
          onToggleCollapsed={() => writeSidebarCollapsed(!collapsed)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-2 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setDrawerPath(pathname)}
            className="text-soft hover:bg-fill flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu aria-hidden className="size-[18px]" />
          </button>
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MacWallAppIcon size={22} />
            <span className="text-sm font-semibold tracking-[-0.01em]">
              MacWall
            </span>
          </Link>
          <button
            type="button"
            aria-label="Search pages and actions"
            onClick={() => setCommandOpen(true)}
            className="text-soft hover:bg-fill ml-auto flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search aria-hidden className="size-[18px]" />
          </button>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          // `relative`: sr-only text and Radix's hidden inputs are absolutely
          // positioned; without a positioned scroll container they stretch
          // the document and the page scrolls behind the frame.
          className="relative min-h-0 flex-1 overflow-y-auto outline-none"
        >
          {children}
        </main>
      </div>

      <Sheet
        open={drawerOpen}
        onOpenChange={(open) => setDrawerPath(open ? pathname : null)}
      >
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[264px]! gap-0 border-border bg-background p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Admin pages and account actions.
          </SheetDescription>
          <Sidebar
            {...sidebarProps}
            collapsed={false}
            onNavigate={() => setDrawerPath(null)}
            onSearch={() => {
              setDrawerPath(null)
              setCommandOpen(true)
            }}
          />
        </SheetContent>
      </Sheet>

      <AdminCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSignOut={() => void signOut()}
      />
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Sidebar
 * -------------------------------------------------------------------------- */

const rowClass =
  "group relative flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0"
const rowIdle = "text-muted-foreground hover:bg-fill hover:text-foreground"
const rowActive = "bg-fill-hover text-foreground"

/** In the collapsed rail a row is only an icon, so it gets a tooltip. */
function RailTip({
  label,
  enabled,
  children,
}: Readonly<{ label: string; enabled: boolean; children: ReactNode }>) {
  if (!enabled) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function Sidebar({
  pathname,
  collapsed,
  awaitingReply,
  signingOut,
  onSearch,
  onSignOut,
  onNavigate,
  onToggleCollapsed,
}: Readonly<{
  pathname: string
  collapsed: boolean
  awaitingReply: number
  signingOut: boolean
  onSearch: () => void
  onSignOut: () => void
  /** Drawer only: close after following a link. */
  onNavigate?: () => void
  /** Desktop rail only. */
  onToggleCollapsed?: () => void
}>) {
  const shortcutKeys = useCommandPaletteShortcutKeys()
  const hideLabel = collapsed ? "sr-only" : "min-w-0 flex-1 truncate text-left"

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex h-14 shrink-0 items-center px-3")}>
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="MacWall admin home"
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
            collapsed ? "mx-auto p-1" : "px-1.5 py-1"
          )}
        >
          <MacWallAppIcon size={24} />
          {collapsed ? null : (
            <span className="flex min-w-0 items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                MacWall
              </span>
              <span className="text-faint text-xs">Admin</span>
            </span>
          )}
        </Link>
      </div>

      <div className="shrink-0 px-3 pb-2">
        <RailTip label="Search" enabled={collapsed}>
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search pages and actions"
            className={cn(
              "bg-fill/50 hover:border-line-strong flex h-8 w-full items-center gap-2 rounded-lg border border-border text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              collapsed ? "justify-center" : "px-2.5"
            )}
          >
            <Search aria-hidden className="size-3.5 shrink-0" />
            {collapsed ? null : (
              <>
                <span className="flex-1 text-left">Search</span>
                <span aria-hidden className="flex items-center gap-0.5">
                  {shortcutKeys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </>
            )}
          </button>
        </RailTip>
      </div>

      <nav
        aria-label="Admin pages"
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
      >
        {ADMIN_NAV.map((group, groupIndex) => (
          <div
            key={group.label ?? "main"}
            className={cn(groupIndex > 0 && "mt-4")}
          >
            {group.label ? (
              collapsed ? (
                <div aria-hidden className="mx-2 mb-2 h-px bg-border" />
              ) : (
                <p className="text-faint px-2.5 pb-1.5 text-[11px] font-medium">
                  {group.label}
                </p>
              )
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href)
                const badge =
                  item.href === "/admin/feedback" ? awaitingReply : 0
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <RailTip label={item.label} enabled={collapsed}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          rowClass,
                          active ? rowActive : rowIdle,
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <Icon aria-hidden strokeWidth={active ? 2 : 1.75} />
                        <span className={hideLabel}>{item.label}</span>
                        {badge > 0 ? (
                          collapsed ? (
                            <span
                              aria-hidden
                              className="bg-blue absolute top-1.5 right-2 size-1.5 rounded-full"
                            />
                          ) : (
                            <span className="bg-blue/15 text-blue rounded-md px-1.5 py-px text-[11px] tabular-nums">
                              {badge > 99 ? "99+" : badge}
                              <span className="sr-only"> awaiting reply</span>
                            </span>
                          )
                        ) : null}
                      </Link>
                    </RailTip>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-border p-3">
        <RailTip label="View website" enabled={collapsed}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={cn(
              rowClass,
              rowIdle,
              collapsed && "justify-center px-0"
            )}
          >
            <ArrowUpRight aria-hidden strokeWidth={1.75} />
            <span className={hideLabel}>View website</span>
          </a>
        </RailTip>
        <RailTip label="Sign out" enabled={collapsed}>
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className={cn(
              rowClass,
              rowIdle,
              "disabled:pointer-events-none disabled:opacity-60",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut aria-hidden strokeWidth={1.75} />
            <span className={hideLabel}>
              {signingOut ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </RailTip>
        {onToggleCollapsed ? (
          <RailTip label="Expand sidebar" enabled={collapsed}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-expanded={!collapsed}
              className={cn(
                rowClass,
                rowIdle,
                collapsed && "justify-center px-0"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden strokeWidth={1.75} />
              ) : (
                <PanelLeftClose aria-hidden strokeWidth={1.75} />
              )}
              <span className={hideLabel}>
                {collapsed ? "Expand sidebar" : "Collapse"}
              </span>
            </button>
          </RailTip>
        ) : null}
      </div>
    </div>
  )
}
