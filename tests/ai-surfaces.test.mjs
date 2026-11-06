import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import test from "node:test"

const { llmsTxtHeader, llmsTxtSummary } = await import("../lib/ai/llms-txt.ts")
const { currentPromotionLines, licenseTableRows } =
  await import("../lib/ai/price-facts.ts")
const { getMacwallAiInfoPage } = await import("../lib/ai/macwall-ai-info.ts")
const { marketingAiSummaryLinks } =
  await import("../lib/marketing-ai-summary.ts")
const { getAboutPage, getPressPage } =
  await import("../lib/company/about-press.ts")

const at = (iso) => Date.parse(iso)
const ORIGIN = "https://macwall.app"

test("llms.txt promotion lines follow the sale calendar per region", () => {
  // Black Friday (default) and Diwali (India) both live.
  const both = llmsTxtHeader(ORIGIN, at("2026-11-06T12:00:00Z"))
  assert.match(both, /\nCurrent promotion: Black Friday: 30% off .*BLACKFRIDAY/)
  assert.match(both, /\nIn India: Diwali Sale: 30% off .*DIWALI/)

  // The India gap between Diwali and India's Black Friday: default line only.
  const gap = currentPromotionLines(at("2026-11-15T00:00:00Z"))
  assert.equal(gap.length, 1)
  assert.match(gap[0], /^Current promotion: Black Friday/)

  // India's Black Friday from 2026-11-26T18:30Z.
  const indiaBf = currentPromotionLines(at("2026-11-27T00:00:00Z"))
  assert.equal(indiaBf.length, 2)
  assert.match(indiaBf[1], /^In India: Black Friday: .*BLACKFRIDAY/)
  assert.match(indiaBf[1], /\$3\.49 instead of \$4\.99/)

  // After every sale: no promotion line at all.
  assert.deepEqual(currentPromotionLines(at("2026-12-03T00:00:00Z")), [])
  assert.doesNotMatch(
    llmsTxtHeader(ORIGIN, at("2026-12-03T00:00:00Z")),
    /Current promotion|In India:/
  )
})

test("llms.txt summary states the shipped behavior, not the old copy", () => {
  for (const iso of ["2026-11-06T12:00:00Z", "2026-12-03T00:00:00Z"]) {
    const summary = llmsTxtSummary(at(iso))
    assert.doesNotMatch(summary, /Low Power Mode|low battery|charged in USD/)
    assert.match(summary, /Pause on battery/)
    assert.match(summary, /System Wallpaper/)
    assert.match(summary, /MacWall Native/)
    assert.match(summary, /macOS 27/)
    assert.match(summary, /local currency/)
    assert.match(summary, /paid app with a free 24-hour trial/)
  }
  assert.match(llmsTxtSummary(at("2026-12-03T00:00:00Z")), /\$12\.99.*\$4\.99/)
})

test("the license table always carries the regular prices", () => {
  for (const iso of ["2026-11-06T12:00:00Z", "2026-12-03T00:00:00Z"]) {
    const text = JSON.stringify(licenseTableRows(at(iso)))
    for (const price of ["$12.99", "$19.99", "$34.99", "$4.99", "$7.99"]) {
      assert.ok(text.includes(price), `${iso}: ${price}`)
    }
  }
})

test("/ai-info answers 'Is MacWall free?' with No and quotes no stale facts", () => {
  const page = getMacwallAiInfoPage(at("2026-11-06T12:00:00Z"))
  const free = page.faq.find((item) => item.question === "Is MacWall free?")
  assert.ok(free)
  assert.match(
    free.answer,
    /^No\. MacWall is a paid app with a free 24-hour trial/
  )

  const text = JSON.stringify(page)
  assert.doesNotMatch(text, /charged in USD/)
  assert.doesNotMatch(text, /Low Power Mode/)
  assert.doesNotMatch(text, /needs Screen Recording/)
  assert.doesNotMatch(text, /purchase:\d/)
  assert.doesNotMatch(text, /Wallper/i)
  assert.match(text, /local currency/)
  assert.match(text, /Current promotion:\*\* Black Friday/)
  assert.match(text, /macOS 27 Golden Gate/)
  assert.ok(page.faq.length >= 14, `${page.faq.length} FAQs`)

  const later = JSON.stringify(getMacwallAiInfoPage(at("2026-12-03T00:00:00Z")))
  assert.doesNotMatch(later, /Current promotion/)
  assert.match(later, /\$12\.99 one time/)
})

test("footer AI prompts use live URLs and current assistant endpoints", () => {
  const links = Object.values(marketingAiSummaryLinks)
  assert.equal(links.length, 4)
  for (const { href } of links) {
    const prompt = decodeURIComponent(new URL(href).searchParams.get("q"))
    assert.doesNotMatch(prompt, /\/submit\b|zero-overhead|ranks among/)
    assert.match(prompt, /https:\/\/macwall\.app\/ai-info/)
    assert.ok(href.length < 1500, `${href.length} chars`)
  }
  assert.match(
    marketingAiSummaryLinks.chatgpt.href,
    /^https:\/\/chatgpt\.com\/\?q=/
  )
  assert.match(
    marketingAiSummaryLinks.claude.href,
    /^https:\/\/claude\.ai\/new\?q=/
  )
  assert.match(marketingAiSummaryLinks.googleAiMode.label, /Google AI Mode/)
})

test("/about and /press name the company and invent no people or figures", () => {
  for (const page of [getAboutPage(), getPressPage()]) {
    const text = JSON.stringify(page)
    assert.match(text, /OG APPS, LLC/)
    assert.match(text, /25,000\+ downloads/)
    assert.doesNotMatch(text, /customers|purchases|revenue|founded|founder/i)
    assert.doesNotMatch(text, /Wallper/i)
  }
})
