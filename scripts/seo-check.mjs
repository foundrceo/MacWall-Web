#!/usr/bin/env node
/**
 * SEO regression guard. Crawls a running build (production, a Workers
 * preview or `next dev`) and checks the rendered site plus a few source-level
 * rules. Read-only: it only sends GET/HEAD requests and reads files in this
 * repo. No dependencies, so it runs on a bare checkout with Node 24.
 *
 * Usage:
 *   node scripts/seo-check.mjs [origin] [options]
 *
 *   origin              defaults to http://localhost:3000
 *   --wallpapers=N      wallpaper detail pages to sample (default 25)
 *   --only=/a,/b        crawl only these pages (site-wide checks still run)
 *   --checks=id,id      run only these checks (ids below)
 *   --skip=id,id        skip checks by id
 *   --concurrency=N     parallel requests (default 6)
 *   --catalog-label=X   test the catalog claim guard with another label,
 *                       e.g. --catalog-label=1,000+ (default: the current
 *                       macwallCatalog.liveCountLabel in lib/macwall-site.ts)
 *   --details=N         failure lines printed per check (default 30, 0 = all)
 *
 * Behind an HTTP(S) proxy (sandboxes, some CI runners) Node's fetch ignores
 * HTTPS_PROXY unless you opt in, and every request fails with ENOTFOUND:
 *   NODE_USE_ENV_PROXY=1 node scripts/seo-check.mjs https://macwall.app
 *
 * Checks (ids):
 *   page             title, description, canonical, OG/Twitter, Markdown twin
 *   h1               exactly one <h1> outside <div hidden> (React's
 *                    out-of-line Suspense segments live in those)
 *   duplicates       no two indexable pages share a title, H1 or description
 *   gallery-links    gallery hubs have 20+ /wallpaper/ links before <footer>
 *   server-text      no "0+ downloads" placeholders, no purchase-count lines
 *   blog-words       every /blog/ article body has at least 400 words
 *   jsonld           JSON-LD parses; no Markdown ('](' or '**') in strings;
 *                    breadcrumb only on WebPage types; every {"@id"}
 *                    reference resolves; no dateModified from the last hour
 *   offer-price      while the sale banner shows, the default-region
 *                    SoftwareApplication Offers include the banner's sale
 *                    price and not its struck-through regular price
 *   faq-price        while the sale banner shows, no FAQPage answer quotes a
 *                    regular (pre-sale) MacWall price
 *   redirects        non-canonical URLs answer with exactly one 308 to a 200
 *                    (and an unknown wallpaper is a 404 with no Location)
 *   edge             Markdown negotiation, public asset caching, CDN preconnect
 *   home             homepage title, downloads label, crawlable links, JSON-LD
 *   urls             every sitemap.xml, rss.xml and llms.txt URL on this
 *                    site answers 200 (no 3xx/4xx/5xx)
 *   media            sampled preview videos and thumbnails answer 200/206
 *                    with no `cf-resized: err=` header
 *   og-image         og:image answers 200 and is 1200x630
 *   catalog-claim    the API total and the sitemap's /wallpaper/ URL count
 *                    are both at least the number in liveCountLabel
 *   sitemap-hygiene  no -moewalls-com / -wallhaven-com slugs and no
 *                    real-person (likeness) detail URLs in the sitemap
 *   ai-text          llms.txt, llms-full.txt and ai-info.md carry no retired
 *                    claims ('Low Power Mode', 'charged in USD')
 *   social-proof     /api/social-proof exposes the downloads line only
 *   source-prices    no literal '$12.99' outside the price modules
 *   source-phrases   no retired product claims in AI, docs and blog copy
 *   source-dates     productInfoLastReviewedIso >= currentVersionReleasedIso
 *
 * Exits 1 when any check fails.
 */

import { readdirSync, readFileSync, statSync, appendFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const args = process.argv.slice(2)
const origin = (
  args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000"
).replace(/\/$/, "")
const flag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : undefined
}
const wallpaperSample = Number(flag("wallpapers") ?? 25)
const only = flag("only")?.split(",").filter(Boolean)
const skip = new Set(flag("skip")?.split(",").filter(Boolean) ?? [])
const onlyChecks = flag("checks")?.split(",").filter(Boolean)
const concurrency = Math.max(1, Number(flag("concurrency") ?? 6))
const detailLimit = Number(flag("details") ?? 30)
const catalogLabelOverride = flag("catalog-label")

const ROOT = fileURLToPath(new URL("../", import.meta.url))
const CANONICAL_ORIGIN = "https://macwall.app"
const BRAND = "MacWall"
const BRAND_SUFFIX = ` | ${BRAND}`
const USER_AGENT =
  "MacWallSeoCheck/2.0 (+https://macwall.app/crawlers; bot; read-only)"
const CRAWL_STARTED = Date.now()
const CATEGORY_SLUGS = [
  "anime",
  "nature",
  "cars",
  "gaming",
  "space",
  "heroes",
  "dark",
  "abstract",
  "others",
]
/**
 * Real people named by the `rights: "likeness"` collections in
 * lib/seo/wallpaper-collections.ts (football, ronaldo). Their detail pages
 * stay out of the sitemap until the rights review clears them. Extend this
 * list when another likeness collection is added.
 */
const LIKENESS_DENYLIST = [
  /ronaldo/,
  /cristiano/,
  /(^|-)cr7(-|$)/,
  /(^|-)messi(-|$)/,
  /mbapp/,
  /neymar/,
  /haaland/,
]
/** Other apps named in comparison copy; a price next to them isn't MacWall's. */
const COMPETITOR_NAMES = [
  "Wallspace",
  "Wallper",
  "Backdrop",
  "Plash",
  "Wallpaper Engine",
  "WallpaperMachine",
  "Lively",
  "iWallpaper",
  "Dynamic Wallpaper Club",
  "24 Hour Wallpaper",
  "Live Wallpaper Engine HD",
  "4K Live Wallpaper",
  "Hanami",
  "Irvue",
  "Unsplash",
  "Paper",
  "Parallels",
  "Steam",
]
const WEBPAGE_TYPES = new Set([
  "WebPage",
  "AboutPage",
  "CheckoutPage",
  "CollectionPage",
  "ContactPage",
  "FAQPage",
  "ItemPage",
  "MedicalWebPage",
  "ProfilePage",
  "QAPage",
  "RealEstateListing",
  "SearchResultsPage",
])
/** Never request these: they count downloads or are crawler-disallowed. */
const NEVER_FETCH = [/^\/download\/latest/, /^\/api\/installers\//]

// ---------------------------------------------------------------- reporting

const failures = new Map()
const ran = new Set()
function fail(check, target, message) {
  if (!failures.has(check)) failures.set(check, [])
  failures.get(check).push(target ? `${target}: ${message}` : message)
}
const enabled = (check) => {
  if (skip.has(check) || (onlyChecks && !onlyChecks.includes(check)))
    return false
  ran.add(check)
  return true
}

// ------------------------------------------------------------------ helpers

function decode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
}

const textOf = (html) =>
  decode(
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()

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

/** The element starting at `start` (an opening tag), matched by depth. */
function elementEnd(html, start, tag) {
  const re = new RegExp(`<${tag}\\b|</${tag}\\s*>`, "gi")
  re.lastIndex = start + 1
  let depth = 1
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[0][1] === "/" ? -1 : 1
    if (depth === 0) return m.index + m[0].length
  }
  return html.length
}

/** Removes every `<div hidden>` subtree (attribute, not a class name). */
function stripHiddenDivs(html) {
  let out = ""
  let cursor = 0
  const open = /<div\b[^>]*>/gi
  for (let m = open.exec(html); m; m = open.exec(html)) {
    if (m.index < cursor) continue
    const attrs = m[0].replace(/"[^"]*"|'[^']*'/g, '""')
    if (!/\shidden(?=[\s>=/])/i.test(attrs)) continue
    out += html.slice(cursor, m.index)
    cursor = elementEnd(html, m.index, "div")
    open.lastIndex = cursor
  }
  return out + html.slice(cursor)
}

function firstElement(html, tag) {
  const start = html.search(new RegExp(`<${tag}\\b`, "i"))
  if (start < 0) return undefined
  return html.slice(start, elementEnd(html, start, tag))
}

const sitePath = (url) => {
  const u = new URL(url, origin)
  return `${u.pathname}${u.search}`
}
const isOwnUrl = (url) => {
  try {
    const host = new URL(url, origin).host
    return (
      host === new URL(origin).host || host === new URL(CANONICAL_ORIGIN).host
    )
  } catch {
    return false
  }
}

async function request(url, init = {}) {
  const target = url.startsWith("http") ? url : `${origin}${url}`
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(target, {
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
        ...init,
        headers: { "user-agent": USER_AGENT, ...init.headers },
      })
    } catch (error) {
      lastError = error
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

async function pool(items, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await fn(items[i], i)
      }
    })
  )
  return results
}

function sample(list, n) {
  if (list.length <= n) return list
  const step = list.length / n
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)])
}

const money = (text) => text.match(/\$\d+(?:\.\d{2})?/g) ?? []

// ------------------------------------------------------------ source facts

function readSource(path) {
  try {
    return readFileSync(join(ROOT, path), "utf8")
  } catch {
    return undefined
  }
}

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(join(ROOT, dir))
  } catch {
    return out
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue
    const path = join(dir, name)
    const stats = statSync(join(ROOT, path))
    if (stats.isDirectory()) walk(path, out)
    else if (/\.(ts|tsx|mjs|js)$/.test(name)) out.push(path)
  }
  return out
}

const siteSource = readSource("lib/macwall-site.ts") ?? ""
const sourceLabel = siteSource.match(/liveCountLabel:\s*"([^"]+)"/)?.[1]
const catalogLabel = catalogLabelOverride ?? sourceLabel

// ------------------------------------------------------------- site inputs

async function loadSitemap() {
  const res = await request("/sitemap.xml")
  if (res.status !== 200) throw new Error(`sitemap.xml HTTP ${res.status}`)
  const xml = await res.text()
  return [
    ...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g),
  ].map((m) => decode(m[1]).trim())
}

let sitemapUrls = []
try {
  sitemapUrls = await loadSitemap()
} catch (error) {
  fail("urls", "/sitemap.xml", String(error))
}
const sitemapPaths = sitemapUrls.map((u) => new URL(u).pathname || "/")
const detailPaths = sitemapPaths.filter((p) => p.startsWith("/wallpaper/"))
const sampledDetails = sample(detailPaths, wallpaperSample)
const pages = only ?? [
  ...sitemapPaths.filter((p) => !p.startsWith("/wallpaper/")),
  ...sampledDetails,
]

// -------------------------------------------------------------- page crawl

const pageData = new Map()
const statusCache = new Map()
const mediaUrls = new Map() // url -> first page it was seen on
const ogImages = new Map()

function isGalleryHub(path) {
  return (
    path === "/wallpapers" ||
    new RegExp(`^/wallpapers/(${CATEGORY_SLUGS.join("|")})$`).test(path)
  )
}
function isGalleryPage(path) {
  return (
    /^\/wallpapers\/page\/\d+$/.test(path) ||
    new RegExp(`^/wallpapers/(${CATEGORY_SLUGS.join("|")})/page/\\d+$`).test(
      path
    )
  )
}

function jsonLdBlocks(html, path) {
  const blocks = []
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      blocks.push(JSON.parse(m[1]))
    } catch (error) {
      if (enabled("jsonld"))
        fail("jsonld", path, `JSON-LD does not parse: ${error.message}`)
    }
  }
  return blocks
}

const typesOf = (node) =>
  [node?.["@type"]].flat().filter((t) => typeof t === "string")

function walkJson(value, visit, key) {
  if (Array.isArray(value)) value.forEach((v) => walkJson(v, visit, key))
  else if (value && typeof value === "object") {
    visit(value)
    for (const [k, v] of Object.entries(value)) walkJson(v, visit, k)
  } else visit(value, key)
}

function checkPageMeta(path, html, problems) {
  const title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "")
  const description = meta(html, "name", "description") ?? ""
  const robots = meta(html, "name", "robots") ?? ""
  const noindex = /noindex/i.test(robots)
  const detail = path.startsWith("/wallpaper/")

  // Detail titles drop the suffix rather than cut the wallpaper's name
  // (lib/seo/wallpaper-detail-copy.ts); titles that already say MacWall
  // keep their own wording (brandedTitle).
  if (!title.endsWith(BRAND_SUFFIX) && !title.includes(BRAND) && !detail)
    problems.push(`title doesn't name MacWall: ${title}`)
  if (title.length > 60 && !(detail && !title.endsWith(BRAND_SUFFIX)))
    problems.push(`title ${title.length} chars: ${title}`)
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
  const ogUrl = meta(html, "property", "og:url")
  if (ogUrl && !noindex && ogUrl !== expected) problems.push(`og:url ${ogUrl}`)
  for (const key of ["twitter:card", "twitter:image"])
    if (!meta(html, "name", key)) problems.push(`missing ${key}`)
  return { title, description, noindex }
}

async function checkMarkdownTwin(path, html, problems) {
  const markdown = link(html, "alternate", "text/markdown")
  if (!markdown) return problems.push("no rel=alternate text/markdown")
  const mdPath = new URL(markdown, origin).pathname
  const md = await request(mdPath)
  if (md.status !== 200) problems.push(`markdown twin HTTP ${md.status}`)
  if (!/noindex/i.test(md.headers.get("x-robots-tag") ?? ""))
    problems.push("markdown twin missing X-Robots-Tag noindex")
  if (!/accept/i.test(md.headers.get("vary") ?? ""))
    problems.push("markdown twin missing Vary: Accept")
  if (!/text\/markdown/.test(md.headers.get("content-type") ?? ""))
    problems.push("markdown twin wrong content-type")
  await md.body?.cancel()
  const negotiated = await request(path, {
    headers: { Accept: "text/markdown" },
  })
  if (!/text\/markdown/.test(negotiated.headers.get("content-type") ?? ""))
    problems.push("Accept: text/markdown does not return Markdown")
  await negotiated.body?.cancel()
}

/** Banner prices from the server HTML: { regular, sale } or null. */
function saleBanner(html) {
  const start = html.indexOf('id="launch-banner"')
  if (start < 0) return null
  const strip = html.slice(start, start + 4000).replace(/<!-- -->/g, "")
  const m = strip.match(
    /<s\b[^>]*>\s*(\$\d+(?:\.\d{2})?)\s*<\/s>\s*<strong\b[^>]*>\s*(\$\d+(?:\.\d{2})?)/
  )
  return m ? { regular: m[1], sale: m[2] } : null
}

/** Offers of every SoftwareApplication node, flattened. */
function appOffers(blocks) {
  const offers = []
  for (const block of blocks)
    walkJson(block, (node) => {
      if (!node || typeof node !== "object" || Array.isArray(node)) return
      if (!typesOf(node).includes("SoftwareApplication")) return
      offers.push(...[node.offers].flat().filter(Boolean))
    })
  return offers
}

const offerRegion = (offer) =>
  JSON.stringify(offer.eligibleRegion ?? "").includes('"IN"') ? "IN" : "default"
const dollars = (value) =>
  value === undefined || value === null || value === ""
    ? undefined
    : `$${Number(value).toFixed(2)}`

/** Regular prices that are not also a current price (stale during a sale). */
function stalePrices(blocks, banner) {
  const offers = appOffers(blocks)
  // The banner is the visible truth: its struck-through price is stale even
  // when an outdated Offer still carries it.
  const current = new Set(
    offers
      .map((o) => dollars(o.price))
      .filter((p) => p && p !== banner?.regular)
  )
  const regular = new Set()
  for (const o of offers)
    for (const spec of [o.priceSpecification].flat().filter(Boolean))
      if (/Strikethrough/i.test(JSON.stringify(spec.priceType ?? "")))
        regular.add(dollars(spec.price))
  if (banner) regular.add(banner.regular)
  return [...regular].filter((p) => p && !current.has(p) && p !== banner?.sale)
}

/**
 * True when `price` in `text` is attributed to MacWall: MacWall is the last
 * app named before it, or (`loose`) no app is named and the text talks about
 * a Pro license.
 */
function isMacwallPrice(text, price, loose = true) {
  const before = text.slice(0, text.indexOf(price))
  const mac = before.lastIndexOf(BRAND)
  const competitor = Math.max(
    ...COMPETITOR_NAMES.map((name) => before.lastIndexOf(name))
  )
  if (mac >= 0) return competitor < mac
  return (
    loose && competitor < 0 && /\b(Pro|license|licence|costs?)\b/i.test(before)
  )
}

function checkJsonLd(path, blocks) {
  const pageUrl = `${CANONICAL_ORIGIN}${path === "/" ? "" : path}`
  const normalize = (id) => {
    try {
      const u = new URL(id, pageUrl)
      return `${CANONICAL_ORIGIN}${u.pathname}${u.search}${u.hash}`
    } catch {
      return id
    }
  }
  const defined = new Set()
  const refs = []
  for (const block of blocks)
    walkJson(block, (node, key) => {
      if (typeof node === "string") {
        if (node.includes("](") || node.includes("**"))
          fail("jsonld", path, `Markdown in "${key}": ${node.slice(0, 90)}`)
        return
      }
      if (!node || typeof node !== "object" || Array.isArray(node)) return
      const keys = Object.keys(node)
      if (typeof node["@id"] === "string") {
        if (keys.length === 1) refs.push(node["@id"])
        else defined.add(normalize(node["@id"]))
      }
      if (
        "breadcrumb" in node &&
        !typesOf(node).some((t) => WEBPAGE_TYPES.has(t))
      )
        fail(
          "jsonld",
          path,
          `breadcrumb on ${typesOf(node).join("/") || "untyped node"}`
        )
      for (const field of ["dateModified"]) {
        const value = node[field]
        if (typeof value !== "string" || !value.includes("T")) continue
        const t = Date.parse(value)
        if (Number.isFinite(t) && t >= CRAWL_STARTED - 3_600_000)
          fail(
            "jsonld",
            path,
            `${field} ${value} is render time, not a content date`
          )
      }
    })
  for (const ref of new Set(refs))
    if (!defined.has(normalize(ref)))
      fail("jsonld", path, `@id ${ref} does not resolve to a node on the page`)
}

function checkFaqPrices(path, blocks, banner) {
  if (!banner) return
  const stale = stalePrices(blocks, banner)
  if (!stale.length) return
  for (const block of blocks)
    walkJson(block, (node) => {
      if (
        !node ||
        typeof node !== "object" ||
        !typesOf(node).includes("Question")
      )
        return
      const answers = [node.acceptedAnswer].flat().filter(Boolean)
      for (const answer of answers) {
        const text = String(answer.text ?? "")
        for (const sentence of text.split(/(?<=[.!?])\s+/))
          for (const price of money(sentence))
            if (
              stale.includes(price) &&
              isMacwallPrice(sentence, price) &&
              !/regular (default USD )?price/i.test(sentence)
            )
              fail(
                "faq-price",
                path,
                `"${node.name}" quotes ${price} while the banner shows ${banner.sale}`
              )
      }
    })
}

/** The page's own preview video and thumbnails (not the rails' loops). */
function collectMedia(path, html, blocks) {
  if (!path.startsWith("/wallpaper/")) return
  const slug = path.split("/").pop()
  const own = (url) => {
    const file = url
      .split(/[?#]/)[0]
      .split("/")
      .pop()
      .replace(/\.\w+$/, "")
    return file.length >= 8 && (slug.endsWith(file) || file.startsWith(slug))
  }
  const videos =
    html.match(
      /https:\/\/cdn\.macwall\.app\/cdn-cgi\/media\/[^"'\\\s<>]+\.(?:mp4|mov|m4v|webm)/g
    ) ?? []
  // Legacy files don't carry the slug; the player's own src comes first.
  const preview = videos.find(own) ?? videos[0]
  if (!preview) fail("media", path, "no preview video URL in the page")
  const urls = new Set(preview ? [preview] : [])
  for (const block of blocks)
    walkJson(block, (node) => {
      if (!node || typeof node !== "object") return
      for (const key of ["thumbnailUrl", "contentUrl"])
        for (const url of [node[key]].flat())
          if (typeof url === "string" && url.startsWith("http") && own(url))
            urls.add(url)
    })
  for (const url of urls) if (!mediaUrls.has(url)) mediaUrls.set(url, path)
}

async function crawl(path) {
  const problems = []
  const res = await request(path)
  statusCache.set(path, res.status)
  if (res.status !== 200) {
    await res.body?.cancel()
    if (enabled("page")) fail("page", path, `HTTP ${res.status}`)
    return
  }
  const html = await res.text()
  const visible = stripHiddenDivs(html)
  const blocks = jsonLdBlocks(html, path)

  if (enabled("page")) {
    const info = checkPageMeta(path, html, problems)
    await checkMarkdownTwin(path, html, problems)
    for (const p of problems) fail("page", path, p)
    pageData.set(path, info)
  } else {
    pageData.set(path, checkPageMeta(path, html, []))
  }

  const h1s = [...visible.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    textOf(m[1])
  )
  pageData.get(path).h1 = h1s[0]
  if (enabled("h1") && h1s.length !== 1)
    fail(
      "h1",
      path,
      `${h1s.length} <h1> outside <div hidden>${h1s.length ? `: ${h1s.join(" | ")}` : ""}`
    )

  if (enabled("gallery-links") && (isGalleryHub(path) || isGalleryPage(path))) {
    const footer = visible.search(/<footer\b/i)
    const head = footer < 0 ? visible : visible.slice(0, footer)
    const links = new Set(
      [
        ...head.matchAll(
          /href="(?:https:\/\/macwall\.app)?(\/wallpaper\/[^"#?]+)"/g
        ),
      ].map((m) => m[1])
    )
    const minimum = isGalleryHub(path) ? 20 : 1
    if (links.size < minimum)
      fail(
        "gallery-links",
        path,
        `${links.size} /wallpaper/ links before <footer> (need ${minimum})`
      )
  }

  if (enabled("server-text")) {
    const text = textOf(visible)
    if (/(^|[^\d,])0\+\s*(downloads|wallpapers|live wallpapers)/i.test(text))
      fail("server-text", path, 'renders a "0+" placeholder count')
    const purchase = text.match(
      /\b(?:\d[\d,]*\+?\s+(?:people|customers|users)\s+(?:bought|purchased|have bought)|someone\b[^.]{0,40}\b(?:bought|purchased|unlocked) MacWall)/i
    )
    if (purchase)
      fail("server-text", path, `purchase social proof: "${purchase[0]}"`)
  }

  if (
    enabled("blog-words") &&
    /^\/blog\/[^/]+$/.test(path) &&
    !/^\/blog\/page\//.test(path)
  ) {
    const article = firstElement(visible, "article")
    const words = article
      ? textOf(article)
          .split(" ")
          .filter((w) => /[\p{L}\p{N}]/u.test(w)).length
      : 0
    if (words < 400)
      fail("blog-words", path, `${words} words in <article> (need 400)`)
  }

  if (enabled("jsonld")) checkJsonLd(path, blocks)
  if (enabled("faq-price")) checkFaqPrices(path, blocks, saleBanner(html))
  if (enabled("media")) collectMedia(path, html, blocks)

  const og = meta(html, "property", "og:image")
  if (og && !ogImages.has(og)) ogImages.set(og, path)

  if (["/", "/pricing", "/download"].includes(path) && enabled("offer-price")) {
    const banner = saleBanner(html)
    const offers = appOffers(blocks).filter(
      (o) => offerRegion(o) === "default" && Number(o.price) > 0
    )
    if (!offers.length)
      fail("offer-price", path, "no paid SoftwareApplication Offer")
    if (banner && offers.length) {
      const prices = offers.map((o) => dollars(o.price))
      if (!prices.includes(banner.sale))
        fail(
          "offer-price",
          path,
          `banner shows ${banner.sale}, Offers say ${prices.join(", ")}`
        )
      if (prices.includes(banner.regular))
        fail(
          "offer-price",
          path,
          `Offer still at the regular ${banner.regular} during the sale`
        )
      for (const o of offers)
        if (!o.priceValidUntil)
          fail(
            "offer-price",
            path,
            `sale Offer "${o.name ?? o.price}" has no priceValidUntil`
          )
    }
  }
}

await pool(pages, (path) =>
  crawl(path).catch((error) => fail("page", path, String(error)))
)

// --------------------------------------------------------- cross-page checks

if (enabled("duplicates")) {
  for (const field of ["title", "h1", "description"]) {
    const seen = new Map()
    for (const [path, info] of pageData) {
      if (info.noindex || !info[field]) continue
      const key = info[field].toLowerCase()
      seen.set(key, [...(seen.get(key) ?? []), path])
    }
    for (const [value, paths] of seen)
      if (paths.length > 1)
        fail(
          "duplicates",
          null,
          `${field} "${value.slice(0, 80)}" on ${paths.join(", ")}`
        )
  }
}

// ---------------------------------------------------------------- redirects

async function expectRedirect(from, to) {
  const res = await request(from)
  await res.body?.cancel()
  const location = res.headers.get("location")
  if (res.status !== 308 || !location)
    return fail(
      "redirects",
      from,
      `HTTP ${res.status}${location ? ` -> ${location}` : ""} (want 308 -> ${to})`
    )
  const target = sitePath(location)
  if (target !== to) fail("redirects", from, `308 -> ${target} (want ${to})`)
  const next = await request(location.startsWith("http") ? location : target)
  await next.body?.cancel()
  if (next.status !== 200)
    fail(
      "redirects",
      from,
      `308 -> ${target} answers ${next.status}, not 200 (chain or error)`
    )
}

async function uuidWallpaper() {
  const res = await request("/api/wallpapers?limit=60")
  if (res.status !== 200) return undefined
  const { wallpapers = [] } = await res.json()
  for (const w of wallpapers) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(w.id)) continue
    const path = detailPaths.find(
      (p) => p.endsWith(`-${w.id}`) || p.endsWith(`-${w.id.slice(0, 8)}`)
    )
    if (path) return { id: w.id, path }
  }
  return undefined
}

if (enabled("redirects")) {
  const cases = [
    ["/live-wallpaper-mac", "/"],
    ["/alternatives", "/compare"],
    ["/alternatives/macwall-vs-wallper", "/best-live-wallpaper-mac"],
    ["/wallpapers/city", "/wallpapers/collections/city"],
    ["/wallpapers/sci-fi", "/wallpapers/collections/cyberpunk"],
    ["/wallpapers/video-games", "/wallpapers/gaming"],
    ["/wallpapers/page/1", "/wallpapers"],
    ["/wallpapers/anime/page/1", "/wallpapers/anime"],
    ["/pricing?amp=1", "/pricing"],
    ["/?amp=", "/"],
    ["/wallpaper", "/wallpapers"],
    ["/wallpaper?id=bogus", "/wallpapers"],
    [
      "/wallpapers/display/macbook-air/page/1",
      "/wallpapers/display/macbook-air",
    ],
    ["/wallpapers/collections/rain/page/1", "/wallpapers/collections/rain"],
    [
      "/wallpaper/space/accretion-disk-black-hole",
      "/wallpaper/space/gargantua-accretion-disk",
    ],
  ]
  const ID_SUFFIX =
    /-([0-9a-f]{8}(?:-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?)$/
  const withId = detailPaths.filter((p) => ID_SUFFIX.test(p))
  const detail = withId[Math.floor(withId.length / 3)]
  if (detail) {
    const [, , category, slug] = detail.split("/")
    const wrong = CATEGORY_SLUGS.find((c) => c !== category)
    cases.push(
      [`/wallpaper/${wrong}/${slug}`, detail],
      [`/wallpaper/${category}/${slug.toUpperCase()}`, detail],
      [`${detail}/`, detail],
      [`${detail}?amp=1`, detail]
    )
  }
  const uuid = await uuidWallpaper().catch(() => undefined)
  if (uuid) {
    const category = uuid.path.split("/")[2]
    cases.push(
      [`/wallpaper/${category}/${uuid.id}`, uuid.path],
      [`/wallpaper?id=${uuid.id}`, uuid.path]
    )
  } else {
    fail(
      "redirects",
      null,
      "no UUID wallpaper found for the bare-UUID and ?id= cases"
    )
  }
  await pool(cases, ([from, to]) =>
    expectRedirect(from, to).catch((e) => fail("redirects", from, String(e)))
  )

  // An unknown wallpaper is a plain 404, never a redirect to somewhere else.
  const missing = await request("/wallpaper/space/does-not-exist-xyz")
  await missing.body?.cancel()
  if (missing.status !== 404 || missing.headers.get("location"))
    fail(
      "redirects",
      "/wallpaper/space/does-not-exist-xyz",
      `HTTP ${missing.status}${missing.headers.get("location") ? ` -> ${missing.headers.get("location")}` : ""} (want 404, no Location)`
    )
}

// --------------------------------------------------------------------- home

if (enabled("home")) {
  const res = await request("/")
  const html = res.status === 200 ? await res.text() : ""
  if (!html) fail("home", "/", `HTTP ${res.status}`)
  else {
    const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "")
    if (title !== "Live Wallpaper App for Mac: 4K, Lock Screen | MacWall")
      fail("home", "/", `title "${title}"`)
    const downloads = siteSource.match(
      /MACWALL_DOWNLOADS_LABEL\s*=\s*"([^"]+)"/
    )?.[1]
    if (downloads && !html.includes(downloads))
      fail("home", "/", `no "${downloads}" downloads label in the server HTML`)
    if (html.includes('aria-label="0+"'))
      fail("home", "/", 'renders an aria-label="0+" placeholder')
    if (/<link[^>]+rel="modulepreload"[^>]+chart-[^"]*\.js/.test(html))
      fail("home", "/", "modulepreloads a chart-*.js chunk")
    const hrefs = [...html.matchAll(/href="([^"#?]+)/g)].map((m) => m[1])
    const collections = new Set(
      hrefs.filter((h) => /^\/wallpapers\/collections\/[a-z0-9-]+$/.test(h))
    )
    if (collections.size < 8)
      fail("home", "/", `${collections.size} collection links (want 8+)`)
    for (const href of [
      "/best-live-wallpaper-mac",
      "/alternatives/wallpaper-engine",
      "/wallpapers/macbook",
      "/faq",
    ])
      if (!hrefs.includes(href)) fail("home", "/", `no link to ${href}`)
    if (!hrefs.some((h) => h.startsWith("/wallpapers/display/")))
      fail("home", "/", "no link to a /wallpapers/display/ page")
    const graph = [
      ...html.matchAll(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
      ),
    ].flatMap((m) => {
      try {
        const block = JSON.parse(m[1])
        return block["@graph"] ?? [block]
      } catch {
        return []
      }
    })
    const webPage = graph.find((n) => typesOf(n).includes("WebPage"))
    if (
      !String(webPage?.mainEntity?.["@id"] ?? "").endsWith(
        "/#softwareapplication"
      )
    )
      fail("home", "/", "WebPage mainEntity is not #softwareapplication")
    const video = graph.find((n) => typesOf(n).includes("VideoObject"))
    if (!video?.contentUrl) fail("home", "/", "no VideoObject contentUrl")
    else {
      const head = await fetch(video.contentUrl, { method: "HEAD" }).catch(
        () => null
      )
      if (head?.status !== 200)
        fail("home", video.contentUrl, `HEAD ${head?.status ?? "failed"}`)
    }
  }
}

// --------------------------------------------------------------------- edge

if (enabled("edge")) {
  // Markdown negotiation answers with the twin, which is not noindexed here.
  const md = await request("/pricing", { headers: { accept: "text/markdown" } })
  await md.body?.cancel()
  if (md.headers.get("x-robots-tag"))
    fail(
      "edge",
      "/pricing (Accept: text/markdown)",
      `x-robots-tag: ${md.headers.get("x-robots-tag")}`
    )
  if (!/\/pricing\.md$/.test(md.headers.get("content-location") ?? ""))
    fail(
      "edge",
      "/pricing (Accept: text/markdown)",
      `content-location: ${md.headers.get("content-location") ?? "missing"} (want /pricing.md)`
    )

  const poster = await request("/hero/hero-video-poster.avif", {
    method: "HEAD",
  })
  if (!/max-age=86400/.test(poster.headers.get("cache-control") ?? ""))
    fail(
      "edge",
      "/hero/hero-video-poster.avif",
      `cache-control: ${poster.headers.get("cache-control") ?? "missing"}`
    )

  const home = await request("/")
  await home.body?.cancel()
  if (
    !/<https:\/\/cdn\.macwall\.app>;\s*rel=preconnect/.test(
      home.headers.get("link") ?? ""
    )
  )
    fail(
      "edge",
      "/",
      "Link header has no preconnect to https://cdn.macwall.app"
    )
}

// --------------------------------------------------------------------- urls

async function statusOf(path) {
  if (statusCache.has(path)) return statusCache.get(path)
  let res = await request(path, { method: "HEAD" })
  if (res.status === 405) res = await request(path)
  await res.body?.cancel()
  statusCache.set(path, res.status)
  return res.status
}

async function feedUrls(path, pattern) {
  const res = await request(path)
  if (res.status !== 200) {
    fail("urls", path, `HTTP ${res.status}`)
    return []
  }
  const body = await res.text()
  return [...body.matchAll(pattern)].map((m) => decode(m[1]))
}

if (enabled("urls")) {
  const sources = [
    ["sitemap.xml", sitemapUrls],
    ["rss.xml", await feedUrls("/rss.xml", /<(?:link|guid|url)>([^<]+)<\//g)],
    ["llms.txt", await feedUrls("/llms.txt", /\]\((https?:\/\/[^)\s]+)\)/g)],
  ]
  const checked = new Map()
  for (const [source, urls] of sources)
    for (const url of urls) {
      if (!isOwnUrl(url)) continue
      const path = sitePath(url)
      if (NEVER_FETCH.some((re) => re.test(path))) continue
      if (!checked.has(path)) checked.set(path, source)
    }
  await pool([...checked], async ([path, source]) => {
    const status = await statusOf(path).catch((e) => String(e))
    if (status !== 200)
      fail("urls", path, `HTTP ${status} (listed in ${source})`)
  })
}

// -------------------------------------------------------------------- media

async function readDimensions(bytes) {
  const b = new Uint8Array(bytes)
  if (b[0] === 0x89 && b[1] === 0x50) {
    const v = new DataView(b.buffer)
    return { width: v.getUint32(16), height: v.getUint32(20) }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2
    while (i < b.length) {
      if (b[i] !== 0xff) return undefined
      const marker = b[i + 1]
      const length = (b[i + 2] << 8) | b[i + 3]
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      )
        return {
          height: (b[i + 5] << 8) | b[i + 6],
          width: (b[i + 7] << 8) | b[i + 8],
        }
      i += 2 + length
    }
  }
  if (String.fromCharCode(...b.slice(8, 12)) === "WEBP") {
    const chunk = String.fromCharCode(...b.slice(12, 16))
    const v = new DataView(b.buffer)
    if (chunk === "VP8X")
      return {
        width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
        height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
      }
    if (chunk === "VP8 ")
      return {
        width: v.getUint16(26, true) & 0x3fff,
        height: v.getUint16(28, true) & 0x3fff,
      }
    if (chunk === "VP8L") {
      const bits = v.getUint32(21, true)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
  }
  return undefined
}

if (enabled("media")) {
  await pool([...mediaUrls], async ([url, page]) => {
    const res = await request(url, {
      headers: { range: "bytes=0-1023" },
    }).catch((e) => ({ status: String(e), headers: new Headers() }))
    await res.body?.cancel?.()
    const resized = res.headers.get("cf-resized") ?? ""
    if (res.status !== 200 && res.status !== 206)
      fail(
        "media",
        page,
        `${res.status} ${resized} ${url}`.replace(/\s+/g, " ")
      )
    else if (/err=/.test(resized))
      fail("media", page, `cf-resized ${resized} on ${url}`)
  })
}

if (enabled("og-image")) {
  await pool([...ogImages], async ([url, page]) => {
    const res = await request(url).catch((e) => ({
      status: String(e),
      headers: new Headers(),
    }))
    if (res.status !== 200) {
      await res.body?.cancel?.()
      const extra = [res.headers.get("location"), res.headers.get("cf-resized")]
        .filter(Boolean)
        .join(" ")
      return fail(
        "og-image",
        page,
        `HTTP ${res.status} ${extra} ${url}`.replace(/\s+/g, " ")
      )
    }
    const size = await readDimensions(await res.arrayBuffer())
    if (!size) fail("og-image", page, `unreadable image ${url}`)
    else if (size.width !== 1200 || size.height !== 630)
      fail(
        "og-image",
        page,
        `${size.width}x${size.height}, not 1200x630: ${url}`
      )
  })
}

// ------------------------------------------------------- catalog and claims

if (enabled("catalog-claim")) {
  const claimed = Number(catalogLabel?.replace(/[^\d]/g, ""))
  if (!claimed) {
    fail("catalog-claim", "lib/macwall-site.ts", "liveCountLabel not found")
  } else {
    const res = await request("/api/wallpapers?limit=1")
    const total = res.status === 200 ? (await res.json()).total : undefined
    if (!(total >= claimed))
      fail(
        "catalog-claim",
        "/api/wallpapers",
        `total ${total ?? `HTTP ${res.status}`} is below the "${catalogLabel}" claim`
      )
    if (detailPaths.length < claimed)
      fail(
        "catalog-claim",
        "/sitemap.xml",
        `${detailPaths.length} /wallpaper/ URLs, below the "${catalogLabel}" claim`
      )
    if (!catalogLabelOverride) {
      const llms = await request("/llms.txt")
      const text = llms.status === 200 ? await llms.text() : ""
      if (!text.includes(`${catalogLabel} `))
        fail(
          "catalog-claim",
          "/llms.txt",
          `doesn't state the current "${catalogLabel}" label`
        )
    }
  }
}

if (enabled("sitemap-hygiene")) {
  for (const path of detailPaths) {
    const slug = path.split("/").pop()
    if (/-(moewalls|wallhaven)-com(-[0-9a-f]{8})?$/.test(slug))
      fail("sitemap-hygiene", path, "scraped-source slug in the sitemap")
    if (LIKENESS_DENYLIST.some((re) => re.test(slug)))
      fail(
        "sitemap-hygiene",
        path,
        "real-person (likeness) wallpaper in the sitemap"
      )
  }
}

if (enabled("ai-text")) {
  const retired = [/Low Power Mode/i, /charged in USD/i, /25,000\+ users/i]
  for (const path of ["/llms.txt", "/llms-full.txt", "/ai-info.md"]) {
    const res = await request(path)
    if (res.status !== 200) {
      fail("ai-text", path, `HTTP ${res.status}`)
      continue
    }
    const text = await res.text()
    for (const re of retired)
      // The docs in llms-full.txt correctly say it no longer pauses by itself.
      if (
        re.test(text) &&
        !(path === "/llms-full.txt" && /Low Power/.test(re.source))
      )
        fail("ai-text", path, `contains "${text.match(re)[0]}"`)
  }
}

if (enabled("social-proof")) {
  const res = await request("/api/social-proof")
  if (res.status !== 200)
    fail("social-proof", "/api/social-proof", `HTTP ${res.status}`)
  else {
    const body = await res.json().catch(() => ({}))
    const keys = Object.keys(body)
    if (
      keys.join() !== "downloadsLine" ||
      !/downloads$/.test(body.downloadsLine)
    )
      fail(
        "social-proof",
        "/api/social-proof",
        `exposes ${keys.join(", ") || "nothing"}, want only downloadsLine`
      )
  }
}

// ------------------------------------------------------------ source checks

const isComment = (line) => /^\s*(\*|\/\/|\/\*)/.test(line)

if (enabled("source-prices")) {
  const allowed = [
    /^lib\/license\//,
    /^lib\/pricing\//,
    /^lib\/admin\//,
    /^components\/analytics\/purchase-conversion-tracker\.tsx$/,
  ]
  const competitorFiles = new Set([
    "lib/seo/compare-pages.ts",
    "lib/seo/landing-pages.ts",
  ])
  for (const file of ["app", "components", "lib", "worker"].flatMap((d) =>
    walk(d)
  )) {
    const rel = relative(ROOT, join(ROOT, file))
    if (allowed.some((re) => re.test(rel))) continue
    readSource(rel)
      .split("\n")
      .forEach((line, i) => {
        if (!line.includes("$12.99") || isComment(line)) return
        // Comparison rows quote other apps' prices (with a sourceLabel);
        // only a price attributed to MacWall on the same line fails there.
        if (competitorFiles.has(rel) && !isMacwallPrice(line, "$12.99", false))
          return
        fail("source-prices", `${rel}:${i + 1}`, line.trim().slice(0, 110))
      })
    if (!/^lib\/analytics\/|^components\/analytics\//.test(rel))
      readSource(rel)
        .split("\n")
        .forEach((line, i) => {
          if (/macwall\.pro\.price\b/.test(line) && !isComment(line))
            fail(
              "source-prices",
              `${rel}:${i + 1}`,
              "uses the deprecated macwall.pro.price; use proPriceFor()"
            )
        })
  }
}

if (enabled("source-phrases")) {
  const copyDirs = [
    "lib/ai",
    "lib/docs",
    "lib/blog",
    "lib/learn",
    "lib/faq",
    "app/llms.txt",
    "app/llms-full.txt",
  ]
  const everywhere = [
    [
      /charged in USD/i,
      "says 'charged in USD' (Checkout may charge local currency)",
    ],
    [/no sign-up/i, "says 'no sign-up' (the trial needs an email)"],
    [/Every wallpaper in MacWall is a 4K/i, "claims every wallpaper is 4K"],
    [
      /Discord community for review/i,
      "sends submissions to Discord for review",
    ],
    [/25,000\+ users|downloadsLabel\}\s+users/i, "calls downloads 'users'"],
  ]
  const aiOnly = [
    [/Low Power Mode/i, "mentions Low Power Mode (removed in 4.1.0)"],
  ]
  const gifClaim = (line) =>
    (/\b(MP4|MOV|M4V)\b[^.\n]{0,24}\bGIFs?\b/i.test(line) ||
      /\b(import|imports|add|adds|drop|upload|supports?|plays?)\b[^.\n]{0,40}\bGIFs?\b/i.test(
        line
      ) ||
      /\bGIFs?\b[^.\n]{0,40}\b(work|supported|import)/i.test(line)) &&
    !/convert|n't|\bnot\b|\bno\b|first|terrible/i.test(line)
  for (const file of copyDirs.flatMap((d) => walk(d))) {
    const rel = relative(ROOT, join(ROOT, file))
    const ai = /^lib\/ai\/|^app\/llms/.test(rel)
    readSource(rel)
      .split("\n")
      .forEach((line, i) => {
        if (isComment(line)) return
        for (const [re, why] of [...everywhere, ...(ai ? aiOnly : [])])
          if (re.test(line)) fail("source-phrases", `${rel}:${i + 1}`, why)
        if (gifClaim(line))
          fail(
            "source-phrases",
            `${rel}:${i + 1}`,
            `GIF import claim: ${line.trim().slice(0, 90)}`
          )
      })
  }
}

if (enabled("source-dates")) {
  const reviewed = siteSource.match(
    /productInfoLastReviewedIso:\s*"([^"]+)"/
  )?.[1]
  const released = siteSource.match(
    /currentVersionReleasedIso:\s*"([^"]+)"/
  )?.[1]
  if (!reviewed || !released)
    fail(
      "source-dates",
      "lib/macwall-site.ts",
      "review or release date not found"
    )
  else if (reviewed < released)
    fail(
      "source-dates",
      "lib/macwall-site.ts",
      `productInfoLastReviewedIso ${reviewed} is older than the ${released} release`
    )
}

// ------------------------------------------------------------------ summary

const lines = []
for (const check of ran) {
  const list = failures.get(check) ?? []
  lines.push(list.length ? `✗ ${check}: ${list.length} failing` : `✓ ${check}`)
}
for (const [check, list] of failures) {
  if (!ran.has(check)) lines.push(`✗ ${check}: ${list.length} failing`)
  console.log(`\n✗ ${check} (${list.length})`)
  const shown = detailLimit > 0 ? list.slice(0, detailLimit) : list
  for (const item of shown) console.log(`  - ${item}`)
  if (shown.length < list.length)
    console.log(`  … ${list.length - shown.length} more`)
}
console.log(`\n${lines.join("\n")}`)
console.log(
  `\n${pages.length} pages crawled, ${failures.size} of ${ran.size} checks failing (${origin}, catalog label "${catalogLabel}")`
)

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = [
    `### SEO check: ${origin}`,
    "",
    ...lines.map((l) => `- ${l}`),
    "",
    ...[...failures].flatMap(([check, list]) => [
      `<details><summary>${check} (${list.length})</summary>`,
      "",
      ...list.slice(0, 200).map((item) => `- \`${item.replace(/`/g, "'")}\``),
      "",
      "</details>",
    ]),
  ]
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md.join("\n")}\n`)
}

process.exit(failures.size ? 1 : 0)
