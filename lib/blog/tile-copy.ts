import type { BlogCategory } from "@/lib/content/types"

/** Apple Newsroom–style uppercase eyebrow labels. */
export function blogTileEyebrow(category: BlogCategory): string {
  if (category === "wallpapers") return "MACWALL STORIES"
  return "UPDATE"
}

export function formatTileDateCurated(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTileDateAbsolute(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const day = date.getDate().toString().padStart(2, "0")
  const month = date.toLocaleDateString("en-GB", { month: "long" })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function formatTileDateRelative(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatTileDateAbsolute(iso)
}
