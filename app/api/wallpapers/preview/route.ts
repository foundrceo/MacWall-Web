import { resolvePreviewVideoUrlFresh } from "@/lib/public-catalog/preview-video-url"
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Reject path traversal / absurd keys before hitting R2. */
function isSafeVideoKey(key: string): boolean {
  if (!key || key.length > 512) return false
  if (key.includes("..") || key.includes("\\") || key.startsWith("/")) {
    return false
  }
  return true
}

/**
 * Mint a fresh preview URL for the wallpaper player.
 * Must not be CDN-cached — signed URLs expire in minutes.
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim() ?? ""
  if (!isSafeVideoKey(key)) {
    return NextResponse.json({ error: "Invalid video key." }, { status: 400 })
  }

  try {
    const url = await resolvePreviewVideoUrlFresh(key)
    return NextResponse.json(
      { url },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve preview URL"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
