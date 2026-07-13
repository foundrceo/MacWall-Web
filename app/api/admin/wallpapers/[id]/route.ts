import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { revalidateMarketingCatalog } from "@/lib/admin/uploads"
import {
  getAdminWallpaper,
  updateAdminWallpaper,
  type AdminWallpaperUpdate,
} from "@/lib/admin/wallpapers"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const wallpaper = await getAdminWallpaper(id)
    if (!wallpaper) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ wallpaper })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load wallpaper"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const body = (await request.json()) as AdminWallpaperUpdate

    const wallpaper = await updateAdminWallpaper(id, {
      name: typeof body.name === "string" ? body.name : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      isPro: typeof body.isPro === "boolean" ? body.isPro : undefined,
      isFeatured:
        typeof body.isFeatured === "boolean" ? body.isFeatured : undefined,
      isCuratedPick:
        typeof body.isCuratedPick === "boolean"
          ? body.isCuratedPick
          : undefined,
    })

    await revalidateMarketingCatalog()

    return NextResponse.json({ wallpaper })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update wallpaper"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
