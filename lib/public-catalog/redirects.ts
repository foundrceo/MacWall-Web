/**
 * Detail-URL canonicalisation for `/wallpaper/{category}/{slug}`.
 *
 * The Worker (worker/index.ts) answers wrong-category, stale-name, bare-id,
 * uppercase and trailing-slash URLs with one 308 to the sitemap URL, and
 * removed wallpapers with a 308 or a 410, before vinext renders anything. It
 * reads the map below from `GET /api/catalog/paths`.
 *
 * Imported by the Worker entry, so no server-only or Next imports here.
 */
import {
  categoryNameFromSlug,
  categorySlugFromName,
} from "@/lib/seo/category-slugs"
import {
  wallpaperDetailPath,
  wallpaperIdFromDetailSlug,
} from "@/lib/public-catalog/urls"

/** Route that serves `CatalogPathsPayload` (app/api/catalog/paths/route.ts). */
export const CATALOG_PATHS_API_PATH = "/api/catalog/paths"

/** A renamed or removed wallpaper URL: 308 to its replacement, or 410 Gone. */
export type WallpaperRedirect =
  { status: 308; target: string } | { status: 410; target: null }

/**
 * One redirect rule, shaped like a row of `public.wallpaper_redirects`
 * (supabase/migrations/20261106_wallpaper_redirects.sql). Renamed wallpapers
 * go to the new detail page, removed ones to their collection or category,
 * legal takedowns get a 410.
 */
export type WallpaperRedirectRow = {
  /** `/wallpaper/{category}/{slug}`, matched case-insensitively. */
  old_path: string
  /** Site path for a 308; null for a 410. */
  target_path: string | null
  status: number
  reason?: string | null
}

/** What the Worker needs to canonicalise detail URLs. */
export type CatalogPathsPayload = {
  /** Lowercased catalog id → canonical detail path (the sitemap URL). */
  byId: Record<string, string>
  /** Lowercased old detail path → rule. */
  redirects: Record<string, WallpaperRedirect>
  /** Lowercased id of a removed wallpaper → rule, whatever path carries it. */
  removedIds: Record<string, WallpaperRedirect>
}

/**
 * In-repo rules. A rule whose path still resolves to a live wallpaper is
 * dropped (the live page wins), so stale entries are harmless.
 */
export const STATIC_WALLPAPER_REDIRECT_ROWS: readonly WallpaperRedirectRow[] = [
  {
    old_path:
      "/wallpaper/heroes/i-am-ironman-8c6c8a32-9432-42f2-aebb-fd562b7220b6",
    target_path: "/wallpaper/heroes/iron-man-9d16c780",
    status: 308,
    reason: "Removed; closest live match, old URL still gets search referrals",
  },
  {
    old_path: "/wallpaper/space/accretion-disk-black-hole",
    target_path: "/wallpaper/space/gargantua-accretion-disk",
    status: 308,
    reason: "Removed; closest live match, old URL still gets search referrals",
  },
]

/** Catalog ids taken down for legal reasons: 410 under any category or name. */
export const REMOVED_WALLPAPER_ID_RULES: Readonly<
  Record<string, WallpaperRedirect>
> = {
  "rainy-parking-lot": { status: 410, target: null },
}

const DETAIL_PATH_RE = /^\/wallpaper\/([^/]+)\/([^/.]+)\/?$/

/** `{ category, slug }` of a detail path, or null for any other path. */
export function parseWallpaperDetailPath(
  pathname: string
): { category: string; slug: string } | null {
  const match = DETAIL_PATH_RE.exec(pathname)
  if (!match) return null
  return { category: match[1], slug: match[2] }
}

/** Lowercase, no trailing slash: the key both maps use. */
function detailKey(category: string, slug: string): string {
  return `/wallpaper/${category}/${slug}`.toLowerCase()
}

/** Site-relative paths only, so a rule can never become an open redirect. */
function isSitePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")
}

/** A validated rule from a row, or null when the row is malformed. */
export function wallpaperRedirectFromRow(
  row: WallpaperRedirectRow
): { key: string; rule: WallpaperRedirect } | null {
  const parsed = parseWallpaperDetailPath(row.old_path.trim())
  if (!parsed) return null
  const key = detailKey(parsed.category, parsed.slug)
  if (row.status === 410) return { key, rule: { status: 410, target: null } }
  const target = row.target_path?.trim()
  if (row.status !== 308 || !target || !isSitePath(target)) return null
  if (target.toLowerCase() === key) return null
  return { key, rule: { status: 308, target } }
}

/**
 * The map `/api/catalog/paths` serves: every public wallpaper's canonical
 * path, plus the rules for URLs that no longer resolve.
 */
export function buildCatalogPathsPayload(
  wallpapers: readonly { id: string; name: string; category: string }[],
  rows: readonly WallpaperRedirectRow[]
): CatalogPathsPayload {
  const byId: Record<string, string> = {}
  for (const wallpaper of wallpapers) {
    const id = wallpaper.id.trim().toLowerCase()
    if (id && !(id in byId)) byId[id] = wallpaperDetailPath(wallpaper)
  }

  const redirects: Record<string, WallpaperRedirect> = {}
  for (const row of rows) {
    const entry = wallpaperRedirectFromRow(row)
    if (!entry) continue
    const slug = entry.key.slice(entry.key.lastIndexOf("/") + 1)
    // The id still resolves, so its canonical page answers instead.
    if (wallpaperIdFromDetailSlug(slug) in byId) continue
    redirects[entry.key] = entry.rule
  }

  const removedIds: Record<string, WallpaperRedirect> = {}
  for (const [id, rule] of Object.entries(REMOVED_WALLPAPER_ID_RULES)) {
    if (!(id in byId)) removedIds[id] = rule
  }

  return { byId, redirects, removedIds }
}

/** True when a parsed JSON body has the payload's shape. */
export function isCatalogPathsPayload(
  value: unknown
): value is CatalogPathsPayload {
  if (!value || typeof value !== "object") return false
  const { byId, redirects, removedIds } = value as Record<string, unknown>
  return [byId, redirects, removedIds].every(
    (map) => Boolean(map) && typeof map === "object" && !Array.isArray(map)
  )
}

export type WallpaperDetailEdgeDecision =
  /** Send the request here (a site path) with a 308. */
  | { kind: "redirect"; location: string }
  /** 410 Gone, linking to `hubPath`. */
  | { kind: "gone"; hubPath: string; categoryName: string | null }

/** `/wallpapers/{category}` for a known (or retired) category slug. */
function categoryHub(categorySlug: string): {
  hubPath: string
  categoryName: string | null
} {
  const name = categoryNameFromSlug(categorySlug.toLowerCase())
  const slug = name ? categorySlugFromName(name) : undefined
  return slug
    ? { hubPath: `/wallpapers/${slug}`, categoryName: name ?? null }
    : { hubPath: "/wallpapers", categoryName: null }
}

/**
 * Own-property lookup: the maps come from JSON.parse, so a slug like
 * `constructor` or `__proto__` must not match Object.prototype.
 */
function own<T>(map: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** A site detail path, the only thing the Worker may redirect to. */
function detailLocation(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/wallpaper/")
    ? value
    : undefined
}

/** A 308 target, moved on to its live canonical path when it is a detail URL. */
function resolveTarget(target: string, paths: CatalogPathsPayload): string {
  const parsed = parseWallpaperDetailPath(target)
  if (!parsed) return target
  return (
    detailLocation(
      own(paths.byId, wallpaperIdFromDetailSlug(parsed.slug.toLowerCase()))
    ) ?? target
  )
}

/**
 * What the Worker does with a detail URL: one 308 to the canonical path, a 410
 * for a takedown, or null to let vinext render it (the canonical URL itself,
 * or an id the map doesn't know, which renders or 404s as usual).
 */
export function resolveWallpaperDetailRequest(
  pathname: string,
  paths: CatalogPathsPayload
): WallpaperDetailEdgeDecision | null {
  const parsed = parseWallpaperDetailPath(pathname)
  if (!parsed) return null

  const key = detailKey(parsed.category, parsed.slug)
  const id = wallpaperIdFromDetailSlug(parsed.slug.toLowerCase())
  const rule = own(paths.redirects, key) ?? own(paths.removedIds, id)

  if (rule?.status === 410) {
    return { kind: "gone", ...categoryHub(parsed.category) }
  }
  const location =
    rule?.status === 308
      ? resolveTarget(rule.target, paths)
      : detailLocation(own(paths.byId, id))
  if (!location || location === pathname) return null
  return { kind: "redirect", location }
}
