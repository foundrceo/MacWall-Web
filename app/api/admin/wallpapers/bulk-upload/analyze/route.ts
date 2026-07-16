import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { analyzeWallpaperMetadataBatch } from "@/lib/admin/wallpaper-ai-metadata"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as { items?: unknown }
    const result = await analyzeWallpaperMetadataBatch(body.items)
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to analyze wallpaper metadata"
    console.error("[admin] wallpaper AI metadata analysis failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
