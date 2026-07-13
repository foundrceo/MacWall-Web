"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { LogOut } from "lucide-react"

import {
  AdminAppMark,
  AdminButton,
  AdminPageIntro,
} from "@/components/admin/admin-ui"

const NAV = [
  { href: "/admin", label: "Analytics" },
  { href: "/admin/wallpapers", label: "Wallpapers" },
  { href: "/admin/uploads", label: "Uploads" },
] as const

function AdminNavLink({
  href,
  active,
  children,
}: Readonly<{
  href: string
  active: boolean
  children: ReactNode
}>) {
  return (
    <Link
      href={href}
      className={
        active
          ? "inline-flex min-h-[32px] items-center rounded-full bg-[#1d1d1f] px-4 text-[13px] text-white"
          : "inline-flex min-h-[32px] items-center rounded-full bg-[#f5f5f7] px-4 text-[13px] text-[#1d1d1f]/75 transition-colors hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
      }
    >
      {children}
    </Link>
  )
}

export function AdminShell({
  title,
  description,
  children,
}: Readonly<{
  title: string
  description?: string
  children: ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    })
    router.replace("/admin/login")
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-11 max-w-[1080px] items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="min-w-0">
            <AdminAppMark subtitle="Admin" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <AdminNavLink
                key={item.href}
                href={item.href}
                active={
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href)
                }
              >
                {item.label}
              </AdminNavLink>
            ))}
          </nav>

          <AdminButton
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-1.5"
          >
            <LogOut className="size-3.5" />
            Sign out
          </AdminButton>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              active={
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              }
            >
              {item.label}
            </AdminNavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6">
        <AdminPageIntro title={title} description={description} />
        {children}
      </main>
    </>
  )
}
