import { NextResponse, type NextRequest } from "next/server"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { r2HeadPublicObject } from "@/lib/storage/r2"
import {
  r2InstallersExists,
  r2InstallersGetText,
  r2InstallersPresignGetUrl,
} from "@/lib/storage/r2-installers"

export const runtime = "nodejs"
/** A redirect to a presigned URL: keep it out of the page cache, which would follow it. */
export const dynamic = "force-dynamic"

const DMG_KEY = "releases/MacWall.dmg"
const VERSION_KEY = "releases/version.json"
const PRESIGN_SECONDS = 60 * 60

const VERSION_RE = /^\d+\.\d+\.\d+$/

/**
 * The release's copy on cdn.macwall.app (`wallpaper-catalog` bucket,
 * `releases/MacWall-X.Y.Z.dmg`, uploaded by `scripts/release/upload-release.sh`
 * in MacWall-App). Cloudflare's edge serves it with byte ranges, so a dropped
 * download resumes; the presigned R2 S3 endpoint timed out for ~400 Macs on
 * 4.0.9. A new key per version means no cache ever serves an older build.
 */
async function cdnInstallerUrl(version: string): Promise<string | null> {
  if (!VERSION_RE.test(version)) return null
  const key = `releases/MacWall-${version}.dmg`
  const head = await r2HeadPublicObject(key)
  return head.exists ? `${getR2PublicBaseUrl()}/${key}` : null
}

/** The latest version from `version.json`, for downloads that don't name one. */
async function latestVersion(): Promise<string> {
  try {
    const metadata = JSON.parse(await r2InstallersGetText(VERSION_KEY)) as { version?: unknown }
    return typeof metadata.version === "string" ? metadata.version.trim() : ""
  } catch {
    return ""
  }
}

/**
 * Redirects to the installer `.dmg`: the CDN copy when the release has one,
 * else a presigned R2 GET. `?version=X.Y.Z` pins a staged-rollout build;
 * anything unknown or missing falls back to the latest object.
 */
export async function GET(request: NextRequest) {
  const pinned = request.nextUrl.searchParams.get("version")?.trim() ?? ""
  try {
    const cdn = await cdnInstallerUrl(VERSION_RE.test(pinned) ? pinned : await latestVersion())
    if (cdn) {
      const response = NextResponse.redirect(cdn, 302)
      response.headers.set("Cache-Control", "public, max-age=0, s-maxage=300")
      return response
    }
  } catch {
    // Fall through to R2.
  }

  const key =
    VERSION_RE.test(pinned) &&
    (await r2InstallersExists(`releases/MacWall-${pinned}.dmg`))
      ? `releases/MacWall-${pinned}.dmg`
      : DMG_KEY
  try {
    const target = await r2InstallersPresignGetUrl(key, PRESIGN_SECONDS)
    const response = NextResponse.redirect(target, 302)
    // The presigned URL lives an hour, so the CDN can hand the same redirect
    // to every download for 5 minutes (per `?version=`) instead of presigning
    // per click. Browsers never keep it.
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=300")
    return response
  } catch {
    return new NextResponse("Installer unavailable", {
      status: 502,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    })
  }
}
