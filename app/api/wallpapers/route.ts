import { InvalidCatalogQuery } from "@/lib/public-catalog/query"
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
        "Cache-Control": searchParams.get("q") || searchParams.get("tag") || page > 20 ? "no-store" : `public, s-maxage=${MARKETING_CATALOG_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    })
  } catch (error) {
    if (error instanceof InvalidCatalogQuery) return NextResponse.json({ error: "Invalid filters" }, { status: 400, headers: { "Cache-Control": "no-store" } })
    return NextResponse.json(
      { error: "Failed to load wallpapers" },
      { status: 500 }
    )
  }
}
