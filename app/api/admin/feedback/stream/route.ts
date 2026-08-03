import { requireAdminApi } from "@/lib/admin/auth"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
/** Cap Fluid Compute duration — admin UI reconnects after this. */
export const maxDuration = 300

const SSE_MAX_MS = 5 * 60 * 1000

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  const encoder = new TextEncoder()
  let cleanup: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      send("connected", { ok: true })

      const supabase = getSupabaseAdmin()
      const channel = supabase
        .channel(`admin-feedback-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "app_feedback" },
          (payload) => {
            send("feedback", payload)
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "app_feedback_messages",
          },
          (payload) => {
            send("message", payload)
          }
        )
        .subscribe()

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(heartbeat)
        }
      }, 25_000)

      const lifetime = setTimeout(() => {
        cleanup?.()
        try {
          controller.close()
        } catch {
          // stream already closed
        }
      }, SSE_MAX_MS)

      cleanup = () => {
        clearInterval(heartbeat)
        clearTimeout(lifetime)
        void supabase.removeChannel(channel)
      }

      request.signal.addEventListener("abort", () => {
        cleanup?.()
        try {
          controller.close()
        } catch {
          // stream already closed
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
