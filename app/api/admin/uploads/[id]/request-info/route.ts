import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { requestCommunityUploadInfo } from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

/** Keeps the upload pending and shows the message to the uploader in the app. */
export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as {
      message?: string
    }
    const message = body.message?.trim() ?? ""
    if (!message) {
      return NextResponse.json({ error: "message_required" }, { status: 400 })
    }
    const { result } = await requestCommunityUploadInfo(id, message)
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to request information"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
