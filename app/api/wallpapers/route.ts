import { InvalidCatalogQuery } from "@/lib/public-catalog/query"
import { MARKETING_CATALOG_API_CDN_SECONDS } from "@/lib/marketing-cache"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import type { PublicCatalogSort } from "@/lib/public-catalog/types"
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"

/**
 * Every response is public catalog data keyed by its URL, so the CDN can
 * answer repeats. Free-form search and deep pages skip the persistent Data
 * Cache (see `listPublicWallpapers`) and get a shorter CDN window instead.
 */
const LIST_CACHE_CONTROL = `public, s-maxage=${MARKETING_CATALOG_API_CDN_SECONDS}, stale-while-revalidate=86400`
const SEARCH_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=3600"

function parseSort(value: string | null): PublicCatalogSort {
  switch (value) {
    case "popular":
    case "older":
    case "newest":
      return value
    default:
      return "newest"
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const page = Number(searchParams.get("page") ?? "1")
  const limit = Number(searchParams.get("limit") ?? "24")

  try {
    const result = await listPublicWallpapers({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      sort: parseSort(searchParams.get("sort")),
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 24,
    })

    const isSearch =
      searchParams.has("q") || searchParams.has("tag") || page > 20

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": isSearch ? SEARCH_CACHE_CONTROL : LIST_CACHE_CONTROL,
      },
    })
  } catch (error) {
    if (error instanceof InvalidCatalogQuery) {
      return NextResponse.json(
        { error: "Invalid filters" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      )
    }
    return NextResponse.json(
      { error: "Failed to load wallpapers" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
