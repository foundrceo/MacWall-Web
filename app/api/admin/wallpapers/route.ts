import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  fetchWallpaperCategoryCounts,
  listAdminWallpapers,
  type WallpaperSort,
} from "@/lib/admin/wallpapers"

const SORT_OPTIONS: WallpaperSort[] = [
  "likes_desc",
  "likes_asc",
  "name_asc",
  "name_desc",
  "created_desc",
  "created_asc",
]

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") ?? undefined
    const category = searchParams.get("category") ?? undefined
    const sortParam = searchParams.get("sort") ?? "likes_desc"
    const sort = SORT_OPTIONS.includes(sortParam as WallpaperSort)
      ? (sortParam as WallpaperSort)
      : "likes_desc"
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
    const limit = Number.parseInt(searchParams.get("limit") ?? "40", 10) || 40
    const includeStats = searchParams.get("stats") === "1"

    const [listResult, categoryCounts] = await Promise.all([
      listAdminWallpapers({ q, category, sort, page, limit }),
      includeStats ? fetchWallpaperCategoryCounts() : Promise.resolve(null),
    ])

    return NextResponse.json({
      ...listResult,
      sort,
      q: q ?? "",
      category: category ?? "",
      categoryCounts,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load wallpapers"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
