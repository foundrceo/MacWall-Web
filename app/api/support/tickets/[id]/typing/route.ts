import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { listSupportTickets } from "@/lib/support/feedback"
import {
  isValidSupportSessionId,
  normalizeSupportSessionId,
  supportErrorMessage,
} from "@/lib/support/shared"
import { broadcastSupportTyping } from "@/lib/support/typing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 90, windowMs: 60_000 })

function bad(status: number, error: string) {
  return NextResponse.json(
    { error, message: supportErrorMessage(error) },
    { status }
  )
}

/**
 * Visitor typing ping (ephemeral). Auth: sessionId must own the ticket.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  const { id: rawTicketId } = await context.params
  const ticketId = rawTicketId?.trim() ?? ""
  if (!isValidSupportSessionId(ticketId)) {
    return bad(400, "invalid_ticket")
  }

  let body: { sessionId?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return bad(400, "invalid_json")
  }

  const sessionId =
    typeof body.sessionId === "string"
      ? normalizeSupportSessionId(body.sessionId)
      : ""
  if (!isValidSupportSessionId(sessionId)) {
    return bad(400, "invalid_session")
  }

  try {
    const tickets = await listSupportTickets(sessionId)
    if (!tickets.some((t) => t.id === ticketId)) {
      return bad(404, "ticket_not_found")
    }
  } catch {
    return bad(500, "load_failed")
  }

  try {
    await broadcastSupportTyping({
      ticketId,
      role: "user",
      at: Date.now(),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[support/typing] broadcast failed", error)
    return bad(500, "typing_failed")
  }
}
