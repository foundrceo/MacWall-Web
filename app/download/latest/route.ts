import { NextResponse } from "next/server"

/** Server-only: HTTPS URL to the hosted `.dmg` (S3/R2/Supabase Storage/GitHub Releases, etc.). */
const ENV_INSTALLER_REDIRECT = "MACWALL_INSTALLER_REDIRECT_URL"

function isHttpsProductionUrl(candidate: URL) {
  if (process.env.NODE_ENV !== "production") return true
  return candidate.protocol === "https:"
}

export function GET() {
  const raw = process.env[ENV_INSTALLER_REDIRECT]?.trim()
  if (!raw) {
    return new NextResponse(
      "Installer is not configured. Set MACWALL_INSTALLER_REDIRECT_URL.",
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
