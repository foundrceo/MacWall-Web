import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { commitCatalogUploadBatch } from "@/lib/admin/catalog-bulk-upload"
import { revalidateMarketingCatalog } from "@/lib/admin/uploads"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as { items?: unknown }
    const result = await commitCatalogUploadBatch(body.items)
    await revalidateMarketingCatalog()
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to publish wallpapers"
    console.error("[admin] bulk catalog commit failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
