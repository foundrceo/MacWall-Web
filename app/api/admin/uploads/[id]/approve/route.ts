import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  approveCommunityUpload,
  revalidateMarketingCatalog,
} from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const result = await approveCommunityUpload(id)
    await revalidateMarketingCatalog()
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
