import { revalidateTag } from "next/cache"
import {
  MARKETING_GALLERY_CACHE_TAG,
  MARKETING_HOME_PICK_CACHE_TAG,
  PUBLIC_CATALOG_CACHE_TAG,
} from "@/lib/marketing-cache"

/** On-demand ISR for homepage + public gallery after catalog updates. */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  if (!secret) {
    return Response.json(
      { error: "Revalidation is not configured." },
      { status: 503 }
    )
  }

  const provided = request.headers.get("x-revalidate-secret")?.trim()
  if (!provided || provided !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  revalidateTag(MARKETING_GALLERY_CACHE_TAG, "max")
  revalidateTag(MARKETING_HOME_PICK_CACHE_TAG, "max")
  revalidateTag(PUBLIC_CATALOG_CACHE_TAG, "max")

  return Response.json({
    revalidated: true,
    tags: [
      MARKETING_GALLERY_CACHE_TAG,
      MARKETING_HOME_PICK_CACHE_TAG,
      PUBLIC_CATALOG_CACHE_TAG,
    ],
    at: new Date().toISOString(),
  })
}
