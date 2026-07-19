"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Analytics01Icon,
  BubbleChatIcon,
  ImageIcon,
  Logout01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"

import {
  AdminAppMark,
  AdminButton,
  AdminFadeIn,
  AdminPageIntro,
} from "@/components/admin/admin-ui"

const NAV = [
  { href: "/admin", label: "Analytics", icon: Analytics01Icon },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: ImageIcon },
  { href: "/admin/uploads", label: "Uploads", icon: Upload01Icon },
  { href: "/admin/feedback", label: "Feedback", icon: BubbleChatIcon },
] as const

function AdminNavLink({
  href,
  active,
  icon: Icon,
  children,
}: Readonly<{
  href: string
  active: boolean
  icon?: IconSvgElement
  children: ReactNode
}>) {
  return (
    <Link
      href={href}
      className={
        active
          ? "inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-[13px] text-white"
          : "inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-[#f5f5f7] px-4 text-[13px] text-[#1d1d1f]/75 transition-all duration-200 ease-out hover:bg-[#e8e8ed] hover:text-[#1d1d1f] active:scale-[0.97]"
      }
    >
      {Icon && <HugeiconsIcon icon={Icon} className="size-3.5" />}
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
      <header className="sticky top-0 z-40 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-11 max-w-[1080px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/admin" className="min-w-0">
            <AdminAppMark subtitle="Admin" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <AdminNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
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
            <HugeiconsIcon icon={Logout01Icon} className="size-3.5" />
            Sign out
          </AdminButton>
        </div>

        <nav className="flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] md:hidden [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
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

      <main
        id="main-content"
        className="mx-auto max-w-[1080px] px-4 py-5 sm:px-6 sm:py-8 lg:py-10"
      >
        <AdminPageIntro title={title} description={description} />
        <AdminFadeIn
          key={pathname}
          className="space-y-5 sm:space-y-6 lg:space-y-8"
        >
          {children}
        </AdminFadeIn>
      </main>
    </>
  )
}
