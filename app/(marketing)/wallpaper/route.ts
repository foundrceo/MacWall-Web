import { NextResponse, type NextRequest } from "next/server"

import { getPublicWallpaperByDetailSlug } from "@/lib/public-catalog/fetch"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"

/** Reads `?id=`, so never cached; each answer is a redirect. */
export const dynamic = "force-dynamic"

const GALLERY_PATH = "/wallpapers"

function redirectTo(
  request: NextRequest,
  pathname: string,
  status: 307 | 308
): NextResponse {
  const target = new URL(pathname, request.nextUrl.origin)
  // Keep campaign params from the share link; `id` is spent.
  for (const [key, value] of request.nextUrl.searchParams) {
    if (key !== "id") target.searchParams.append(key, value)
  }
  return NextResponse.redirect(target, {
    status,
    headers: {
      "Cache-Control":
        status === 308 ? "public, max-age=3600" : "private, no-store",
    },
  })
}

/**
 * Old Mac app share links (`/wallpaper?id={id}`) go to the wallpaper's detail
 * page; bare `/wallpaper` and unknown ids go to the gallery. A route handler,
 * not a page: the lookup's errors are handled here, never by a thrown
 * `redirect()` caught in a try block.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("id")?.trim() ?? ""
  if (!id || id.length > 200) {
    return redirectTo(request, GALLERY_PATH, 308)
  }

  let wallpaper: Awaited<ReturnType<typeof getPublicWallpaperByDetailSlug>>
  try {
    wallpaper = await getPublicWallpaperByDetailSlug(id)
  } catch {
    // Catalog unreachable: the gallery for now, not a permanent answer.
    return redirectTo(request, GALLERY_PATH, 307)
  }

  return redirectTo(
    request,
    wallpaper ? wallpaperDetailPath(wallpaper) : GALLERY_PATH,
    308
  )
}
