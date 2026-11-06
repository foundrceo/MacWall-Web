/**
 * Request and response rules the Worker applies around vinext
 * (worker/index.ts). No vinext imports, so tests can load this module.
 */
import { negotiatedMarkdownPath } from "../lib/http/markdown-negotiation"
import {
  CATALOG_PATHS_API_PATH,
  isCatalogPathsPayload,
  type CatalogPathsPayload,
} from "../lib/public-catalog/redirects"

/** Apex origin; `www.` is redirected there anyway (next.config.mjs). */
export const SITE_ORIGIN = "https://macwall.app"

/** Origin for redirects and internal requests: apex for `www.`, else as asked. */
export function canonicalRequestOrigin(url: URL): string {
  return url.hostname === "www.macwall.app" ? SITE_ORIGIN : url.origin
}

/**
 * Redirect endpoints that pass their query on: `/checkout` to Stripe checkout
 * (affiliate params included), `/wallpaper?id=` to the wallpaper page.
 */
const QUERY_FORWARDING_PATHS = new Set(["/checkout", "/wallpaper"])

/**
 * Page URLs: everything with a Markdown twin. API routes, framework paths,
 * admin, files and the redirect endpoints above are left alone.
 */
export function isPageRequest(method: string, pathname: string): boolean {
  if (method !== "GET" && method !== "HEAD") return false
  if (QUERY_FORWARDING_PATHS.has(pathname)) return false
  return negotiatedMarkdownPath(pathname) !== null
}

/** Exact tracking-only keys; any `utm_*` key counts too. */
const TRACKING_PARAMS = new Set([
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "msclkid",
  "twclid",
  "li_fat_id",
  "ref",
  "via",
  "atp",
  "_gl",
])

/** Read only by client scripts (`window.location`), never by a render. */
export function isTrackingParam(key: string): boolean {
  const lower = key.toLowerCase()
  return lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)
}

/** Tracking params taken off a request URL, in their original order. */
export type TrackingParams = [key: string, value: string][]

/**
 * Drops tracking-only params from `url` in place and returns them (empty when
 * there were none). Used on the URL handed to vinext, so every ad click shares
 * the cached page.
 */
export function stripTrackingParams(url: URL): TrackingParams {
  const removed = [...url.searchParams].filter(([key]) => isTrackingParam(key))
  for (const key of new Set(removed.map(([key]) => key))) {
    url.searchParams.delete(key)
  }
  return removed
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const SITE_HOSTS = new Set(["macwall.app", "www.macwall.app"])

/**
 * vinext only saw the stripped URL, so a redirect it sends (www to apex,
 * trailing slash, next.config rules) would lose the ad and affiliate params
 * the client reads from `window.location`. Puts them back on a same-site
 * Location; null when the response needs no change.
 */
export function withTrackingParams(
  response: Response,
  removed: TrackingParams,
  requestUrl: URL
): Response | null {
  if (removed.length === 0 || !REDIRECT_STATUSES.has(response.status)) {
    return null
  }
  const location = response.headers.get("location")
  if (!location) return null
  let target: URL
  try {
    target = new URL(location, requestUrl)
  } catch {
    return null
  }
  if (
    target.hostname !== requestUrl.hostname &&
    !SITE_HOSTS.has(target.hostname)
  ) {
    return null
  }
  // A key the redirect set itself wins; repeated keys all come back.
  const present = new Set(target.searchParams.keys())
  let changed = false
  for (const [key, value] of removed) {
    if (present.has(key)) continue
    target.searchParams.append(key, value)
    changed = true
  }
  if (!changed) return null
  const result = new Response(response.body, response)
  result.headers.set("location", target.toString())
  return result
}

/** `/...?amp=` URLs some indexes hold for the home page. */
export function withoutAmpParam(url: URL): URL | null {
  if (!url.searchParams.has("amp")) return null
  const next = new URL(url)
  next.searchParams.delete("amp")
  return next
}

/** A 308 to a site path, keeping the query. */
export function permanentRedirect(
  origin: string,
  pathname: string,
  search: string
): Response {
  return new Response(null, {
    status: 308,
    headers: {
      Location: `${origin}${pathname}${search}`,
      // A renamed wallpaper can be renamed again; don't pin the hop forever.
      "Cache-Control": "public, max-age=86400",
    },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** 410 for a wallpaper taken down for legal reasons. */
export function wallpaperGoneResponse(
  hubPath: string,
  categoryName: string | null
): Response {
  const hubLabel = categoryName
    ? `Browse ${categoryName} live wallpapers`
    : "Browse all live wallpapers"
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Wallpaper removed | MacWall</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#fff;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:30rem;padding:2rem 1.5rem;text-align:center}
h1{margin:0 0 .75rem;font-size:1.75rem;font-weight:500;letter-spacing:-.02em}
p{margin:0 0 1.5rem;color:rgba(255,255,255,.72)}
nav{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
a{display:inline-block;padding:.6rem 1.1rem;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;text-decoration:none}
a:first-child{background:#fff;color:#000}
</style>
</head>
<body>
<main>
<h1>This wallpaper was removed</h1>
<p>It was taken out of the MacWall catalog.</p>
<nav>
<a href="${escapeHtml(hubPath)}">${escapeHtml(hubLabel)}</a>
<a href="/wallpapers/collections">Collections</a>
</nav>
</main>
</body>
</html>
`
  return new Response(html, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

/** Files written by scripts/generate-og-images.mjs. */
const HASHED_SHARE_IMAGE = /^\/og\/[a-z0-9-]+\.[a-f0-9]{10}\.jpg$/

/** `public/` folders and app icons that vinext serves with `max-age=0`. */
const PUBLIC_ASSET =
  /^\/(?:(?:hero|how|install|reviews|screenshots|images|favicon_io|blog\/thumbs|blog\/vs)\/[^/].*|MacWall\.png|favicon\.ico|icon\.png|apple-icon\.png)$/

/**
 * Browser caching for static files. vinext serves `public/` with `max-age=0`
 * and skips next.config headers for them. Hashed share images never change;
 * the rest aren't content-hashed, so a day plus a week of revalidation.
 */
export function staticAssetCacheControl(pathname: string): string | null {
  if (HASHED_SHARE_IMAGE.test(pathname))
    return "public, max-age=31536000, immutable"
  if (PUBLIC_ASSET.test(pathname))
    return "public, max-age=86400, stale-while-revalidate=604800"
  return null
}

/** Replayed by Cloudflare as 103 Early Hints: catalog thumbs and videos are on the CDN. */
export const CDN_PRECONNECT_LINK = "<https://cdn.macwall.app>; rel=preconnect"

type ResponseRules = {
  pathname: string
  /** The page's `.md` twin path, when the URL is a page. */
  markdownPath: string | null
  /** The request was answered with the twin (`Accept: text/markdown`). */
  negotiated: boolean
}

/**
 * Header changes on the way out, made in place on a mutable copy of the
 * response's headers. Returns true when anything changed.
 */
export function applyResponseRules(
  headers: Headers,
  status: number,
  { pathname, markdownPath, negotiated }: ResponseRules
): boolean {
  let changed = false

  const assetCacheControl =
    status === 200 || status === 304 ? staticAssetCacheControl(pathname) : null
  if (assetCacheControl) {
    headers.set("cache-control", assetCacheControl)
    changed = true
  }

  if (markdownPath !== null) {
    // Page URLs answer in two formats, so shared caches must key on Accept.
    const vary = headers.get("vary")
    if (!vary || !/\baccept\b/i.test(vary)) {
      headers.set("vary", vary ? `${vary}, Accept` : "Accept")
      changed = true
    }
  }

  if (negotiated && markdownPath !== null) {
    // The twin's own `.md` URL stays noindex; the page URL must not inherit it.
    headers.delete("x-robots-tag")
    headers.set("content-location", markdownPath)
    changed = true
  }

  if (/^text\/html\b/i.test(headers.get("content-type") ?? "")) {
    const link = headers.get("link")
    if (!link?.includes("https://cdn.macwall.app")) {
      headers.set(
        "link",
        link ? `${link}, ${CDN_PRECONNECT_LINK}` : CDN_PRECONNECT_LINK
      )
    }
    // The per-colo render time, not when the content changed.
    headers.delete("last-modified")
    changed = true
  }

  return changed
}

/** The bits of the Workers Cache API this module uses. */
export type EdgeCache = {
  match(key: string): Promise<Response | undefined>
  put(key: string, response: Response): Promise<void>
}

const PATHS_CACHE_SECONDS = 600
const PATHS_MEMO_MS = 60_000
const PATHS_FAILURE_MEMO_MS = 30_000

/**
 * The `/api/catalog/paths` map, cached in the colo's Workers Cache for 10
 * minutes and in the isolate for a minute, so a detail-page request costs a
 * cache lookup at most. Failures are remembered for 30 seconds and yield null
 * (the request then renders as usual).
 */
export function createCatalogPathsLoader() {
  let memo: { payload: CatalogPathsPayload | null; expiresAt: number } | null =
    null
  let inflight: Promise<CatalogPathsPayload | null> | null = null

  async function load(options: {
    origin: string
    cache: EdgeCache | null
    fetchFresh: (url: string) => Promise<Response>
    waitUntil: (promise: Promise<unknown>) => void
  }): Promise<CatalogPathsPayload | null> {
    const { origin, cache, fetchFresh, waitUntil } = options
    const cacheKey = `${origin}/__edge${CATALOG_PATHS_API_PATH}`

    const cached = await cache?.match(cacheKey).catch(() => undefined)
    if (cached?.ok) {
      const payload = parse(await cached.text())
      if (payload) return payload
    }

    const response = await fetchFresh(`${origin}${CATALOG_PATHS_API_PATH}`)
    if (!response.ok) {
      await response.body?.cancel()
      return null
    }
    const body = await response.text()
    const payload = parse(body)
    if (payload && cache) {
      waitUntil(
        cache
          .put(
            cacheKey,
            new Response(body, {
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${PATHS_CACHE_SECONDS}`,
              },
            })
          )
          .catch(() => undefined)
      )
    }
    return payload
  }

  return async function getCatalogPaths(
    options: Parameters<typeof load>[0] & { now?: number }
  ): Promise<CatalogPathsPayload | null> {
    const now = options.now ?? Date.now()
    if (memo && memo.expiresAt > now) return memo.payload
    inflight ??= load(options)
      .catch((error: unknown) => {
        console.error(
          "catalog paths unavailable:",
          error instanceof Error ? error.message : error
        )
        return null
      })
      .then((payload) => {
        memo = {
          payload,
          expiresAt: now + (payload ? PATHS_MEMO_MS : PATHS_FAILURE_MEMO_MS),
        }
        return payload
      })
      .finally(() => {
        inflight = null
      })
    return inflight
  }
}

function parse(body: string): CatalogPathsPayload | null {
  try {
    const value = JSON.parse(body) as unknown
    return isCatalogPathsPayload(value) ? value : null
  } catch {
    return null
  }
}
