import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import test from "node:test"

const {
  DISPLAY_GRID_LIMIT,
  DISPLAY_GRID_MAX_SHARED,
  buildDisplayIndex,
  buildDisplayPage,
  buildMacbookHub,
  displayPageDef,
  displayPageDefs,
  planDisplayGrids,
} = await import("../lib/seo/display-pages.ts")
const { macDisplays, macDisplaysAtResolution } =
  await import("../lib/seo/mac-displays.ts")
const { getTool } = await import("../lib/tools/tools.ts")

/**
 * A catalog shaped like the live one (2026-11): mostly 3840 × 2160 in two
 * spellings, some 1080p and 1440p, a few 4096 × 2304, ultrawide and 8K
 * loops, most-liked first.
 */
function syntheticCatalog() {
  const sizes = [
    ["3840x2160", 485],
    ["3840×2160", 242],
    ["1920x1080", 208],
    ["2560x1440", 58],
    ["3440x1440", 32],
    ["4096x2304", 21],
    ["5120x1440", 3],
    ["7680×4320", 3],
    ["", 80],
  ]
  const pool = sizes.flatMap(([resolution, count]) =>
    Array.from({ length: count }, () => resolution)
  )
  // Deterministic interleave so every size is spread through the like order.
  let seed = 7
  for (let i = pool.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const j = seed % (i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.map((resolution, index) => ({
    id: `w${index}`,
    name: `Wallpaper ${index}`,
    category: "Nature",
    tags: [],
    resolution,
    durationSeconds: 10,
    fileSizeBytes: 1,
    videoKey: `videos/w${index}.mp4`,
    thumbKey: `thumbs/w${index}.jpg`,
    videoUrl: "",
    thumbUrl: "",
    likeCount: pool.length - index,
    createdAt: "2026-10-01T00:00:00Z",
  }))
}

const catalog = syntheticCatalog()

test("every model page has a full grid and pages share at most half", () => {
  const plans = planDisplayGrids(catalog)
  const grids = [...plans.entries()].map(([key, plan]) => [
    key,
    new Set(plan.grid.map((w) => w.id)),
  ])
  for (const [key, ids] of grids) {
    if (key !== "ultrawide") assert.equal(ids.size, DISPLAY_GRID_LIMIT, key)
  }
  for (let i = 0; i < grids.length; i += 1) {
    for (let j = i + 1; j < grids.length; j += 1) {
      const [a, idsA] = grids[i]
      const [b, idsB] = grids[j]
      const shared = [...idsA].filter((id) => idsB.has(id)).length
      assert.ok(
        shared <= DISPLAY_GRID_MAX_SHARED,
        `${a} and ${b} share ${shared}`
      )
    }
  }
})

test("the 4K page lists every 4K loop over numbered pages, most-liked first", () => {
  const def = displayPageDef("4k")
  const first = buildDisplayPage(def, catalog, 1)
  const uhd = catalog.filter((w) => /^(3840|4096|7680)/.test(w.resolution))
  assert.equal(first.fitCount, uhd.length)
  assert.equal(first.totalPages, Math.ceil(uhd.length / DISPLAY_GRID_LIMIT))
  assert.deepEqual(
    first.wallpapers.map((w) => w.id),
    uhd.slice(0, DISPLAY_GRID_LIMIT).map((w) => w.id)
  )
  const seen = new Set()
  for (let n = 1; n <= first.totalPages; n += 1) {
    for (const w of buildDisplayPage(def, catalog, n).wallpapers) seen.add(w.id)
  }
  assert.equal(seen.size, uhd.length)
  assert.equal(buildDisplayPage(def, catalog, first.totalPages + 1), null)
  // Model pages have no numbered pages.
  assert.equal(
    buildDisplayPage(displayPageDef("macbook-air"), catalog, 2),
    null
  )
})

test("the MacBook hub paginates its own order of the 4K list", () => {
  const hub = buildMacbookHub(catalog, 1)
  const seen = new Set()
  for (let n = 1; n <= hub.totalPages; n += 1) {
    for (const w of buildMacbookHub(catalog, n).wallpapers) seen.add(w.id)
  }
  assert.equal(seen.size, hub.fitCount)
  // Editorial paragraphs only: not the table, steps or sources.
  const words = hub.page.sections
    .flatMap((block) => (block.type === "p" ? [block.text] : []))
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/\s+/).length
  assert.ok(words >= 250 && words <= 400, `hub copy is ${words} words`)
})

test("headlines keep Apple's casing and the Neo has a page", () => {
  assert.ok(displayPageDef("imac").headline.startsWith("iMac"))
  assert.ok(displayPageDef("macbook-neo"))
  for (const display of macDisplays) {
    assert.ok(displayPageDef(display.page), display.id)
    assert.ok(
      displayPageDef(display.page).displayIds.includes(display.id),
      display.id
    )
  }
  const page = buildDisplayPage(displayPageDef("macbook-neo"), catalog)
  assert.ok(page.page.sections[0].text.includes("2408 × 1506"))
})

test("FAQ answers carry no Markdown links", () => {
  const pages = [
    ...displayPageDefs.map((def) => buildDisplayPage(def, catalog).page),
    buildMacbookHub(catalog).page,
    buildDisplayIndex(catalog).page,
  ]
  for (const page of pages) {
    for (const item of page.faq ?? []) {
      assert.ok(!/\]\(/.test(item.answer), `${page.pathname}: ${item.question}`)
    }
  }
})

test("the index links every display page", () => {
  const { entries } = buildDisplayIndex(null)
  for (const def of displayPageDefs) {
    assert.ok(entries.some((entry) => entry.href.endsWith(`/${def.slug}`)))
  }
})

test("a native screen size maps to its Mac", () => {
  assert.deepEqual(
    macDisplaysAtResolution(3024, 1964).map((d) => d.id),
    ["macbook-pro-14-m5"]
  )
  assert.deepEqual(macDisplaysAtResolution(1920, 1080), [])
})

test("the palette tool leads with the US head term", () => {
  const tool = getTool("color-palette")
  assert.ok(tool.title.startsWith("Color Palette From Image"))
})
