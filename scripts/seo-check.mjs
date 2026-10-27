#!/usr/bin/env node
/**
 * Crawls a running build and checks every public page against the site's SEO
 * rules: "<Page> | MacWall" titles of 60 characters or fewer, 110-160
 * character descriptions, a self canonical, Open Graph and Twitter tags, and a
 * working Markdown twin (noindex, Vary: Accept) advertised in the head.
 *
 * Usage:
 *   node scripts/seo-check.mjs [origin] [--wallpapers=N] [--only=/path,/path]
 *
 * `origin` defaults to http://localhost:3000. Pages come from the origin's
 * sitemap.xml; wallpaper detail pages are sampled (default 25) because there
 * are over a thousand of them. Exits 1 when any page fails.
 */

const args = process.argv.slice(2)
const origin = (
  args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000"
).replace(/\/$/, "")
const flag = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1]
const wallpaperSample = Number(flag("wallpapers") ?? 25)
const only = flag("only")?.split(",")

const CANONICAL_ORIGIN = "https://macwall.app"
const BRAND_SUFFIX = " | MacWall"

function decode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function meta(html, attr, key) {
  const re = new RegExp(`<meta[^>]*${attr}="${key}"[^>]*>`, "i")
  const tag = html.match(re)?.[0]
  return tag ? decode(tag.match(/content="([^"]*)"/i)?.[1] ?? "") : undefined
}

function link(html, rel, type) {
  const tags = html.match(/<link[^>]*>/gi) ?? []
  const tag = tags.find(
    (t) => t.includes(`rel="${rel}"`) && (!type || t.includes(`type="${type}"`))
  )
  return tag?.match(/href="([^"]*)"/i)?.[1]
}

async function sitemapPaths() {
  const xml = await (await fetch(`${origin}/sitemap.xml`)).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const url = new URL(m[1])
    return url.pathname === "" ? "/" : url.pathname
  })
}

function sample(list, n) {
  if (list.length <= n) return list
  const step = list.length / n
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)])
}

async function checkPage(path) {
  const problems = []
  const res = await fetch(`${origin}${path}`, { redirect: "manual" })
  if (res.status !== 200) return [`HTTP ${res.status}`]
  const html = await res.text()

  const title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "")
  const description = meta(html, "name", "description") ?? ""
  const robots = meta(html, "name", "robots") ?? ""
  const noindex = /noindex/i.test(robots)

  if (!title.endsWith(BRAND_SUFFIX))
    problems.push(`title not "<Page> | MacWall": ${title}`)
  if (title.length > 60) problems.push(`title ${title.length} chars: ${title}`)
  if (description.length < 110 || description.length > 160)
    problems.push(`description ${description.length} chars`)
  if (/—/.test(title + description))
    problems.push("em dash in title/description")

  const canonical = link(html, "canonical")
  const expected = `${CANONICAL_ORIGIN}${path === "/" ? "" : path}`
  if (!noindex && canonical !== expected)
    problems.push(`canonical ${canonical ?? "missing"}`)

  for (const key of ["og:title", "og:description", "og:image", "og:url"])
    if (!meta(html, "property", key)) problems.push(`missing ${key}`)
  if (
    meta(html, "property", "og:url") &&
    !noindex &&
    meta(html, "property", "og:url") !== expected
  )
    problems.push(`og:url ${meta(html, "property", "og:url")}`)
  for (const key of ["twitter:card", "twitter:image"])
    if (!meta(html, "name", key)) problems.push(`missing ${key}`)

  const markdown = link(html, "alternate", "text/markdown")
  if (!markdown) {
    problems.push("no rel=alternate text/markdown")
  } else {
    const mdPath = new URL(markdown).pathname
    const md = await fetch(`${origin}${mdPath}`)
    if (md.status !== 200) problems.push(`markdown twin HTTP ${md.status}`)
    if (!/noindex/i.test(md.headers.get("x-robots-tag") ?? ""))
      problems.push("markdown twin missing X-Robots-Tag noindex")
    if (!/accept/i.test(md.headers.get("vary") ?? ""))
      problems.push("markdown twin missing Vary: Accept")
    if (!/text\/markdown/.test(md.headers.get("content-type") ?? ""))
      problems.push("markdown twin wrong content-type")
    const negotiated = await fetch(`${origin}${path}`, {
      headers: { Accept: "text/markdown" },
    })
    if (!/text\/markdown/.test(negotiated.headers.get("content-type") ?? ""))
      problems.push("Accept: text/markdown does not return Markdown")
  }

  return problems
}

const all = only ?? (await sitemapPaths())
const wallpapers = all.filter((p) => p.startsWith("/wallpaper/"))
const pages = only ?? [
  ...all.filter((p) => !p.startsWith("/wallpaper/")),
  ...sample(wallpapers, wallpaperSample),
]

let failed = 0
for (const path of pages) {
  const problems = await checkPage(path).catch((error) => [String(error)])
  if (problems.length) {
    failed += 1
    console.log(`✗ ${path}\n  - ${problems.join("\n  - ")}`)
  }
}
console.log(`\n${pages.length - failed}/${pages.length} pages pass (${origin})`)
process.exit(failed ? 1 : 0)
