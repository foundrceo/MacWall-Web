import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { appendSupportMessage, listSupportTickets } from "@/lib/support/feedback"
import {
  isValidSupportSessionId,
  normalizeSupportSessionId,
  supportErrorMessage,
} from "@/lib/support/shared"

export const runtime = "nodejs"

const checkRateLimit = createInMemoryRateLimiter({ max: 30, windowMs: 60_000 })

function bad(status: number, error: string) {
  return NextResponse.json({ error, message: supportErrorMessage(error) }, { status })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  const { id: ticketId } = await context.params

  let body: { sessionId?: unknown; message?: unknown; imageUrl?: unknown }
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

  const message = typeof body.message === "string" ? body.message.trim() : ""
  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : null
  if (!message && !imageUrl) {
    return bad(400, "message_required")
  }

  try {
    await appendSupportMessage({ sessionId, ticketId, message, imageUrl })
    const tickets = await listSupportTickets(sessionId)
    const ticket = tickets.find((t) => t.id === ticketId) ?? null
    return NextResponse.json({ ticket })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.includes("ticket_closed")) {
      return bad(409, "ticket_closed")
    }
    return bad(500, "reply_failed")
  }
}
