import {
  getCatalogSupabaseAnonKey,
  getCatalogSupabaseOrigin,
} from "@/lib/env/catalog-supabase"
import { listPublicWallpapersForCollections } from "@/lib/public-catalog/fetch"
import {
  buildCatalogPathsPayload,
  STATIC_WALLPAPER_REDIRECT_ROWS,
  type WallpaperRedirectRow,
} from "@/lib/public-catalog/redirects"

export const dynamic = "force-static"
/**
 * The Worker keeps its copy for 10 minutes too (worker/index.ts), so a rename
 * or a new redirect rule reaches every URL within about 20. Catalog writes
 * purge the cached index this reads.
 */
export const revalidate = 600

/**
 * Rules from `public.wallpaper_redirects` once that table exists
 * (supabase/migrations/20261106_wallpaper_redirects.sql). Off until
 * `WALLPAPER_REDIRECTS_TABLE=1` is set, so nothing queries a missing table.
 * A failed read keeps the in-repo rules rather than failing the map.
 */
async function redirectRowsFromTable(): Promise<WallpaperRedirectRow[]> {
  if (process.env.WALLPAPER_REDIRECTS_TABLE?.trim() !== "1") return []
  const origin = getCatalogSupabaseOrigin()
  if (!origin) return []
  try {
    const key = getCatalogSupabaseAnonKey()
    const params = new URLSearchParams({
      select: "old_path,target_path,status",
      limit: "5000",
    })
    const res = await fetch(`${origin}/rest/v1/wallpaper_redirects?${params}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = (await res.json()) as unknown
    return Array.isArray(rows) ? (rows as WallpaperRedirectRow[]) : []
  } catch (error) {
    console.error(
      "[catalog paths] wallpaper_redirects read failed:",
      error instanceof Error ? error.message : error
    )
    return []
  }
}

/**
 * `{ byId, redirects, removedIds }` for the Worker's detail-URL redirects:
 * every public wallpaper's canonical path (the sitemap URL) plus the rules for
 * renamed and removed wallpapers. Public data, the same paths as the sitemap.
 */
export async function GET(): Promise<Response> {
  let wallpapers: Awaited<ReturnType<typeof listPublicWallpapersForCollections>>
  try {
    wallpapers = await listPublicWallpapersForCollections()
  } catch (error) {
    console.error(
      "[catalog paths] catalog read failed:",
      error instanceof Error ? error.message : error
    )
    return Response.json(
      { error: "Catalog unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }

  const rows = [
    ...STATIC_WALLPAPER_REDIRECT_ROWS,
    ...(await redirectRowsFromTable()),
  ]

  return Response.json(buildCatalogPathsPayload(wallpapers, rows), {
    headers: {
      "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=3600`,
      "X-Robots-Tag": "noindex",
    },
  })
}
