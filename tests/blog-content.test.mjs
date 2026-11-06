import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import fs from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import {
  matchRedirect,
  requestContextFromRequest,
} from "vinext/config/config-matchers"

import nextConfig from "../next.config.mjs"

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

const { blogArticles, blogArticleWordCount, blogArticleLastModified } =
  await import("../lib/blog/index.ts")
const { getRelatedBlogArticles, getRelatedGuides } =
  await import("../lib/blog/partition-articles.ts")
const { blogArticleImageCrops, blogThumbSrcSets, blogThumbAvifSrc } =
  await import("../lib/blog/tile-media.ts")

const ORIGIN = "https://macwall.app"
const redirects = await nextConfig.redirects()
const liveSlugs = new Set(blogArticles.map((article) => article.slug))

function resolve(pathname) {
  const request = new Request(new URL(pathname, ORIGIN))
  return matchRedirect(
    new URL(request.url).pathname,
    redirects,
    requestContextFromRequest(request)
  )
}

/** Every piece of visible text in a post, as sentences. */
function sentences(article) {
  const texts = article.sections.flatMap((block) => {
    if ("text" in block) return [block.text]
    if ("items" in block) return block.items
    if (block.type === "table")
      return [...block.columns, ...block.rows.flat(), block.caption ?? ""]
    return [block.caption ?? ""]
  })
  for (const item of article.faq ?? []) texts.push(item.question, item.answer)
  texts.push(article.title, article.headline, article.description)
  return texts.flatMap((text) => text.split(/(?<=[.!?])\s+/))
}

function internalBlogLinks(article) {
  const json = JSON.stringify(article.sections) + JSON.stringify(article.faq)
  return [...json.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)].map(
    (match) => match[1]
  )
}

test("every post has at least 400 words and a computed read time", () => {
  for (const article of blogArticles) {
    const words = blogArticleWordCount(article)
    assert.ok(words >= 400, `${article.slug} has ${words} words`)
    assert.equal(
      article.readMinutes,
      Math.max(1, Math.round(words / 220)),
      article.slug
    )
  }
})

test("dates are real calendar days and updates come after publishing", () => {
  for (const article of blogArticles) {
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/, article.slug)
    if (article.updatedAt) {
      assert.match(article.updatedAt, /^\d{4}-\d{2}-\d{2}$/, article.slug)
      assert.ok(article.updatedAt >= article.publishedAt, article.slug)
    }
    assert.equal(
      blogArticleLastModified(article),
      article.updatedAt ?? article.publishedAt
    )
  }
})

test("no post claims GIF import or the retired Low Power Mode pause", () => {
  for (const article of blogArticles) {
    for (const sentence of sentences(article)) {
      assert.doesNotMatch(
        sentence,
        /\b(MP4|MOV|M4V)\b(?:\s*[,/]\s*|\s+or\s+|\s+and\s+|,\s+or\s+)+GIF\b/,
        `${article.slug} lists GIF as a format: ${sentence}`
      )
      assert.doesNotMatch(sentence, /Low Power Mode/, article.slug)
    }
  }
})

test("titles carry no year that goes stale", () => {
  for (const article of blogArticles)
    assert.doesNotMatch(article.title, /\b20\d\d\b/, article.slug)
})

test("every merged post is a one-hop 308 to a live page", () => {
  const merges = redirects.filter(
    (rule) => rule.source.startsWith("/blog/") && !rule.has
  )
  assert.ok(merges.length > 0)
  for (const rule of merges) {
    const slug = rule.source.slice("/blog/".length)
    assert.ok(!liveSlugs.has(slug), `${slug} is live and redirected`)
    assert.equal(rule.permanent, true, rule.source)
    assert.equal(resolve(rule.destination), null, `${rule.source} chains`)
    if (rule.destination.startsWith("/blog/"))
      assert.ok(
        liveSlugs.has(rule.destination.slice("/blog/".length)),
        `${rule.source} points at a missing post`
      )
  }
  assert.equal(
    resolve("/lock-screen-wallpaper")?.destination,
    "/blog/how-to-change-lock-screen-on-mac"
  )
})

test("posts link only to live posts, never to a merged one", () => {
  for (const article of blogArticles)
    for (const slug of internalBlogLinks(article))
      assert.ok(liveSlugs.has(slug), `${article.slug} links to /blog/${slug}`)
})

test("related reading excludes the post itself and stays in range", () => {
  for (const article of blogArticles) {
    const related = getRelatedBlogArticles(article.slug)
    assert.ok(related.length > 0 && related.length <= 3, article.slug)
    assert.ok(!related.some((other) => other.slug === article.slug))
    const guides = getRelatedGuides(article.slug)
    assert.ok(guides.length <= 3)
    for (const guide of guides)
      assert.match(guide.pathname, /^\/(docs|learn)\//, article.slug)
  }
  const lockScreen = getRelatedBlogArticles("how-to-change-lock-screen-on-mac")
  assert.ok(
    lockScreen.some((article) => /lock|screen-saver/.test(article.slug)),
    "the Lock Screen guide is related to the Lock Screen posts"
  )
})

test("structured-data crops and srcset siblings follow the thumbs script", () => {
  assert.deepEqual(blogArticleImageCrops("macos-wallpapers"), [
    "/blog/thumbs/macos-wallpapers-16x9.jpg",
    "/blog/thumbs/macos-wallpapers-4x3.jpg",
    "/blog/thumbs/macos-wallpapers-1x1.jpg",
  ])
  assert.deepEqual(blogThumbSrcSets("/blog/thumbs/macos-wallpapers.jpg"), {
    jpeg: "/blog/thumbs/macos-wallpapers-640.jpg 640w, /blog/thumbs/macos-wallpapers.jpg 1200w",
    avif: "/blog/thumbs/macos-wallpapers-640.avif 640w, /blog/thumbs/macos-wallpapers.avif 1200w",
  })
  assert.equal(blogThumbSrcSets("/blog/thumbs/macos-wallpapers-list.jpg"), null)
  assert.equal(blogThumbAvifSrc("/blog/thumbs/macos-wallpapers-og.jpg"), null)
  assert.equal(blogThumbAvifSrc("/blog/thumbs/macos-wallpapers-16x9.jpg"), null)
  assert.equal(
    blogThumbAvifSrc("/blog/thumbs/macos-wallpapers-list.jpg"),
    "/blog/thumbs/macos-wallpapers-list.avif"
  )
})
