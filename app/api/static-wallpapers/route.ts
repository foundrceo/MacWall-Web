import { NextResponse } from "next/server"

import { listPublicStaticWallpapers } from "@/lib/static-wallpapers/list"

export const runtime = "nodejs"
export const revalidate = 300

/**
 * Public catalog of still images stored under R2 `static-wallpapers/`.
 * Used by the MacWall macOS app Static tab (no auth).
 */
export async function GET() {
  try {
    const images = await listPublicStaticWallpapers()
    return NextResponse.json(
      {
        prefix: "static-wallpapers/",
        count: images.length,
        images,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list static wallpapers"
    console.error("[public] static wallpaper list failed:", message)
    return NextResponse.json({ error: "Failed to load static wallpapers" }, {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
