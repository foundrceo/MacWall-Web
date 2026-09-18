import type { IconSvgElement } from "@hugeicons/react"
import {
  Analytics01Icon,
  BubbleChatIcon,
  ImageIcon,
  Mail01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"

export type AdminNavItem = {
  href: string
  label: string
  icon: IconSvgElement
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: "/admin", label: "Analytics", icon: Analytics01Icon },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: ImageIcon },
  { href: "/admin/uploads", label: "Uploads", icon: Upload01Icon },
  { href: "/admin/emails", label: "Emails", icon: Mail01Icon },
  { href: "/admin/feedback", label: "Live Support", icon: BubbleChatIcon },
]

export function isAdminNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}
