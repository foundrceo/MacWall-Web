#!/usr/bin/env node
/**
 * Submits URLs to IndexNow (Bing, Yandex, Seznam, Naver and others share
 * submissions). The key is public by design and lives at /{key}.txt.
 *
 * The site does this on its own once INDEXNOW_KEY is set on the Worker: a
 * daily cron submits sitemap URLs changed since its last run, sale starts and
 * ends submit the pricing pages, and /api/revalidate/catalog submits the
 * gallery (lib/seo/indexnow.ts). Use this script for one-off pushes, e.g.
 * right after a deploy that changed many pages.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs                 # every URL in the live sitemap
 *   node scripts/indexnow-submit.mjs --since=2026-10-27
 *   node scripts/indexnow-submit.mjs https://macwall.app/compare https://macwall.app/tools
 *   node scripts/indexnow-submit.mjs --dry-run
 *
 * INDEXNOW_KEY overrides the key below (same variable the Worker reads).
 *
 * Run it only after a deploy is live: IndexNow fetches the key file from the
 * site to verify ownership.
 */

const HOST = "macwall.app"
const KEY =
  process.env.INDEXNOW_KEY?.trim() || "df962b19cbd7269f00b9c1cb2d58e25c"
const ENDPOINT = "https://api.indexnow.org/indexnow"
const BATCH = 10000

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const since = args.find((a) => a.startsWith("--since="))?.split("=")[1]
const explicit = args.filter((a) => /^https?:\/\//.test(a))

const tagValue = (xml, tag) =>
  xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`))?.[1]

/** Every `<url>` in a sitemap, following a sitemap index one level down. */
async function sitemapEntries(sitemapUrl) {
  const xml = await (await fetch(sitemapUrl)).text()
  const children = [...xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)]
    .map((m) => tagValue(m[1], "loc"))
    .filter(Boolean)
  if (children.length > 0) {
    return (await Promise.all(children.map(sitemapEntries))).flat()
  }
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: tagValue(m[1], "loc"),
    lastmod: tagValue(m[1], "lastmod"),
  }))
}

async function sitemapUrls() {
  const entries = await sitemapEntries(`https://${HOST}/sitemap.xml`)
  return entries
    .filter((entry) => entry.loc)
    .filter((entry) => !since || !entry.lastmod || entry.lastmod >= since)
    .map((entry) => entry.loc)
}

const keyCheck = await fetch(`https://${HOST}/${KEY}.txt`)
if (!dryRun && (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY)) {
  console.error(
    `Key file https://${HOST}/${KEY}.txt is not live yet. Deploy first.`
  )
  process.exit(1)
}

const urls = explicit.length ? explicit : await sitemapUrls()
console.log(`${urls.length} URLs${since ? ` changed since ${since}` : ""}`)
if (dryRun) {
  console.log(urls.slice(0, 20).join("\n"))
  process.exit(0)
}

for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH)
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  })
  // 200 and 202 both mean accepted; 202 means the key is still being verified.
  console.log(`batch ${i / BATCH + 1}: HTTP ${res.status} ${res.statusText}`)
  if (res.status >= 400) process.exitCode = 1
}
