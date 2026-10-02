import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { listModerationEvents } from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const events = await listModerationEvents(id)
    return NextResponse.json({ events })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load moderation log"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
