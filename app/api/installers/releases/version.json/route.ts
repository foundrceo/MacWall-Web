import { NextResponse } from "next/server"

import { macwallInstallerDmgApiUrl } from "@/lib/macwall-installer-url"
import { r2InstallersGetText } from "@/lib/storage/r2-installers"

export const runtime = "nodejs"

const VERSION_KEY = "releases/version.json"

/** Serves update metadata from R2; rewrites the `.dmg` URL to our trusted API route. */
export async function GET() {
  try {
    const raw = await r2InstallersGetText(VERSION_KEY)
    const metadata = JSON.parse(raw) as {
      version?: string
      build?: number
      url?: string
      notes?: string
    }

    return NextResponse.json(
      {
        ...metadata,
        url: macwallInstallerDmgApiUrl(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        },
      }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read version.json"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
