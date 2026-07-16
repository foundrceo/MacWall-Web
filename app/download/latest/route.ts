import { NextResponse } from "next/server"

import { trackSiteEvent } from "@/lib/analytics/track-server"
import { MACWALL_DEFAULT_INSTALLER_REDIRECT_URL } from "@/lib/macwall-installer-url"

export const runtime = "nodejs"

async function visitorFingerprint(request: Request): Promise<string> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const ua = request.headers.get("user-agent") || "unknown"
  const bytes = new TextEncoder().encode(`${ip}|${ua}`)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32)
}

/** Server-only override; empty string (after trim) = disable redirect intentionally. */
const ENV_INSTALLER_REDIRECT = "MACWALL_INSTALLER_REDIRECT_URL"

function resolveInstallerRedirectDestination(): string | undefined {
  const fromEnv = process.env[ENV_INSTALLER_REDIRECT]
  if (fromEnv !== undefined && fromEnv.trim() === "") {
    return undefined
  }
  const trimmed = fromEnv?.trim()
  if (trimmed) return trimmed
  return MACWALL_DEFAULT_INSTALLER_REDIRECT_URL
}

function isHttpsProductionUrl(candidate: URL) {
  if (process.env.NODE_ENV !== "production") return true
  return candidate.protocol === "https:"
}

export async function GET(request: Request) {
  const raw = resolveInstallerRedirectDestination()
  if (!raw) {
    return new NextResponse(
      "Installer download is disabled. Set MACWALL_INSTALLER_REDIRECT_URL or remove an empty override.",
      {
        status: 404,
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
          "Cache-Control": "private, no-store",
        },
      }
    )
  }

  try {
    const target = new URL(raw)
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return new NextResponse("Invalid installer URL.", { status: 500 })
    }
    if (!isHttpsProductionUrl(target)) {
      return new NextResponse("Installer URL must use HTTPS in production.", {
        status: 500,
      })
    }
    const requestUrl = new URL(request.url)
    const querySessionId = requestUrl.searchParams.get("sid")?.trim()
    const sessionId =
      querySessionId && querySessionId.length <= 64
        ? querySessionId
        : await visitorFingerprint(request)

    await trackSiteEvent({
      eventName: "download_redirect",
      path: "/download/latest",
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
      sessionId,
      metadata: { destination: target.hostname },
    })

    return NextResponse.redirect(target, 302)
  } catch {
    return new NextResponse("Invalid installer URL.", { status: 500 })
  }
}
