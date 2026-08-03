import { NextResponse } from "next/server"

import { macwallInstallerDmgApiUrl } from "@/lib/macwall-installer-url"
import { r2InstallersGetText } from "@/lib/storage/r2-installers"

export const runtime = "nodejs"
/** Mac update checks are chatty — short CDN TTL cuts invocations without stalling ships. */
export const revalidate = 120

const VERSION_KEY = "releases/version.json"

/** Serves update metadata from R2; rewrites the `.dmg` URL to our trusted API route. */
export async function GET() {
  try {
    const raw = await r2InstallersGetText(VERSION_KEY)
    const metadata = JSON.parse(raw) as Record<string, unknown>
    const version =
      typeof metadata.version === "string" ? metadata.version.trim() : ""
    if (!version) {
      throw new Error("version.json is missing a valid version")
    }

    const build =
      typeof metadata.build === "number" && Number.isSafeInteger(metadata.build)
        ? metadata.build
        : undefined
    const notes =
      typeof metadata.notes === "string" ? metadata.notes.trim() : undefined

    return NextResponse.json(
      {
        version,
        ...(build === undefined ? {} : { build }),
        url: macwallInstallerDmgApiUrl(),
        ...(notes ? { notes } : {}),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "version_unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    )
  }
}
