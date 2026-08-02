import { MARKETING_CATALOG_REVALIDATE_SECONDS } from "@/lib/marketing-cache"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import type { PublicCatalogSort } from "@/lib/public-catalog/types"
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"

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

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": `public, s-maxage=${MARKETING_CATALOG_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load wallpapers"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
