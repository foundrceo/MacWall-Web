import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { listPublicStaticWallpapers } from "@/lib/static-wallpapers/list"

export const runtime = "nodejs"

export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const images = await listPublicStaticWallpapers()
    return NextResponse.json({
      prefix: "static-wallpapers/",
      count: images.length,
      images: images.map((image) => ({
        key: image.key,
        fileName: image.fileName,
        sizeBytes: image.sizeBytes,
        lastModified: image.lastModified,
        publicUrl: image.imageUrl,
      })),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list static wallpapers"
    console.error("[admin] static wallpaper list failed:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
