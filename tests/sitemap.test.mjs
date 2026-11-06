import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import fs from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"

// `@/lib/blog` is a folder (lib/blog/index.ts); alias-hooks only maps `@/x`
// to `x.ts`, so resolve folder imports to their index here.
const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const path = specifier.slice(2)
      const index = new URL(`${path}/index.ts`, root)
      if (!fs.existsSync(new URL(`${path}.ts`, root)) && fs.existsSync(index))
        return { url: index.href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

const {
  absoluteSiteUrl,
  addImages,
  applyHubDates,
  contentImageSources,
  newestDate,
  noteDate,
  parseContentDate,
} = await import("../lib/seo/sitemap-helpers.ts")
const { blogArticles } = await import("../lib/blog/index.ts")
const { blogTilePoster } = await import("../lib/blog/tile-media.ts")

const day = (iso) => new Date(`${iso}T00:00:00.000Z`)

test("content dates parse date-only and ISO values, and reject the rest", () => {
  assert.deepEqual(parseContentDate("2026-10-24"), day("2026-10-24"))
  assert.deepEqual(
    parseContentDate("2026-10-25T06:23:03.094Z"),
    new Date("2026-10-25T06:23:03.094Z")
  )
  assert.equal(parseContentDate(""), undefined)
  assert.equal(parseContentDate("soon"), undefined)
  assert.equal(parseContentDate(undefined), undefined)
  assert.equal(parseContentDate(new Date(Number.NaN)), undefined)
})

test("newestDate and noteDate keep the newest date", () => {
  assert.deepEqual(
    newestDate([undefined, day("2026-08-02"), day("2026-11-05"), undefined]),
    day("2026-11-05")
  )
  assert.equal(newestDate([]), undefined)

  const dates = new Map([["/download", day("2026-11-01")]])
  noteDate(dates, "/download", day("2026-10-24"))
  assert.deepEqual(dates.get("/download"), day("2026-11-01"))
  noteDate(dates, "/download", day("2026-11-03"))
  assert.deepEqual(dates.get("/download"), day("2026-11-03"))
  noteDate(dates, "/new", undefined)
  assert.equal(dates.has("/new"), false)
})

test("a hub takes its newest listed child's date", () => {
  const dates = new Map([
    ["/blog/a", day("2026-10-27")],
    ["/blog/b", day("2026-11-06")],
    ["/blog/unlisted", day("2026-12-01")],
    ["/legal", day("2026-10-30")],
    ["/legal/terms", day("2026-10-01")],
  ])
  const paths = ["/blog", "/blog/a", "/blog/b", "/legal", "/legal/terms"]
  applyHubDates(dates, paths, [
    { path: "/blog", isChild: (path) => path.startsWith("/blog/") },
    { path: "/legal", isChild: (path) => path.startsWith("/legal/") },
    { path: "/faq", isChild: (path) => path.startsWith("/faq/") },
  ])
  // Unlisted children don't count.
  assert.deepEqual(dates.get("/blog"), day("2026-11-06"))
  // A hub's own newer date stands.
  assert.deepEqual(dates.get("/legal"), day("2026-10-30"))
  // Hubs that aren't in the sitemap get nothing.
  assert.equal(dates.has("/faq"), false)
})

test("image helpers absolutize, dedupe and keep only image blocks", () => {
  const origin = "https://macwall.app"
  assert.equal(
    absoluteSiteUrl(origin, "/blog/thumbs/x.jpg"),
    "https://macwall.app/blog/thumbs/x.jpg"
  )
  assert.equal(
    absoluteSiteUrl(origin, "https://cdn.macwall.app/thumbs/x.jpg"),
    "https://cdn.macwall.app/thumbs/x.jpg"
  )
  assert.deepEqual(
    contentImageSources([
      { type: "p", text: "Intro" },
      {
        type: "image",
        src: "/docs/settings.png",
        alt: "Settings",
        width: 1,
        height: 1,
      },
      {
        type: "video",
        src: "/v.mp4",
        poster: "/v.jpg",
        caption: "Demo",
        durationIso: "PT10S",
        uploadDate: "2026-11-06",
      },
    ]),
    ["/docs/settings.png"]
  )
  assert.deepEqual(contentImageSources(undefined), [])

  const images = new Map()
  addImages(images, "/wallpapers", ["a.jpg", "", null, "a.jpg", "b.jpg"])
  addImages(images, "/empty", [undefined, ""])
  assert.deepEqual(images.get("/wallpapers"), ["a.jpg", "b.jpg"])
  assert.equal(images.has("/empty"), false)
})

test("every blog post's sitemap image is a file in public/", () => {
  for (const article of blogArticles) {
    const src = blogTilePoster(article.slug, article.category, "tile")
    assert.ok(
      fs.existsSync(new URL(`../public${src}`, import.meta.url)),
      `${article.slug}: ${src} is missing (npm run blog-thumbs:generate)`
    )
  }
})

test("the sitemap stays one /sitemap.xml with no video entries", () => {
  const source = fs.readFileSync(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8"
  )
  // robots.txt and Search Console point at /sitemap.xml.
  assert.doesNotMatch(source, /generateSitemaps/)
  // Previews aren't fetchable yet; video entries would list failing URLs.
  assert.doesNotMatch(source, /videos\s*:/)
  // Noindex (thin) wallpaper pages stay out.
  assert.match(source, /filter\(\(entry\) => !entry\.thin\)/)
})
