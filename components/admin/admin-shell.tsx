"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import { PanelLeft, Search } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { useAdminCommand } from "@/components/admin/admin-command"
import {
  adminPageTransition,
  adminSpring,
} from "@/components/admin/admin-motion"
import {
  ADMIN_NAV,
  ADMIN_NAV_GROUPS,
  isAdminNavActive,
} from "@/components/admin/admin-nav"
import { AdminAppMark, AdminStatusDot } from "@/components/admin/admin-ui"
import { KbdShortcut } from "@/components/command-palette/kbd-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function SidebarNav({
  pathname,
  replyCount,
  onNavigate,
}: Readonly<{
  pathname: string
  replyCount: number
  onNavigate?: () => void
}>) {
  const reduceMotion = useReducedMotion()

  return (
    <nav className="flex flex-col gap-4 px-3" aria-label="Admin primary">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV.filter((item) => item.group === group)
        if (items.length === 0) return null
        return (
          <div key={group}>
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold tracking-[0.1em] text-[var(--admin-muted)] uppercase">
              {group}
            </p>
            <LayoutGroup id={`admin-sidebar-nav-${group}`}>
              <div className="flex flex-col gap-0.5">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = isAdminNavActive(pathname, href)
                  const badge =
                    href === "/admin/feedback" && replyCount > 0
                      ? replyCount
                      : 0

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium transition-colors outline-none",
                        active
                          ? "text-[var(--admin-fg)]"
                          : "text-[var(--admin-fg-soft)] hover:bg-[var(--admin-fill)]/70 hover:text-[var(--admin-fg)]"
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId={reduceMotion ? undefined : "admin-nav-pill"}
                          className="absolute inset-0 rounded-xl border border-[var(--admin-border)] bg-gradient-to-b from-[var(--admin-fill-hover)] to-[var(--admin-fill)]"
                          transition={adminSpring}
                        />
                      ) : null}
                      {active ? (
                        <motion.span
                          layoutId={reduceMotion ? undefined : "admin-nav-bar"}
                          className="admin-nav-glow absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--admin-blue)]"
                          transition={adminSpring}
                        />
                      ) : null}
                      <HugeiconsIcon
                        icon={Icon}
                        strokeWidth={active ? 2 : 1.6}
                        aria-hidden
                        className={cn(
                          "relative size-[1.15rem] shrink-0 transition-colors",
                          active
                            ? "text-[var(--admin-blue-fg)]"
                            : "text-[var(--admin-muted)] group-hover:text-[var(--admin-fg-soft)]"
                        )}
                      />
                      <span className="relative min-w-0 flex-1 truncate">
                        {label}
                      </span>
                      {badge > 0 ? (
                        <span className="relative inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--admin-blue)] px-1.5 text-[10px] leading-4 font-semibold text-white tabular-nums">
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </LayoutGroup>
          </div>
        )
      })}
    </nav>
  )
}

function SignOutButton({ onDone }: Readonly<{ onDone?: () => void }>) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function logout() {
    if (pending) return
    setPending(true)
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      })
      onDone?.()
      router.replace("/admin/login")
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-full justify-start gap-2.5 rounded-xl px-3 text-[13px] font-medium text-[var(--admin-fg-soft)] hover:text-[var(--admin-fg)]"
      onClick={() => void logout()}
      disabled={pending}
    >
      <HugeiconsIcon
        icon={Logout01Icon}
        strokeWidth={1.6}
        aria-hidden
        className="size-[1.15rem] text-[var(--admin-muted)]"
      />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  )
}

function useSupportReplyCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Don't poll hidden tabs — the inbox SSE owns liveness when visible.
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

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
  /** Chat-style pages that own their own scrolling and fill the viewport. */
  fill = false,
  largeTitle = false,
}: Readonly<{
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  fill?: boolean
  largeTitle?: boolean
}>) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { setOpen } = useAdminCommand()
  const [menuOpen, setMenuOpen] = useState(false)
  const replyCount = useSupportReplyCount()

  useEffect(() => {
    document.title = `${title} · Admin`
  }, [title])

  return (
    <div
      className={cn(
        "flex flex-col bg-[var(--admin-canvas)] md:flex-row",
        fill ? "h-svh overflow-hidden" : "min-h-svh"
      )}
    >
      <a href="#main-content" className="admin-skip-link">
        Skip to admin content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--admin-sidebar-width)] flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)]/95 backdrop-blur-md md:flex">
        <div className="flex h-[var(--admin-topbar-height)] shrink-0 items-center border-b border-[var(--admin-border)] px-4">
          <Link
            href="/admin"
            className="rounded-lg outline-none"
            aria-label="MacWall admin home"
          >
            <AdminAppMark subtitle="Admin" />
          </Link>
        </div>

        <div className="admin-scroll min-h-0 flex-1 overflow-y-auto py-3">
          <SidebarNav pathname={pathname} replyCount={replyCount} />
        </div>

        <div className="shrink-0 space-y-1 border-t border-[var(--admin-border)] p-3">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2">
            <AdminStatusDot
              tone="green"
              pulse
              label="Admin services reachable"
            />
            <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-[var(--admin-muted)]">
              All systems normal
            </p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col md:pl-[var(--admin-sidebar-width)]",
          fill ? "h-svh min-h-0 overflow-hidden" : "min-h-svh"
        )}
      >
        <header className="admin-topbar sticky top-0 z-20 flex h-[var(--admin-topbar-height)] shrink-0 items-center gap-2 border-b border-[var(--admin-border)] px-3 sm:gap-3 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-ml-1 shrink-0 md:hidden"
                aria-label="Open navigation"
              >
                <PanelLeft className="size-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-[var(--admin-surface)] p-0"
            >
              <SheetHeader className="h-[var(--admin-topbar-height)] justify-center border-b border-[var(--admin-border)] px-4 py-0 text-left">
                <SheetTitle className="font-sans">
                  <AdminAppMark subtitle="Admin" />
                </SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col justify-between py-3">
                <SidebarNav
                  pathname={pathname}
                  replyCount={replyCount}
                  onNavigate={() => setMenuOpen(false)}
                />
                <div className="border-t border-[var(--admin-border)] p-3">
                  <SignOutButton onDone={() => setMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                "truncate font-semibold tracking-tight text-[var(--admin-fg)]",
                largeTitle ? "text-xl sm:text-2xl" : "text-[15px]"
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <p className="hidden truncate text-xs text-[var(--admin-muted)] sm:block">
                {subtitle}
              </p>
            ) : null}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden h-8 shrink-0 gap-2 rounded-full px-2.5 text-[12px] text-[var(--admin-muted)] sm:inline-flex"
                onClick={() => setOpen(true)}
                aria-label="Jump to a page (Command K)"
              >
                <Search className="size-3.5" aria-hidden />
                <KbdShortcut />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Jump to a page</TooltipContent>
          </Tooltip>

          {actions ? (
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : null}
        </header>

        <motion.main
          id="main-content"
          tabIndex={-1}
          initial={reduceMotion ? false : { opacity: 0, y: fill ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={adminPageTransition}
          className={cn(
            "min-w-0 flex-1 outline-none",
            fill ? "flex min-h-0 flex-col overflow-hidden" : "admin-page"
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
