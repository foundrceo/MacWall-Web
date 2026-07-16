import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { createCatalogSignedUploadBatch } from "@/lib/admin/catalog-bulk-upload"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as { items?: unknown }
    const result = await createCatalogSignedUploadBatch(body.items)
    console.info(
      "[admin] bulk catalog sign ok:",
      result.uploads.length,
      "wallpaper(s)"
    )
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare uploads"
    console.error("[admin] bulk catalog sign failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
