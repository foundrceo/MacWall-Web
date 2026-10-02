import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { blockCommunitySubmitter } from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * Repeat-infringer action: blocks the install that sent this upload from
 * submitting again and rejects its other pending uploads.
 */
export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as { reason?: string }
    const reason = body.reason?.trim() ?? ""
    if (!reason) {
      return NextResponse.json({ error: "reason_required" }, { status: 400 })
    }
    const result = await blockCommunitySubmitter(id, reason)
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to block uploader"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
