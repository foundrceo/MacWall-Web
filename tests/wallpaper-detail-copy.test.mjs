import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import test from "node:test"

const {
  WALLPAPER_DESCRIPTION_MAX,
  loopLengthPhrase,
  distinctiveColorNames,
  isNameEchoTag,
  isRenameLeftoverTag,
  loopLengthAdjective,
  macFitLabel,
  macFitRows,
  macFitSummary,
  matchingDisplayPage,
  wallpaperMetaDescription,
  wallpaperQualityLabel,
  wallpaperTitles,
  withIndefiniteArticle,
} = await import("../lib/seo/wallpaper-detail-copy.ts")

test("quality is judged on both edges", () => {
  assert.equal(wallpaperQualityLabel("3840x2160"), "4K")
  assert.equal(wallpaperQualityLabel("3840×2160"), "4K")
  assert.equal(wallpaperQualityLabel("3812x2160"), "4K")
  assert.equal(wallpaperQualityLabel("3840x1712"), "4K")
  assert.equal(wallpaperQualityLabel("4096x2304"), "4K")
  assert.equal(wallpaperQualityLabel("7680×4320"), "8K")
  assert.equal(wallpaperQualityLabel("5120x2880"), "5K")
  // A triple-wide 1080p loop is not 5K.
  assert.equal(wallpaperQualityLabel("5760x1080"), "1080p")
  assert.equal(wallpaperQualityLabel("3440x1440"), "1440p")
  assert.equal(wallpaperQualityLabel("1920x1080"), "1080p")
  assert.equal(wallpaperQualityLabel("1280x720"), null)
  assert.equal(wallpaperQualityLabel(""), null)
})

test("titles keep the whole name and drop the brand suffix first", () => {
  assert.deepEqual(wallpaperTitles("Gojo Domain", "4K", "MacWall"), {
    pageTitle: "Gojo Domain 4K Live Wallpaper for Mac",
    documentTitle: "Gojo Domain 4K Live Wallpaper for Mac | MacWall",
  })
  // The quality word only when the loop is 4K or more.
  assert.equal(
    wallpaperTitles("Harbor Twilight", "1080p", "MacWall").documentTitle,
    "Harbor Twilight Live Wallpaper for Mac | MacWall"
  )
  const long = "Totoro Chilling in the Sunlight My Neighbor Totoro"
  const titles = wallpaperTitles(long, "4K", "MacWall")
  assert.equal(titles.documentTitle, `${long} 4K Live Wallpaper for Mac`)
  assert.ok(!titles.documentTitle.includes("…"))
  assert.equal(
    wallpaperTitles("Sunset Wallpaper", null, "MacWall").pageTitle,
    "Sunset Wallpaper for Mac"
  )
})

test("articles follow how the word is spoken", () => {
  assert.equal(
    withIndefiniteArticle("4K anime live wallpaper"),
    "a 4K anime live wallpaper"
  )
  assert.equal(
    withIndefiniteArticle("8K space live wallpaper"),
    "an 8K space live wallpaper"
  )
  assert.equal(
    withIndefiniteArticle("anime live wallpaper"),
    "an anime live wallpaper"
  )
  assert.equal(withIndefiniteArticle("18-second loop"), "an 18-second loop")
  assert.equal(withIndefiniteArticle("80-second loop"), "an 80-second loop")
  assert.equal(
    withIndefiniteArticle("1080p car live wallpaper"),
    "a 1080p car live wallpaper"
  )
  assert.equal(withIndefiniteArticle("110-second loop"), "a 110-second loop")
})

test("loop lengths read naturally", () => {
  assert.equal(loopLengthAdjective(12), "12-second")
  assert.equal(loopLengthAdjective(95), "95-second")
  assert.equal(loopLengthAdjective(120), "2-minute")
  assert.equal(loopLengthAdjective(253), "4-minute 13-second")
  assert.equal(loopLengthAdjective(0), "")
  assert.equal(loopLengthPhrase(69), "69 seconds")
  assert.equal(loopLengthPhrase(60), "1 minute")
  assert.equal(loopLengthPhrase(253), "4 minutes 13 seconds")
})

test("colours skip neutrals and repeated hues", () => {
  assert.deepEqual(
    distinctiveColorNames(["black", "charcoal", "deep indigo", "grey"]),
    ["deep indigo"]
  )
  assert.deepEqual(distinctiveColorNames(["purple", "deep purple", "orange"]), [
    "purple",
    "orange",
  ])
  assert.deepEqual(distinctiveColorNames(["off-white", "grey", "white"]), [
    "off-white",
  ])
  // Only neutrals: they are the colours.
  assert.deepEqual(distinctiveColorNames(["black", "charcoal", "grey"]), [
    "black",
    "charcoal",
  ])
})

test("name echoes and rename leftovers are recognised", () => {
  assert.ok(isNameEchoTag("gojo", "Gojo Domain"))
  assert.ok(isNameEchoTag("spider-man", "Spider-Man Upside Down"))
  assert.ok(!isNameEchoTag("fire", "Magma Vortex"))
  const renamed = {
    id: "golden-anime-hero",
    name: "Super Saiyan Trunks Graffiti",
  }
  assert.ok(isRenameLeftoverTag("golden", renamed))
  assert.ok(isRenameLeftoverTag("hero", renamed))
  assert.ok(!isRenameLeftoverTag("goku", renamed))
  // Not renamed: id words are name words.
  assert.ok(
    !isRenameLeftoverTag("rain", {
      id: "alphabet-code-rain",
      name: "Alphabet Code Rain",
    })
  )
  // UUID ids carry no old name.
  assert.ok(
    !isRenameLeftoverTag("hero", {
      id: "0d37b046-df8f-4ef1-8fff-0dcacd0b9c28",
      name: "Rural Hillside Cabin",
    })
  )
})

const base = {
  name: "Magma Vortex",
  qualityLabel: "4K",
  categoryLabel: "abstract",
  durationSeconds: 19,
  colorNames: ["purple", "deep purple", "orange"],
  themes: ["fire"],
  brand: "MacWall",
}

test("meta descriptions are whole clauses within 155 characters", () => {
  const text = wallpaperMetaDescription(base)
  assert.equal(
    text,
    "Magma Vortex: a 4K abstract live wallpaper for Mac that loops every 19 seconds, in purple and orange tones. Preview it free, then set it with MacWall."
  )
  assert.ok(text.length <= WALLPAPER_DESCRIPTION_MAX)

  const long = wallpaperMetaDescription({
    ...base,
    name: "Totoro Chilling in the Sunlight My Neighbor Totoro",
    categoryLabel: "anime",
    durationSeconds: 24,
    colorNames: ["lime", "yellow", "deep lime"],
    themes: ["ghibli", "summer"],
  })
  assert.ok(long.length <= WALLPAPER_DESCRIPTION_MAX, long)
  assert.ok(
    long.startsWith("Totoro Chilling in the Sunlight My Neighbor Totoro: ")
  )
  assert.ok(long.endsWith("."))
  assert.ok(!long.includes("…"))

  // Short names leave room for themes and a call to action.
  const short = wallpaperMetaDescription({
    ...base,
    name: "Rain",
    themes: ["storm"],
  })
  assert.ok(short.endsWith(" with MacWall."))
  assert.ok(short.includes("featuring storm"))
  assert.ok(short.length <= WALLPAPER_DESCRIPTION_MAX)

  // Colours never push the call to action out.
  const busy = wallpaperMetaDescription({
    ...base,
    name: "Mercedes-AMG SL Courtyard",
    qualityLabel: "1080p",
    categoryLabel: "car",
    durationSeconds: 69,
    colorNames: ["off-white", "grey", "white"],
    themes: [],
  })
  assert.ok(busy.endsWith(" with MacWall."), busy)
  assert.ok(busy.includes("that loops every 69 seconds"), busy)

  // The catch-all category adds no word; unknown length adds no clause.
  assert.equal(
    wallpaperMetaDescription({
      ...base,
      name: "Sunset Drive",
      qualityLabel: null,
      categoryLabel: "",
      durationSeconds: 0,
      colorNames: [],
      themes: [],
    }),
    "Sunset Drive: a live wallpaper for Mac. Preview it free, then set it as your desktop with MacWall. MacWall starts with a free 24-hour trial."
  )
})

test("descriptions never quote a price", () => {
  for (const name of [
    "A",
    "Gojo Domain",
    "Porsche 911 GT3 RS Garage at Night",
  ]) {
    assert.ok(!wallpaperMetaDescription({ ...base, name }).includes("$"))
  }
})

test("fit rows cover current Macs once per resolution", () => {
  const rows = macFitRows("3840x2160")
  const ids = rows.map((row) => row.display.id)
  assert.ok(ids.includes("macbook-air-13-m5"))
  assert.ok(ids.includes("studio-display"))
  // Same 5120 × 2880 panel as the Studio Display.
  assert.ok(!ids.includes("studio-display-xdr"))
  // Not sold any more.
  assert.ok(!ids.includes("pro-display-xdr"))
  const air = rows.find((row) => row.display.id === "macbook-air-13-m5")
  assert.equal(air.fits, true)
  assert.equal(macFitLabel(air), "Native")
  assert.equal(air.href, "/wallpapers/display/macbook-air")
  const studio = rows.find((row) => row.display.id === "studio-display")
  assert.equal(studio.fits, false)
  assert.equal(macFitLabel(studio), `Upscaled ${studio.upscalePercent}%`)
  assert.deepEqual(macFitRows(""), [])
})

test("fit summary matches the rows", () => {
  const uhd = macFitSummary(macFitRows("3840x2160"), "3840x2160")
  assert.match(uhd, /^At 3840 × 2160 it fills every current MacBook/)
  assert.match(
    uhd,
    /on the iMac 24″ and Studio Display it is upscaled by up to 33%\.$/
  )
  const small = macFitSummary(macFitRows("2768x1542"), "2768x1542")
  assert.match(
    small,
    /fills the MacBook Neo at native resolution; on every other current Mac it is upscaled/
  )
  const hd = macFitSummary(macFitRows("1920x1080"), "1920x1080")
  assert.match(
    hd,
    /^At 1920 × 1080 it is upscaled on every current Mac screen, by \d+% to \d+%\.$/
  )
  const eightK = macFitSummary(macFitRows("7680x4320"), "7680x4320")
  assert.equal(
    eightK,
    "At 7680 × 4320 it fills every current Mac screen at native resolution."
  )
  assert.equal(macFitSummary([], ""), null)
})

test("display page follows the loop's shape and size", () => {
  assert.equal(
    matchingDisplayPage("3840x2160", macFitRows("3840x2160")).href,
    "/wallpapers/display/4k"
  )
  assert.equal(
    matchingDisplayPage("5760x1080", macFitRows("5760x1080")).href,
    "/wallpapers/display/ultrawide"
  )
  const qhd = matchingDisplayPage("2560x1440", macFitRows("2560x1440"))
  assert.ok(qhd.href.startsWith("/wallpapers/display/"))
  assert.equal(matchingDisplayPage("", []), null)
})
