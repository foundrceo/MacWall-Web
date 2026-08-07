"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useState } from "react"
import { PanelLeft } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Analytics01Icon,
  BubbleChatIcon,
  ImageIcon,
  Logout01Icon,
  Mail01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"

import { AdminAppMark } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: IconSvgElement
}

export const ADMIN_NAV: readonly NavItem[] = [
  { href: "/admin", label: "Analytics", icon: Analytics01Icon },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: ImageIcon },
  { href: "/admin/uploads", label: "Uploads", icon: Upload01Icon },
  { href: "/admin/emails", label: "Emails", icon: Mail01Icon },
  { href: "/admin/feedback", label: "Live Support", icon: BubbleChatIcon },
]

function isNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}

function SidebarNav({
  pathname,
  onNavigate,
}: Readonly<{ pathname: string; onNavigate?: () => void }>) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      <p className="px-2.5 pt-1 pb-2 text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
        Workspace
      </p>
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = isNavActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-full px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/30",
              active
                ? "bg-[var(--admin-fill)] text-[var(--admin-fg)]"
                : "text-[var(--admin-fg-soft)] hover:bg-[var(--admin-fill)] hover:text-[var(--admin-fg)]"
            )}
          >
            <HugeiconsIcon
              icon={Icon}
              strokeWidth={active ? 2 : 1.6}
              className={cn(
                "size-[1.15rem] shrink-0",
                active
                  ? "text-[var(--admin-blue)]"
                  : "text-[var(--admin-muted)]"
              )}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function SignOutButton({ onDone }: Readonly<{ onDone?: () => void }>) {
  const router = useRouter()

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    })
    onDone?.()
    router.replace("/admin/login")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-full justify-start gap-2.5 rounded-full px-3 text-[13px] font-medium text-[var(--admin-fg-soft)]"
      onClick={() => void logout()}
    >
      <HugeiconsIcon
        icon={Logout01Icon}
        strokeWidth={1.6}
        className="size-[1.15rem] text-[var(--admin-muted)]"
      />
      Sign out
    </Button>
  )
}

export function AdminShell({
  title,
  actions,
  children,
  /** Chat-style pages that own their own scrolling and fill the viewport. */
  fill = false,
}: Readonly<{
  title: string
  actions?: ReactNode
  children: ReactNode
  fill?: boolean
}>) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col bg-[var(--admin-canvas)] md:flex-row",
        // Chat-style pages pin to the viewport so their panes scroll internally
        fill ? "h-svh overflow-hidden" : "min-h-svh"
      )}
    >
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--admin-sidebar-width)] flex-col border-r border-[var(--admin-border)] bg-white md:flex">
        <div className="flex h-[var(--admin-topbar-height)] shrink-0 items-center border-b border-[var(--admin-border)] px-4">
          <Link
            href="/admin"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/30"
          >
            <AdminAppMark subtitle="Admin" />
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <SidebarNav pathname={pathname} />
        </div>

        <div className="shrink-0 border-t border-[var(--admin-border)] p-3">
          <SignOutButton />
        </div>
      </aside>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col md:pl-[var(--admin-sidebar-width)]",
          fill ? "h-svh min-h-0 overflow-hidden" : "min-h-svh"
        )}
      >
        <header className="sticky top-0 z-20 flex h-[var(--admin-topbar-height)] shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-white/90 px-4 backdrop-blur-sm sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-ml-1 shrink-0 md:hidden"
                aria-label="Open navigation"
              >
                <PanelLeft className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="w-64 bg-white p-0"
            >
              <SheetHeader className="h-[var(--admin-topbar-height)] justify-center border-b border-[var(--admin-border)] px-4 py-0">
                <SheetTitle className="font-sans">
                  <AdminAppMark subtitle="Admin" />
                </SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col justify-between py-3">
                <SidebarNav
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
                <div className="border-t border-[var(--admin-border)] p-3">
                  <SignOutButton onDone={() => setMobileOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[var(--admin-fg)]">
            {title}
          </h1>

          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </header>

        <main
          id="main-content"
          className={cn(
            "min-w-0 flex-1",
            fill
              ? "flex min-h-0 flex-col overflow-hidden"
              : "admin-page admin-fade-in"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
