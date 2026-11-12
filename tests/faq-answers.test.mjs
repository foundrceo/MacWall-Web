import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import fs from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"

// lib/seo/routes.ts imports "@/lib/blog", a folder: resolve it to its index.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/lib/blog") {
      return nextResolve(
        new URL("../lib/blog/index.ts", import.meta.url).href,
        context
      )
    }
    return nextResolve(specifier, context)
  },
})

const {
  FAQ_HUB_PATH,
  faqAnswerSeoPage,
  faqAnswers,
  faqHubSeoPage,
  faqMarkdownDocuments,
  faqPricePaths,
  getAllFaqSlugs,
  getFaqAnswer,
} = await import("../lib/faq/answers.ts")
const { faqAnswerJsonLd, faqHubJsonLd } = await import("../lib/faq/json-ld.ts")
const { getDocsPage } = await import("../lib/docs/pages.ts")
const { getLearnPage } = await import("../lib/learn/pages.ts")
const { displayPageDef } = await import("../lib/seo/display-pages.ts")
const { indexableMarketingPaths } = await import("../lib/seo/routes.ts")
const { formatPriceCents, offersFor, proPriceFor } =
  await import("../lib/pricing/sale-aware-price.ts")

const at = (iso) => Date.parse(iso)
const words = (text) => text.split(/\s+/).filter(Boolean).length
/** Everything a reader or crawler sees for one answer. */
const pageText = (answer) =>
  JSON.stringify([answer.answer, answer.description, answer.details])

/** Moments across the sale calendar: Black Friday everywhere, then none. */
const MOMENTS = [
  "2026-11-06T12:00:00Z",
  "2026-11-15T00:00:00Z",
  "2026-11-28T00:00:00Z",
  "2026-12-03T00:00:00Z",
].map(at)

test("10 to 12 answers with unique slugs, all on /faq/{slug}", () => {
  const slugs = getAllFaqSlugs()
  assert.ok(slugs.length >= 10 && slugs.length <= 12, `${slugs.length}`)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const answer of faqAnswers()) {
    assert.match(answer.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)
    assert.equal(answer.pathname, `${FAQ_HUB_PATH}/${answer.slug}`)
    assert.match(answer.publishedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.match(answer.updatedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(answer.updatedAt >= answer.publishedAt)
  }
})

test("every direct answer is 40 to 60 words of plain text, sale or not", () => {
  for (const now of MOMENTS) {
    for (const answer of faqAnswers(now)) {
      const count = words(answer.answer)
      assert.ok(
        count >= 40 && count <= 60,
        `${answer.slug} at ${new Date(now).toISOString()}: ${count} words`
      )
      // It renders as plain text in the lead and in JSON-LD.
      assert.doesNotMatch(answer.answer, /\*\*|\[|\]\(|`|—/)
    }
  }
})

test("titles and descriptions fit the SEO rules and carry no price", () => {
  for (const answer of faqAnswers()) {
    const title = /\bMacWall\b/.test(answer.title)
      ? answer.title
      : `${answer.title} | MacWall`
    assert.ok(title.length <= 60, `${answer.slug} title ${title.length}`)
    const length = answer.description.length
    assert.ok(length >= 110 && length <= 160, `${answer.slug} desc ${length}`)
    assert.doesNotMatch(answer.title + answer.description, /—|\$\d/)
    assert.ok(answer.question.endsWith("?"), answer.slug)
  }
})

test("no answer quotes a regular price while that region's sale runs", () => {
  for (const now of MOMENTS) {
    for (const region of ["default", "india"]) {
      const offers = offersFor(region, now)
      if (offers[0].saleCents === null) continue
      const regular = offers.map((price) =>
        formatPriceCents(price.regularCents)
      )
      for (const answer of faqAnswers(now)) {
        for (const price of regular) {
          // India's 10-Mac regular price equals the default Pro price, which
          // is fine to show when only India is at full price.
          if (
            region === "india" &&
            offers.some(
              (offer) => formatPriceCents(offer.currentCents) === price
            )
          )
            continue
          assert.ok(
            !pageText(answer).includes(price),
            `${answer.slug} shows ${price} during the ${region} sale`
          )
        }
      }
    }
  }
})

test("prices follow the sale calendar", () => {
  const during = getFaqAnswer("is-macwall-free", at("2026-11-20T00:00:00Z"))
  const proSale = proPriceFor("default", at("2026-11-20T00:00:00Z"))
  assert.ok(during.answer.includes(formatPriceCents(proSale.currentCents)))
  assert.match(during.answer, /Black Friday sale, 30% off until Dec 1, 2026\./)
  assert.ok(!pageText(during).includes("$12.99"))

  const after = getFaqAnswer("is-macwall-free", at("2026-12-03T00:00:00Z"))
  assert.match(after.answer, /It costs \$12\.99\.$/)
  // India's price is listed, at its Black Friday price.
  const india = getFaqAnswer("is-macwall-free", at("2026-11-15T00:00:00Z"))
  assert.ok(pageText(india).includes("$3.49"))
  assert.ok(!pageText(india).includes("$4.99"))

  assert.deepEqual(faqPricePaths(), [
    "/faq/is-macwall-free",
    "/faq/how-many-macs-per-license",
  ])
})

test("doc links and related answers point at pages that exist", () => {
  const slugs = new Set(getAllFaqSlugs())
  const appPage = (pathname) =>
    fs.existsSync(
      new URL(`../app/(marketing)${pathname}/page.tsx`, import.meta.url)
    )
  for (const answer of faqAnswers()) {
    assert.ok(answer.docLinks.length >= 2, answer.slug)
    for (const link of answer.docLinks) {
      const [, section, slug] = link.href.split("/")
      const exists =
        section === "docs"
          ? Boolean(getDocsPage(slug))
          : section === "learn"
            ? Boolean(getLearnPage(slug))
            : link.href.startsWith("/wallpapers/display/")
              ? Boolean(displayPageDef(link.href.split("/").at(-1)))
              : appPage(link.href)
      assert.ok(exists, `${answer.slug} links ${link.href}`)
    }
    for (const slug of answer.related) {
      assert.ok(slugs.has(slug), `${answer.slug} related ${slug}`)
      assert.notEqual(slug, answer.slug)
    }
  }
})

test("FAQPage JSON-LD: one question whose answer is the visible lead", () => {
  const origin = "https://macwall.app"
  const answer = getFaqAnswer("does-macwall-drain-battery")
  const graph = faqAnswerJsonLd(answer, origin)["@graph"]
  const page = graph.find((node) => node["@type"] === "FAQPage")
  const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList")
  assert.equal(page["@id"], `${origin}/faq/does-macwall-drain-battery#webpage`)
  assert.equal(page.mainEntity.length, 1)
  assert.equal(page.mainEntity[0].name, answer.question)
  assert.equal(page.mainEntity[0].acceptedAnswer.text, answer.answer)
  assert.deepEqual(page.breadcrumb, { "@id": crumbs["@id"] })
  assert.deepEqual(
    crumbs.itemListElement.map((crumb) => [crumb.name, crumb.item]),
    [
      ["MacWall", origin],
      ["FAQ", `${origin}/faq`],
      ["Battery use", `${origin}/faq/does-macwall-drain-battery`],
    ]
  )

  const hub = faqHubJsonLd(faqAnswers())["@graph"]
  const collection = hub.find((node) => node["@type"] === "CollectionPage")
  assert.equal(collection.mainEntity.numberOfItems, getAllFaqSlugs().length)
})

test("Markdown twins, llms.txt entries and the sitemap cover every answer", () => {
  const documents = faqMarkdownDocuments()
  assert.equal(documents[0].path, FAQ_HUB_PATH)
  assert.equal(documents.length, getAllFaqSlugs().length + 1)
  for (const document of documents) {
    assert.doesNotMatch(document.summary, /\$\d/)
    const markdown = document.render()
    assert.match(markdown, /^---\n/)
    assert.match(markdown, /\n# .+\?|\n# MacWall questions/)
  }
  const twin = faqAnswerSeoPage(getFaqAnswer("does-macwall-work-offline"))
  assert.equal(twin.headline, "Does MacWall work offline?")
  assert.ok(faqHubSeoPage().sections.length > 1)

  const paths = new Set(indexableMarketingPaths())
  assert.ok(paths.has(FAQ_HUB_PATH))
  for (const slug of getAllFaqSlugs()) assert.ok(paths.has(`/faq/${slug}`))
})
