import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import {
  createSupportTicket,
  listSupportTickets,
  markSupportTicketSeen,
} from "@/lib/support/feedback"
import { sanitizeSupportImageUrl } from "@/lib/support/image-url"
import {
  isValidSupportSessionId,
  normalizeSupportSessionId,
  parseSupportSentiment,
} from "@/lib/support/shared"

export const runtime = "nodejs"

const checkRateLimit = createInMemoryRateLimiter({ max: 40, windowMs: 60_000 })

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function GET(request: Request) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  const sessionId = normalizeSupportSessionId(
    new URL(request.url).searchParams.get("sessionId") ?? ""
  )
  if (!isValidSupportSessionId(sessionId)) {
    return bad(400, "invalid_session")
  }

  try {
    const tickets = await listSupportTickets(sessionId)
    return NextResponse.json({ tickets })
  } catch {
    return bad(500, "load_failed")
  }
}

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  let body: {
    sessionId?: unknown
    sentiment?: unknown
    name?: unknown
    message?: unknown
    imageUrl?: unknown
    chatId?: unknown
    firstAuthor?: unknown
    needsAdminReply?: unknown
  }
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

  const nameRaw = typeof body.name === "string" ? body.name.trim() : ""
  const name = (nameRaw || "Visitor").slice(0, 120)

  const message = typeof body.message === "string" ? body.message.trim() : ""
  const imageUrl = sanitizeSupportImageUrl(
    typeof body.imageUrl === "string" ? body.imageUrl : null
  )
  if (!message && !imageUrl) {
    return bad(400, "message_required")
  }

  const chatId =
    typeof body.chatId === "string" ? body.chatId.trim().slice(0, 40) : null
  const firstAuthor =
    body.firstAuthor === "assist" || body.firstAuthor === "user"
      ? body.firstAuthor
      : "user"
  const needsAdminReply =
    typeof body.needsAdminReply === "boolean" ? body.needsAdminReply : true

  try {
    const ticket = await createSupportTicket({
      sessionId,
      sentiment: parseSupportSentiment(body.sentiment),
      name,
      message,
      imageUrl,
      userAgent: request.headers.get("user-agent"),
      chatId,
      firstAuthor,
      needsAdminReply,
    })
    return NextResponse.json({ ticket })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error("[support/tickets] create_failed", {
      detail,
      sessionIdPrefix: sessionId.slice(0, 8),
      hasMessage: Boolean(message),
      hasImage: Boolean(imageUrl),
      chatId,
      firstAuthor,
      needsAdminReply,
    })
    return bad(500, "create_failed")
  }
}

export async function PATCH(request: Request) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  let body: {
    sessionId?: unknown
    ticketId?: unknown
    action?: unknown
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return bad(400, "invalid_json")
  }

  const sessionId =
    typeof body.sessionId === "string"
      ? normalizeSupportSessionId(body.sessionId)
      : ""
  const ticketId = typeof body.ticketId === "string" ? body.ticketId.trim() : ""

  if (!isValidSupportSessionId(sessionId) || !ticketId) {
    return bad(400, "invalid_request")
  }

  if (body.action !== "mark_seen") {
    return bad(400, "invalid_action")
  }

  try {
    await markSupportTicketSeen({ sessionId, ticketId })
    return NextResponse.json({ ok: true })
  } catch {
    return bad(500, "update_failed")
  }
}

