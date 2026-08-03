import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { isValidSupportSessionId } from "@/lib/support/shared"
import { broadcastSupportTyping } from "@/lib/support/typing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Admin typing ping (ephemeral) for a feedback ticket.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi()
  if (denied) return denied

  const { id: rawTicketId } = await context.params
  const ticketId = rawTicketId?.trim() ?? ""
  if (!isValidSupportSessionId(ticketId)) {
    return NextResponse.json({ error: "invalid_ticket" }, { status: 400 })
  }

  try {
    await broadcastSupportTyping({
      ticketId,
      role: "admin",
      at: Date.now(),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[admin/typing] broadcast failed", error)
    return NextResponse.json({ error: "typing_failed" }, { status: 500 })
  }
}
