import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { publishStaticWallpapersIndex } from "@/lib/static-wallpapers/publish-index"

export const runtime = "nodejs"
export const maxDuration = 60

/** Rebuild `static-wallpapers/index.json` after admin still-image uploads. */
export async function POST() {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const index = await publishStaticWallpapersIndex()
    console.info(
      "[admin] static wallpaper index published:",
      index.count,
      "image(s)"
    )
    return NextResponse.json({
      published: true,
      count: index.count,
      generatedAt: index.generatedAt,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to publish index"
    console.error("[admin] static wallpaper index publish failed:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
