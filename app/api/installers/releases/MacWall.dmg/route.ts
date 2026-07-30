import { NextResponse } from "next/server"

import { r2InstallersPresignGetUrl } from "@/lib/storage/r2-installers"

export const runtime = "nodejs"

const DMG_KEY = "releases/MacWall.dmg"
const PRESIGN_SECONDS = 60 * 60

/** Redirects to a presigned R2 GET for the installer `.dmg`. */
export async function GET() {
  try {
    const target = await r2InstallersPresignGetUrl(DMG_KEY, PRESIGN_SECONDS)
    return NextResponse.redirect(target, 302)
  } catch {
    return new NextResponse("Installer unavailable", {
      status: 502,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    })
  }
}
