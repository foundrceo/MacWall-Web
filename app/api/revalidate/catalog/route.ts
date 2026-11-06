import { after } from "next/server"

import {
  MARKETING_CATALOG_CACHE_TAGS,
  revalidateMarketingCatalog,
} from "@/lib/admin/uploads"
import { secretsEqual } from "@/lib/http/secrets"
import { indexNowConfig, submitToIndexNow } from "@/lib/seo/indexnow"

/** Listing pages that change whenever the catalog does. */
const CATALOG_HUB_PATHS = ["/", "/wallpapers"] as const
const MAX_BODY_BYTES = 256 * 1024
const MAX_URLS = 10_000

type CatalogRevalidateBody = {
  /** Changed or new pages (absolute URLs or site paths) for IndexNow. */
  urls?: unknown
}

/**
 * On-demand ISR for homepage + public gallery after external catalog updates,
 * then an IndexNow ping (when configured) for the gallery hubs plus any
 * `{"urls": [...]}` the caller lists, so Bing picks up new wallpaper pages
 * without waiting for a crawl. The body is optional.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  if (!secret) {
    return Response.json(
      { error: "Revalidation is not configured." },
      { status: 503 }
    )
  }

  const provided = request.headers.get("x-revalidate-secret")?.trim() ?? ""
  if (!provided || !secretsEqual(provided, secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  const declared = Number(request.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return Response.json({ error: "Body too large." }, { status: 413 })
  }
  const raw = request.body ? await request.text() : ""
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Body too large." }, { status: 413 })
  }
  let body: CatalogRevalidateBody = {}
  if (raw.trim()) {
    try {
      body = JSON.parse(raw) as CatalogRevalidateBody
    } catch {
      return Response.json({ error: "Invalid JSON." }, { status: 400 })
    }
  }
  const urls = body?.urls ?? []
  if (
    !Array.isArray(urls) ||
    urls.length > MAX_URLS ||
    !urls.every((url) => typeof url === "string")
  ) {
    return Response.json(
      { error: `"urls" must be an array of up to ${MAX_URLS} strings.` },
      { status: 400 }
    )
  }

  await revalidateMarketingCatalog()

  const indexNowUrls = [...CATALOG_HUB_PATHS, ...(urls as string[])]
  const indexNow = indexNowConfig() ? "scheduled" : "not_configured"
  if (indexNow === "scheduled") {
    // After the response, so a slow IndexNow never holds up the caller.
    after(() => submitToIndexNow(indexNowUrls))
  }

  return Response.json({
    revalidated: true,
    tags: MARKETING_CATALOG_CACHE_TAGS,
    indexNow,
    at: new Date().toISOString(),
  })
}
