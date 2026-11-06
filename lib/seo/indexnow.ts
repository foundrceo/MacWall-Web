import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * IndexNow: tell Bing (the index behind ChatGPT search and Copilot), Yandex,
 * Seznam, Naver and the other participating engines that URLs changed,
 * instead of waiting for their next crawl.
 *
 * Off until `INDEXNOW_KEY` is set to a key the site serves at `/{key}.txt`
 * (today `public/df962b19cbd7269f00b9c1cb2d58e25c.txt`). Without it, or on a
 * local origin, every submit is a logged no-op, so dev servers and previews
 * never ping the engines.
 *
 * Callers: /api/cron/indexnow (daily sitemap changes), /api/cron/sale-boundary
 * (pages whose prices changed) and /api/revalidate/catalog.
 */

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
/** IndexNow's limit per request. */
const MAX_URLS_PER_REQUEST = 10_000
/** IndexNow keys: 8–128 of a-z, A-Z, 0-9 and "-". */
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/
const REQUEST_TIMEOUT_MS = 15_000

export type IndexNowConfig = {
  key: string
  /** Host every submitted URL must be on, e.g. "macwall.app". */
  host: string
  origin: string
  keyLocation: string
}

/** `urls`: how many URLs the engines accepted. */
export type IndexNowSubmission =
  | { status: "submitted"; urls: number; httpStatus: number }
  | { status: "skipped"; reason: "not_configured" | "no_urls"; urls: 0 }
  | { status: "failed"; urls: number; httpStatus?: number; error: string }

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  )
}

/** Key, host and key file for submissions, or null while IndexNow is off. */
export function indexNowConfig(): IndexNowConfig | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key || !KEY_PATTERN.test(key)) return null
  let site: URL
  try {
    site = new URL(canonicalSiteOrigin())
  } catch {
    return null
  }
  if (site.protocol !== "https:" || isLocalHost(site.hostname)) return null
  return {
    key,
    host: site.host,
    origin: site.origin,
    keyLocation: `${site.origin}/${key}.txt`,
  }
}

/**
 * Absolute, de-duplicated URLs on the site's own host. Accepts absolute URLs
 * or site paths ("/pricing"); anything off-host or malformed is dropped,
 * because IndexNow rejects the whole request for one foreign URL.
 */
export function indexNowUrlList(
  urlsOrPaths: Iterable<string>,
  config: Pick<IndexNowConfig, "host" | "origin">
): string[] {
  const urls = new Set<string>()
  for (const value of urlsOrPaths) {
    let url: URL
    try {
      url = new URL(value, `${config.origin}/`)
    } catch {
      continue
    }
    if (url.host !== config.host || url.protocol !== "https:") continue
    url.hash = ""
    urls.add(url.href)
  }
  return [...urls]
}

/**
 * Submits URLs (absolute or site paths) to IndexNow. Never throws: the
 * result says whether the engines accepted them (HTTP 200, or 202 while the
 * key is being verified), and each outcome is logged for the cron logs.
 */
export async function submitToIndexNow(
  urlsOrPaths: Iterable<string>
): Promise<IndexNowSubmission> {
  const config = indexNowConfig()
  if (!config) {
    console.info("[indexnow] skipped: INDEXNOW_KEY is not set for this origin")
    return { status: "skipped", reason: "not_configured", urls: 0 }
  }
  const urlList = indexNowUrlList(urlsOrPaths, config)
  if (urlList.length === 0) {
    return { status: "skipped", reason: "no_urls", urls: 0 }
  }

  let lastStatus = 0
  for (let start = 0; start < urlList.length; start += MAX_URLS_PER_REQUEST) {
    const batch = urlList.slice(start, start + MAX_URLS_PER_REQUEST)
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: config.host,
          key: config.key,
          keyLocation: config.keyLocation,
          urlList: batch,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      })
      lastStatus = response.status
      console.log(`[indexnow] HTTP ${response.status} for ${batch.length} URLs`)
      if (response.status !== 200 && response.status !== 202) {
        const detail = (await response.text().catch(() => "")).slice(0, 200)
        return {
          status: "failed",
          urls: start,
          httpStatus: response.status,
          error: detail || response.statusText || "rejected",
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[indexnow] request failed: ${message}`)
      return { status: "failed", urls: start, error: message }
    }
  }
  return { status: "submitted", urls: urlList.length, httpStatus: lastStatus }
}

export { submitToIndexNow as submit }

/** A sitemap entry's `lastModified`, as `app/sitemap.ts` returns it. */
type SitemapEntryLike = { url: string; lastModified?: string | Date }

/**
 * Sitemap URLs changed at or after `since`. Date-only lastmods ("2026-11-05")
 * mean midnight UTC, so callers pass the start of the day they last ran
 * rather than the exact time, or a page edited later that day is missed.
 */
export function sitemapUrlsChangedSince(
  entries: readonly SitemapEntryLike[],
  since: number
): string[] {
  return entries.flatMap((entry) => {
    if (!entry.lastModified) return []
    const modified =
      entry.lastModified instanceof Date
        ? entry.lastModified.getTime()
        : Date.parse(entry.lastModified)
    return Number.isFinite(modified) && modified >= since ? [entry.url] : []
  })
}
