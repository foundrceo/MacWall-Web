import { unstable_cache } from "next/cache"
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

/** Share the release documents across every device instead of repeating R2 reads. */
const getReleaseDocuments = unstable_cache(async () => {
  const [latestRaw, rolloutRaw, stableRaw] = await Promise.all([
    r2InstallersGetText(VERSION_KEY),
    r2InstallersGetText(ROLLOUT_KEY).catch(() => null),
    r2InstallersGetText(STABLE_VERSION_KEY).catch(() => null),
  ])
  const latest = parseMetadata(latestRaw)
  if (!latest) throw new Error("version.json is missing a valid version")
  return {
    latest,
    rollout: rolloutRaw ? parseRolloutState(rolloutRaw) : null,
    stable: stableRaw ? parseMetadata(stableRaw) : null,
  }
}, ["installer-release-documents-v1"], { revalidate: 120 })

function resolveServedMetadata(
  documents: Awaited<ReturnType<typeof getReleaseDocuments>>,
  request: NextRequest
): ReleaseMetadata {
  const { latest, rollout, stable } = documents
  const device = sanitizeDeviceToken(request.nextUrl.searchParams.get("did"))
  if (!device || !rollout || rollout.version !== latest.version ||
      rollout.percent >= 100 || rolloutBucket(device) < rollout.percent) return latest
  return stable ?? latest
}

/** Serves update metadata from R2; rewrites the `.dmg` URL to our trusted API route. */
export async function GET(request: NextRequest) {
  try {
    const documents = await getReleaseDocuments()
    const served = resolveServedMetadata(documents, request)

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
