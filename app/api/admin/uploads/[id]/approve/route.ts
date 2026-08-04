import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  approveCommunityUpload,
  revalidateMarketingCatalog,
} from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    let reviewNotes: string | undefined
    try {
      const body = (await request.json()) as { reviewNotes?: string }
      reviewNotes = body.reviewNotes
    } catch {
      // Approve with empty body is fine — notes are optional.
    }
    const result = await approveCommunityUpload(id, null, reviewNotes)
    await revalidateMarketingCatalog()
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
