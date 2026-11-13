import {
  ChartNoAxesColumn,
  CloudUpload,
  Images,
  Mail,
  MessagesSquare,
  Users,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Extra words the command palette matches on. */
  keywords?: string
}

export type AdminNavGroup = {
  /** Omitted for the first, unlabelled group. */
  label?: string
  items: readonly AdminNavItem[]
}

export const ADMIN_NAV: readonly AdminNavGroup[] = [
  {
    items: [
      {
        href: "/admin",
        label: "Analytics",
        icon: ChartNoAxesColumn,
        keywords: "dashboard overview sales revenue traffic",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        href: "/admin/wallpapers",
        label: "Wallpapers",
        icon: Images,
        keywords: "catalog library videos edit",
      },
      {
        href: "/admin/uploads",
        label: "Uploads",
        icon: CloudUpload,
        keywords: "review moderation submissions bulk publish",
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        href: "/admin/feedback",
        label: "Live support",
        icon: MessagesSquare,
        keywords: "feedback chat tickets inbox messages",
      },
      {
        href: "/admin/creators",
        label: "Creators",
        icon: Users,
        keywords: "affiliates influencers deals partners",
      },
      {
        href: "/admin/emails",
        label: "Emails",
        icon: Mail,
        keywords: "templates license trial recovery",
      },
    ],
  },
]

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV.flatMap(
  (group) => group.items
)

export function isAdminNavActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`)
}
