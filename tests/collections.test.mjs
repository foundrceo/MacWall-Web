import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import test from "node:test"

const {
  collectionPublishable,
  promotableCollections,
  wallpaperCollections,
  wallpaperMatchesCollection,
  wallpaperMatchesCollectionFallback,
  getWallpaperCollection,
} = await import("../lib/seo/wallpaper-collections.ts")

test("promotable collections: generic, or cleared, never likeness", () => {
  const promoted = promotableCollections()
  assert.ok(promoted.length > 0)
  for (const entry of promoted) {
    assert.notEqual(entry.rights, "likeness", entry.slug)
    assert.ok(entry.rights === "generic" || entry.rightsCleared, entry.slug)
  }
})

test("likeness collections are never built", () => {
  for (const entry of wallpaperCollections) {
    assert.equal(collectionPublishable(entry), entry.rights !== "likeness")
  }
})

test("no collection quotes a MacWall price", () => {
  for (const entry of wallpaperCollections) {
    const text = JSON.stringify(entry)
    assert.ok(!/\$\d/.test(text), `${entry.slug} quotes a price`)
  }
})

test("colour collections also match on the measured palette", () => {
  const blue = getWallpaperCollection("blue")
  assert.ok(blue?.palette)
  const plain = { name: "Quiet Harbour", tags: [] }
  assert.equal(wallpaperMatchesCollection(plain, blue), false)
  assert.equal(
    wallpaperMatchesCollection(plain, blue, ["#1a3fbf", "#2456d6"]),
    true
  )
})

test("seasonal fallbacks only use their own patterns", () => {
  const withFallback = wallpaperCollections.find((entry) => entry.fallback)
  assert.ok(withFallback)
  assert.equal(
    wallpaperMatchesCollectionFallback(
      { name: "Snowy Mountain Cabin", tags: [] },
      withFallback
    ),
    true
  )
  assert.equal(
    wallpaperMatchesCollectionFallback(
      { name: "Jon Snow", tags: [] },
      withFallback
    ),
    false
  )
})
