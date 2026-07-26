import { NextResponse } from "next/server"

import { macwallInstallerDmgApiUrl } from "@/lib/macwall-installer-url"
import { r2InstallersGetText } from "@/lib/storage/r2-installers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

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
          // Release metadata is tiny and must reflect a newly published build immediately.
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read version.json"
    return NextResponse.json(
      { error: message },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    )
  }
}
