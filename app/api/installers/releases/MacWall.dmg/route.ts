import { NextResponse, type NextRequest } from "next/server"

import {
  r2InstallersExists,
  r2InstallersPresignGetUrl,
} from "@/lib/storage/r2-installers"

export const runtime = "nodejs"

const DMG_KEY = "releases/MacWall.dmg"
const PRESIGN_SECONDS = 60 * 60

const VERSION_RE = /^\d+\.\d+\.\d+$/

/**
 * Redirects to a presigned R2 GET for the installer `.dmg`.
 * `?version=X.Y.Z` pins a staged-rollout build; anything unknown or
 * missing falls back to the latest object.
 */
export async function GET(request: NextRequest) {
  const pinned = request.nextUrl.searchParams.get("version")?.trim() ?? ""
  const key =
    VERSION_RE.test(pinned) &&
    (await r2InstallersExists(`releases/MacWall-${pinned}.dmg`))
      ? `releases/MacWall-${pinned}.dmg`
      : DMG_KEY
  try {
    const target = await r2InstallersPresignGetUrl(key, PRESIGN_SECONDS)
    return NextResponse.redirect(target, 302)
  } catch {
    return new NextResponse("Installer unavailable", {
      status: 502,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    })
  }
}
