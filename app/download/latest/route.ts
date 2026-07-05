import { NextResponse } from "next/server"

import { MACWALL_DEFAULT_INSTALLER_REDIRECT_URL } from "@/lib/macwall-installer-url"

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

export function GET() {
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
      return new NextResponse(
        "Installer URL must use HTTPS in production.",
        { status: 500 }
      )
    }
    return NextResponse.redirect(target, 302)
  } catch {
    return new NextResponse("Invalid installer URL.", { status: 500 })
  }
}
