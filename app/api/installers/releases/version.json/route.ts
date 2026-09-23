import { NextResponse, type NextRequest } from "next/server"

import { macwallInstallerDmgApiUrl } from "@/lib/macwall-installer-url"
import {
  parseRolloutState,
  rolloutBucket,
  sanitizeDeviceToken,
} from "@/lib/macwall-rollout"
import { r2InstallersGetText } from "@/lib/storage/r2-installers"

export const runtime = "nodejs"
/** Mac update checks are chatty — short CDN TTL cuts invocations without stalling ships. */
export const revalidate = 120

const VERSION_KEY = "releases/version.json"
const STABLE_VERSION_KEY = "releases/version-stable.json"
const ROLLOUT_KEY = "releases/rollout.json"

type ReleaseMetadata = {
  version: string
  build?: number
  notes?: string
}

function parseMetadata(raw: string): ReleaseMetadata | null {
  try {
    const metadata = JSON.parse(raw) as Record<string, unknown>
    const version =
      typeof metadata.version === "string" ? metadata.version.trim() : ""
    if (!version) return null
    const build =
      typeof metadata.build === "number" && Number.isSafeInteger(metadata.build)
        ? metadata.build
        : undefined
    const notes =
      typeof metadata.notes === "string" && metadata.notes.trim()
        ? metadata.notes.trim()
        : undefined
    return { version, ...(build === undefined ? {} : { build }), ...(notes ? { notes } : {}) }
  } catch {
    return null
  }
}

/**
 * Staged rollout: while `rollout.json` names the latest version with
 * percent < 100, devices whose bucket falls outside it keep getting the
 * previous stable metadata. Missing token (older apps), missing rollout
 * state, or a version mismatch all fall through to the latest release.
 */
async function resolveServedMetadata(
  latest: ReleaseMetadata,
  request: NextRequest
): Promise<ReleaseMetadata> {
  const device = sanitizeDeviceToken(
    request.nextUrl.searchParams.get("did")
  )
  if (!device) return latest

  let rolloutRaw: string
  try {
    rolloutRaw = await r2InstallersGetText(ROLLOUT_KEY)
  } catch {
    return latest
  }
  const rollout = parseRolloutState(rolloutRaw)
  if (!rollout || rollout.version !== latest.version) return latest
  if (rollout.percent >= 100 || rolloutBucket(device) < rollout.percent) {
    return latest
  }

  try {
    const stable = parseMetadata(await r2InstallersGetText(STABLE_VERSION_KEY))
    if (stable) return stable
  } catch {
    // Fall through to latest below.
  }
  return latest
}

/** Serves update metadata from R2; rewrites the `.dmg` URL to our trusted API route. */
export async function GET(request: NextRequest) {
  try {
    const latest = parseMetadata(await r2InstallersGetText(VERSION_KEY))
    if (!latest) {
      throw new Error("version.json is missing a valid version")
    }

    const served = await resolveServedMetadata(latest, request)

    return NextResponse.json(
      {
        version: served.version,
        ...(served.build === undefined ? {} : { build: served.build }),
        url: macwallInstallerDmgApiUrl(served.version),
        ...(served.notes ? { notes: served.notes } : {}),
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
