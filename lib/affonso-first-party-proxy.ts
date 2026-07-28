import "server-only"

/**
 * Forwards Affonso first-party `/r/track` and `/r/signups` to the Affonso API
 * while preserving a trusted client IP header for geo attribution.
 * @see https://affonso.io/help/installation-guides/proxy-setup/pixel-tracking-proxy
 */

const AFFONSO_API = "https://api.affonso.io/v1" as const

function clientIpFromHeaders(headers: Headers): string | null {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
    headers.get("x-real-ip"),
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim(),
    headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ]
  for (const value of candidates) {
    if (value && value.length > 0) return value
  }
  return null
}

export async function proxyAffonsoApi(
  request: Request,
  path: "track" | "signups"
): Promise<Response> {
  const url = new URL(request.url)
  const target = new URL(`${AFFONSO_API}/${path}`)
  target.search = url.search

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  const accept = request.headers.get("accept")
  if (accept) headers.set("accept", accept)
  const userAgent = request.headers.get("user-agent")
  if (userAgent) headers.set("user-agent", userAgent)

  const clientIp = clientIpFromHeaders(request.headers)
  if (clientIp) {
    headers.set("X-Real-IP", clientIp)
    headers.set("X-Forwarded-For", clientIp)
    headers.set("CF-Connecting-IP", clientIp)
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }

  const upstream = await fetch(target, init)
  const responseHeaders = new Headers()
  const upstreamType = upstream.headers.get("content-type")
  if (upstreamType) responseHeaders.set("content-type", upstreamType)

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}
