import type { IconSvgElement } from "@hugeicons/react"
import {
  Analytics01Icon,
  BubbleChatIcon,
  ImageIcon,
  Mail01Icon,
  Upload01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

export type AdminNavGroup = "Overview" | "Growth" | "Catalog" | "Comms"

export type AdminNavItem = {
  href: string
  label: string
  icon: IconSvgElement
  group: AdminNavGroup
}

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
  "Overview",
  "Growth",
  "Catalog",
  "Comms",
]

export const ADMIN_NAV: readonly AdminNavItem[] = [
  {
    href: "/admin",
    label: "Analytics",
    icon: Analytics01Icon,
    group: "Overview",
  },
  {
    href: "/admin/creators",
    label: "Creators",
    icon: UserGroupIcon,
    group: "Growth",
  },
  {
    href: "/admin/wallpapers",
    label: "Wallpapers",
    icon: ImageIcon,
    group: "Catalog",
  },
  {
    href: "/admin/uploads",
    label: "Uploads",
    icon: Upload01Icon,
    group: "Catalog",
  },
  { href: "/admin/emails", label: "Emails", icon: Mail01Icon, group: "Comms" },
  {
    href: "/admin/feedback",
    label: "Live Support",
    icon: BubbleChatIcon,
    group: "Comms",
  },
]

export function isAdminNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}
