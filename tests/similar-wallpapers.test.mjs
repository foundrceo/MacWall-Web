import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import test from "node:test"

const { rankSimilarWallpapers, similarPairHash, SIMILAR_WALLPAPER_LIMIT } =
  await import("../lib/public-catalog/similar.ts")

function wallpaper(id, overrides = {}) {
  return {
    id,
    name: id,
    category: "Cars",
    tags: [],
    resolution: "3840x2160",
    durationSeconds: 10,
    fileSizeBytes: 1,
    videoKey: `${id}.mp4`,
    thumbKey: `${id}.jpg`,
    videoUrl: "",
    thumbUrl: "",
    likeCount: 0,
    createdAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  }
}

/** Signals read from test fields so each rule can be exercised alone. */
const signals = {
  collections: (w) => w.collectionSlugs ?? [],
  tags: (w) => w.tags,
  palette: (w) => w.palette ?? [],
  excluded: (w) => Boolean(w.noindex),
}

// 40 cars, most-liked first like the catalog index, plus other categories.
const cars = Array.from({ length: 40 }, (_, i) =>
  wallpaper(`car-${i}`, { likeCount: 1000 - i })
)
const others = Array.from({ length: 20 }, (_, i) =>
  wallpaper(`anime-${i}`, { category: "Anime", likeCount: 900 - i })
)
const catalog = [...cars, ...others]

test("rail is 12 items, excludes the page itself and noindex pages", () => {
  const hidden = wallpaper("car-hidden", { noindex: true, likeCount: 5000 })
  const rail = rankSimilarWallpapers(cars[20], [hidden, ...catalog], signals)
  assert.equal(rail.length, SIMILAR_WALLPAPER_LIMIT)
  assert.equal(SIMILAR_WALLPAPER_LIMIT, 12)
  const ids = rail.map((w) => w.id)
  assert.ok(!ids.includes("car-20"))
  assert.ok(!ids.includes("car-hidden"))
  assert.equal(new Set(ids).size, ids.length)
})

test("same category ranks above unrelated categories", () => {
  const rail = rankSimilarWallpapers(cars[20], catalog, signals)
  assert.ok(rail.every((w) => w.category === "Cars"))
})

test("a category's ten most-liked wallpapers share one slot", () => {
  const popular = new Set(cars.slice(0, 10).map((w) => w.id))
  for (const current of cars.slice(10)) {
    const rail = rankSimilarWallpapers(current, catalog, signals)
    assert.ok(rail.filter((w) => popular.has(w.id)).length <= 1)
  }
})

test("pages in one category get different, stable sets", () => {
  const railIds = (current) =>
    rankSimilarWallpapers(current, catalog, signals)
      .map((w) => w.id)
      .join(",")
  const sets = new Set(cars.slice(10, 20).map(railIds))
  assert.ok(sets.size >= 9, `only ${sets.size} distinct rails`)
  assert.equal(railIds(cars[15]), railIds(cars[15]))

  // Inbound links spread across the category instead of the top six.
  const inbound = new Map()
  for (const current of cars) {
    for (const w of rankSimilarWallpapers(current, catalog, signals))
      inbound.set(w.id, (inbound.get(w.id) ?? 0) + 1)
  }
  assert.ok(inbound.size >= 30, `${inbound.size} cars linked`)
})

test("collection, category, tags and palette add up", () => {
  const current = wallpaper("current", {
    collectionSlugs: ["porsche"],
    tags: ["night"],
    palette: ["#1e3a8a"],
  })
  const candidates = [
    // Cars + porsche + night: 1 + 3 + 2
    wallpaper("collection-and-tag", {
      collectionSlugs: ["porsche"],
      tags: ["night"],
    }),
    // Cars + porsche: 1 + 3
    wallpaper("collection", { collectionSlugs: ["porsche"] }),
    // Cars + night: 1 + 2
    wallpaper("tag", { tags: ["night"] }),
    // Another category through the porsche collection: 3
    wallpaper("other-collection", {
      category: "Anime",
      collectionSlugs: ["porsche"],
    }),
    // Cars + a near blue: 1 + 1
    wallpaper("palette", { palette: ["#1f3b8c"] }),
    // Cars only: 1
    wallpaper("category", { palette: ["#f97316"] }),
    // Another category with a matching tag and colour but no collection: 0
    wallpaper("other-tag", {
      category: "Anime",
      tags: ["night"],
      palette: ["#1f3b8c"],
    }),
    current,
  ]
  const ids = rankSimilarWallpapers(current, candidates, signals, 7).map(
    (w) => w.id
  )
  assert.deepEqual(ids.slice(0, 2), ["collection-and-tag", "collection"])
  assert.deepEqual(ids.slice(2, 4).sort(), ["other-collection", "tag"])
  assert.deepEqual(ids.slice(4), ["palette", "category", "other-tag"])
})

test("pair hash is order-sensitive and 32-bit", () => {
  const a = similarPairHash("x", "y")
  assert.equal(a, similarPairHash("x", "y"))
  assert.notEqual(a, similarPairHash("y", "x"))
  assert.ok(Number.isInteger(a) && a >= 0 && a < 2 ** 32)
})
