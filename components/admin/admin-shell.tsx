"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin", label: "Analytics" },
  { href: "/admin/uploads", label: "Uploads" },
] as const

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
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      <header className="border-b border-white/10 bg-[#111118]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-semibold tracking-tight"
            >
              MacWall Admin
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-white/55">{description}</p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  )
}
