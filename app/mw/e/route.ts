import { CRISPSTATS_COLLECTOR_ORIGIN } from "@/lib/analytics/crispstats"
import { clientIpFromRequest } from "@/lib/http/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** d.js events are a few hundred bytes; anything larger is not ours. */
const MAX_EVENT_BYTES = 16 * 1024

/**
 * First-party CrispStats collector (`data-api="/mw"` sends to `/mw/e`).
 * Forwards to `/api/event`, the only collector path that reads
 * `X-Forwarded-For`, with the visitor's address first so each visitor gets
 * their own daily anonymous id. The address is never stored here or there.
 * @see https://docs.crispstats.com/tracking/proxy
 */
export async function POST(request: Request) {
  const body = await request.arrayBuffer()
  if (body.byteLength === 0 || body.byteLength > MAX_EVENT_BYTES) {
    return new Response(null, { status: 400 })
  }

  const headers = new Headers({
    "content-type": request.headers.get("content-type") || "text/plain",
  })
  const userAgent = request.headers.get("user-agent")
  if (userAgent) headers.set("user-agent", userAgent)
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) headers.set("accept-language", acceptLanguage)
  const clientIp = clientIpFromRequest(request)
  if (clientIp && clientIp !== "unknown") {
    headers.set("x-forwarded-for", clientIp)
  }

  try {
    const upstream = await fetch(`${CRISPSTATS_COLLECTOR_ORIGIN}/api/event`, {
      method: "POST",
      headers,
      body,
    })
    return new Response(null, {
      status: upstream.status,
      headers: { "cache-control": "no-store" },
    })
  } catch {
    // Collector unreachable: the beacon has no one to tell, keep it quiet.
    return new Response(null, { status: 202 })
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { allow: "POST" } })
}
