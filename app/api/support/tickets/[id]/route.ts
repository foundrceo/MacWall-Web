import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { updateSupportVisitor } from "@/lib/support/feedback"
import {
  isValidSupportSessionId,
  normalizeSupportSessionId,
  supportErrorMessage,
} from "@/lib/support/shared"

export const runtime = "nodejs"

const checkRateLimit = createInMemoryRateLimiter({ max: 30, windowMs: 60_000 })

function bad(status: number, error: string) {
  return NextResponse.json(
    { error, message: supportErrorMessage(error) },
    { status }
  )
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = clientIpFromRequest(request)
  const rateLimit = checkRateLimit(ip)
  if (rateLimit.limited) {
    return bad(429, "rate_limited")
  }

  const { id: ticketId } = await context.params
  if (!ticketId?.trim()) {
    return bad(400, "invalid_request")
  }

  let body: {
    sessionId?: unknown
    name?: unknown
    requestHuman?: unknown
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

  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 120) : null
  const requestHuman =
    typeof body.requestHuman === "boolean" ? body.requestHuman : false

  if (!name && !requestHuman) {
    return bad(400, "invalid_request")
  }

  try {
    await updateSupportVisitor({
      sessionId,
      ticketId: ticketId.trim(),
      name,
      requestHuman,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return bad(500, "update_failed")
  }
}
