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
import {
  SUPPORT_TYPING_EVENT,
  SUPPORT_TYPING_TOPIC,
  type SupportTypingPayload,
  type SupportTypingRole,
} from "@/lib/support/typing"
import { createSupabaseAdminRealtime } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
/** Cap Fluid Compute duration — client reconnects after this. */
export const maxDuration = 300

const checkRateLimit = createInMemoryRateLimiter({ max: 20, windowMs: 60_000 })
/** Hard stop so idle SSE tabs don't hold functions open for hours. */
const SSE_MAX_MS = 4 * 60 * 1000

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

  const { id: rawTicketId } = await context.params
  const ticketId = rawTicketId?.trim() ?? ""
  if (!isValidSupportSessionId(ticketId)) {
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

      // Fresh client so concurrent SSE streams don't share channel state.
      const supabase = createSupabaseAdminRealtime()
      let messageChannelReady = false
      let typingChannelReady = false
      let readySent = false
      const maybeReady = () => {
        if (readySent) return
        // Prefer both channels; don't block forever if typing subscribe stalls.
        if (!messageChannelReady && !typingChannelReady) return
        if (!(messageChannelReady && typingChannelReady)) return
        readySent = true
        send("ready", { ok: true })
      }
      const readyFallback = setTimeout(() => {
        if (readySent) return
        if (messageChannelReady || typingChannelReady) {
          readySent = true
          send("ready", { ok: true })
        }
      }, 2500)

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
            messageChannelReady = true
            maybeReady()
          }
        })

      // Topic must match REST broadcast topic in lib/support/typing.ts
      const typingChannel = supabase
        .channel(SUPPORT_TYPING_TOPIC, {
          config: { broadcast: { self: false } },
        })
        .on("broadcast", { event: SUPPORT_TYPING_EVENT }, (payload) => {
          const envelope = payload as {
            payload?: SupportTypingPayload
            ticketId?: string
            role?: SupportTypingRole
            at?: number
          }
          const raw: SupportTypingPayload | null =
            envelope.payload && typeof envelope.payload === "object"
              ? envelope.payload
              : envelope.ticketId && envelope.role
                ? {
                    ticketId: envelope.ticketId,
                    role: envelope.role as SupportTypingRole,
                    at: envelope.at ?? Date.now(),
                  }
                : null
          if (!raw || raw.ticketId !== ticketId) return
          // Only surface the other side (admin) to the visitor.
          if (raw.role !== "admin") return
          send("typing", {
            ticketId: raw.ticketId,
            role: raw.role,
            at: typeof raw.at === "number" ? raw.at : Date.now(),
          } satisfies SupportTypingPayload)
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            typingChannelReady = true
            maybeReady()
          }
        })

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(heartbeat)
        }
      }, 20_000)

      const lifetime = setTimeout(() => {
        cleanup?.()
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      }, SSE_MAX_MS)

      cleanup = () => {
        clearInterval(heartbeat)
        clearTimeout(lifetime)
        clearTimeout(readyFallback)
        void supabase.removeChannel(channel)
        void supabase.removeChannel(typingChannel)
        void supabase.removeAllChannels()
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
