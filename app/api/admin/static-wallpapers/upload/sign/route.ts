import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { createStaticWallpaperSignedUploadBatch } from "@/lib/admin/static-wallpaper-upload"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as { items?: unknown }
    const result = await createStaticWallpaperSignedUploadBatch(body.items)
    console.info(
      "[admin] static wallpaper sign ok:",
      result.uploads.length,
      "image(s)"
    )
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare uploads"
    console.error("[admin] static wallpaper sign failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
