import "./alias-hooks.mjs"
import assert from "node:assert/strict"
import test from "node:test"

const categorySeo = await import("../lib/seo/category-seo.ts")
const landing = await import("../lib/seo/landing-pages.ts")
const compare = await import("../lib/seo/compare-pages.ts")
const facts = await import("../lib/seo/comparison-facts.ts")
const site = await import("../lib/macwall-site.ts")

const words = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .split(/\s+/)
    .filter(Boolean).length

/** A MacWall price as any of the price helpers can print it. */
function macwallPriceStrings() {
  const prices = new Set()
  for (const at of [
    Date.parse("2026-11-06T00:00:00Z"),
    Date.parse("2026-12-03T00:00:00Z"),
  ]) {
    const p = facts.macwallPriceFacts(at)
    for (const value of [p.pro, p.proRegular, p.india, p.plus])
      prices.add(value)
  }
  return [...prices]
}

test("category hubs: nine entries, answer-first intros of 80-120 words, no prices", () => {
  assert.equal(categorySeo.categorySeoEntries.length, 9)
  assert.deepEqual(
    categorySeo.categorySeoEntries.map((entry) => entry.name),
    [...site.macwall.categories]
  )
  for (const entry of categorySeo.categorySeoEntries) {
    const count = words(entry.intro)
    assert.ok(
      count >= 80 && count <= 120,
      `${entry.name} intro is ${count} words`
    )
    assert.ok(entry.intro.includes(site.macwallCatalog.liveCountLabel))
    assert.match(entry.intro, /macOS 15/)
    assert.match(entry.intro, /macOS 26/)
    assert.ok(entry.faq.length >= 2 && entry.faq.length <= 3)
    for (const faq of entry.faq) assert.doesNotMatch(faq.answer, /\$\d/)
    assert.ok(entry.description.length <= 160, `${entry.name} description`)
    assert.ok(categorySeo.categoryCollections(entry.name).length > 0)
  }
  assert.match(categorySeo.categorySeo.Anime.intro, /for Mac, not Windows/)
  assert.equal(categorySeo.categoryDisplayLabel("Others"), "More")
  assert.equal(categorySeo.galleryIndexSeo.title, "4K Live Wallpapers for Mac")
})

test("category pages delegate to category-seo and drop the old template", () => {
  const page = landing.wallpaperCategoryPage("Cars", { total: 162 })
  assert.equal(page.title, "Car Live Wallpapers for Mac")
  assert.equal(page.pathname, "/wallpapers/cars")
  assert.match(page.sections[0].text, /all 162 car loops/)
  assert.doesNotMatch(JSON.stringify(page), /Browse cars/)
  assert.equal(
    landing.wallpaperCategoryPage("Others").headline,
    "More live wallpapers for Mac"
  )
})

test("/download names no MacWall price and links the getting-started docs", () => {
  const text = JSON.stringify({ ...landing.downloadPage })
  for (const price of macwallPriceStrings())
    assert.ok(!text.includes(price), price)
  for (const path of [
    "/docs/install-macwall",
    "/docs/set-a-live-wallpaper",
    "/docs/troubleshooting",
    "/docs/license-and-activation",
  ]) {
    assert.ok(text.includes(path), path)
  }
})

test("comparison FAQs never quote a MacWall price; bodies follow the sale calendar", () => {
  const pages = [
    landing.bestLiveWallpaperMacPage,
    landing.wallpaperEngineAlternativePage,
    landing.macwallVsBackdropPage,
    landing.macwallVsWallspacePage,
    landing.livelyWallpaperMacPage,
    landing.screenSaverMacPage,
    compare.twentyFourHourWallpaperPage,
    compare.plashAlternativePage,
    compare.dynamicWallpaperClubPage,
    compare.iwallpaperAlternativePage,
    compare.compareIndexPage,
  ]
  // $12.99 (Wallspace Pro) and $4.99 (Wallpaper Engine) are also competitor
  // prices, quoted with their sources.
  const competitorPrices = new Set(["$12.99", "$4.99"])
  const macwallOnly = macwallPriceStrings().filter(
    (price) => !competitorPrices.has(price)
  )
  for (const page of pages) {
    for (const faq of page.faq ?? []) {
      for (const price of macwallOnly) {
        assert.ok(
          !faq.answer.includes(price),
          `${page.pathname}: ${faq.question}`
        )
      }
    }
  }

  const during = facts.macwallPriceFacts(Date.parse("2026-11-20T00:00:00Z"))
  const after = facts.macwallPriceFacts(Date.parse("2026-12-03T00:00:00Z"))
  assert.equal(during.onSale, true)
  assert.match(during.summary, /regular \$12\.99/)
  assert.equal(after.onSale, false)
  assert.ok(after.summary.startsWith("$12.99 one-time for 3 Macs"))
})

test("comparison pages cite dated sources and carry real dates", () => {
  for (const page of compare.comparisonPages) {
    const sources = facts.pageCitations(page.sections)
    assert.ok(sources.length > 0, `${page.pathname} has a Sources list`)
    for (const source of sources) assert.match(source.url, /^https:\/\//)
    assert.match(page.publishedAt ?? "", /^\d{4}-\d{2}-\d{2}$/, page.pathname)
    assert.match(page.updatedAt ?? "", /^\d{4}-\d{2}-\d{2}$/, page.pathname)
    assert.match(
      JSON.stringify(page.sections),
      /accessed \d{1,2} [A-Z][a-z]+ \d{4}/
    )
  }
  assert.ok(
    landing.wallpaperEngineAlternativePage.title.includes(
      facts.comparisonTitleYear(
        landing.wallpaperEngineAlternativePage.updatedAt
      )
    )
  )
  const lively = compare
    .macWallpaperApps()
    .find((app) => app.name === "Lively Wallpaper")
  assert.equal(lively.platforms, "Windows 10 (1903+) and 11; no Mac version")
})

test("no Wallper comparison page is linked or listed", () => {
  for (const page of [...compare.comparisonPages, landing.screenSaverMacPage]) {
    assert.doesNotMatch(JSON.stringify(page), /macwall-vs-wallper/)
  }
})
