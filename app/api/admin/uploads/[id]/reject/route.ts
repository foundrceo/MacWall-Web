import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { rejectCommunityUpload } from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as {
      reviewNotes?: string
    }

    const result = await rejectCommunityUpload(id, body.reviewNotes)
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reject upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
