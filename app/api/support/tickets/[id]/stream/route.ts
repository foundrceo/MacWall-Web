import { NextResponse } from "next/server"

import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { listSupportTickets } from "@/lib/support/feedback"
import {
  isValidSupportSessionId,
  normalizeSupportSessionId,
} from "@/lib/support/shared"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 20, windowMs: 60_000 })

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

/**
 * Real-time SSE for a visitor’s support ticket.
 * Auth: sessionId must own the ticket (same as REST APIs).
 */
export async function GET(
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
    return bad(400, "invalid_ticket")
  }

  const sessionId = normalizeSupportSessionId(
    new URL(request.url).searchParams.get("sessionId") ?? ""
  )
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

  const encoder = new TextEncoder()
  let cleanup: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      send("connected", { ok: true, ticketId })

      const supabase = getSupabaseAdmin()
      const channel = supabase
        .channel(`support-chat-${ticketId}-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "app_feedback_messages",
            filter: `feedback_id=eq.${ticketId}`,
          },
          (payload) => {
            send("message", payload)
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "app_feedback",
            filter: `id=eq.${ticketId}`,
          },
          (payload) => {
            send("ticket", payload)
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            send("ready", { ok: true })
          }
        })

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(heartbeat)
        }
      }, 20_000)

      cleanup = () => {
        clearInterval(heartbeat)
        void supabase.removeChannel(channel)
      }

      request.signal.addEventListener("abort", () => {
        cleanup?.()
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      })
    },
    cancel() {
      cleanup?.()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
