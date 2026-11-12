import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import fs from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"

// lib/seo/og-images.ts imports its JSON manifest; load `@/….json` as a module.
const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/") && specifier.endsWith(".json")) {
      return { url: new URL(specifier.slice(2), root).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".json")) {
      const json = fs.readFileSync(new URL(url), "utf8")
      return {
        format: "module",
        source: `export default ${json}`,
        shortCircuit: true,
      }
    }
    return nextLoad(url, context)
  },
})

const { macwallSchemaGraph } = await import("../lib/macwall-json-ld.ts")
const {
  articleJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
  jsonLdGraph,
  markdownToPlainText,
  videoObjectJsonLd,
  webPageJsonLd,
} = await import("../lib/seo/json-ld-helpers.ts")
const { webPageWithBreadcrumbsJsonLd } =
  await import("../lib/legal-page-json-ld.ts")
const { brandedTitle, createSeoPageMetadata, createSimplePageMetadata } =
  await import("../lib/seo/create-page-metadata.ts")
const { macwall } = await import("../lib/macwall-site.ts")

const ORIGIN = "https://macwall.app"
const ORG_ID = `${ORIGIN}/#organization`
const at = (iso) => Date.parse(iso)

function graphAt(iso) {
  return macwallSchemaGraph(ORIGIN, at(iso))["@graph"]
}
const nodeOfType = (graph, type) => graph.find((node) => node["@type"] === type)
const appOffers = (iso) =>
  nodeOfType(graphAt(iso), "SoftwareApplication").offers
const paidOffers = (offers, region) =>
  offers.filter(
    (offer) =>
      offer.price !== "0" &&
      (region === "india" ? offer.eligibleRegion : offer.ineligibleRegion)
  )
const prices = (offers) => offers.map((offer) => offer.price)

/** Every Organization anywhere in a payload, at any depth. */
function organizations(value, found = []) {
  if (Array.isArray(value)) value.forEach((item) => organizations(item, found))
  else if (value && typeof value === "object") {
    if (value["@type"] === "Organization") found.push(value)
    Object.values(value).forEach((item) => organizations(item, found))
  }
  return found
}

test("site entity: one name, no tagline, stable profiles only", () => {
  const graph = graphAt("2026-11-05T12:00:00Z")
  const organization = nodeOfType(graph, "Organization")
  const website = nodeOfType(graph, "WebSite")

  assert.equal(organization.name, "MacWall")
  assert.equal(website.name, "MacWall")
  for (const node of [organization, website]) {
    assert.deepEqual(node.alternateName, ["MacWall App", "macwall.app"])
    assert.ok(!node.alternateName.includes(macwall.fullTagline))
  }
  assert.equal(organization.legalName, undefined)
  assert.ok(
    organization.sameAs.includes(
      "https://www.youtube.com/channel/UC0AggWIjNCI-iCQC1NNHdeA"
    )
  )
  assert.ok(!organization.sameAs.some((url) => url.includes("discord")))
  assert.equal(organization.logo.width, 1024)
})

test("app node: category, dates, no rating, download page not the DMG", () => {
  const app = nodeOfType(graphAt("2026-11-05T12:00:00Z"), "SoftwareApplication")
  assert.equal(app.applicationCategory, "DesktopEnhancementApplication")
  assert.equal(app.dateModified, macwall.currentVersionReleasedIso)
  assert.equal(app.datePublished, "2026-06-04")
  assert.equal(app.downloadUrl, `${ORIGIN}/download`)
  assert.equal(app.aggregateRating, undefined)
  assert.equal(app.review, undefined)
  assert.ok(!app.featureList.some((feature) => /low power mode/i.test(feature)))
})

test("offers: a separate free trial, then 3 default and 3 India packs", () => {
  const offers = appOffers("2026-11-20T00:00:00Z")
  assert.ok(offers.every((offer) => offer["@type"] === "Offer"))
  assert.ok(offers.every((offer) => offer.seller?.["@id"] === ORG_ID))
  const trial = offers.filter((offer) => offer.price === "0")
  assert.equal(trial.length, 1)
  assert.equal(trial[0].priceValidUntil, undefined)
  assert.equal(paidOffers(offers, "default").length, 3)
  const india = paidOffers(offers, "india")
  assert.equal(india.length, 3)
  for (const offer of india) {
    assert.deepEqual(offer.eligibleRegion, { "@type": "Country", name: "IN" })
    assert.equal(offer.priceCurrency, "USD")
  }
})

test("Black Friday: the default Pro offer is the visible sale price until Dec 1", () => {
  const offers = paidOffers(appOffers("2026-11-20T00:00:00Z"), "default")
  assert.deepEqual(prices(offers), ["9.09", "13.99", "24.49"])
  const [pro] = offers
  assert.equal(pro.priceValidUntil, "2026-12-01")
  assert.equal(pro.priceSpecification.price, "12.99")
})

test("India: Black Friday prices until Dec 1", () => {
  for (const iso of ["2026-11-06T00:00:00Z", "2026-11-12T00:00:00Z", "2026-11-27T00:00:00Z"]) {
    const india = paidOffers(appOffers(iso), "india")
    assert.deepEqual(prices(india), ["3.49", "5.59", "9.09"], iso)
    assert.equal(india[0].priceValidUntil, "2026-12-01", iso)
  }
})

test("after 2026-12-02T08:00Z every offer is back at its regular price", () => {
  const offers = appOffers("2026-12-02T08:00:00Z")
  assert.deepEqual(prices(paidOffers(offers, "default")), [
    "12.99",
    "19.99",
    "34.99",
  ])
  assert.deepEqual(prices(paidOffers(offers, "india")), [
    "4.99",
    "7.99",
    "12.99",
  ])
  assert.ok(offers.every((offer) => offer.priceValidUntil === undefined))
})

test("FAQ answers carry plain text, not Markdown", () => {
  const faq = faqPageJsonLd([
    {
      question: "Where is the `.dmg`?",
      answer:
        "See [Uninstall MacWall](/docs/uninstall-macwall). Email [support@macwall.app](mailto:support@macwall.app) or drag **MacWall** to `Applications`.",
    },
  ])
  const [question] = faq.mainEntity
  assert.equal(question.name, "Where is the .dmg?")
  assert.equal(
    question.acceptedAnswer.text,
    "See Uninstall MacWall. Email support@macwall.app or drag MacWall to Applications."
  )
  assert.equal(markdownToPlainText("**[4K wallpapers](/x)**"), "4K wallpapers")
})

test("articles: Organization publisher by @id, crumbs, crops and sources", () => {
  const doc = articleJsonLd({
    origin: ORIGIN,
    pathname: "/docs/install-macwall",
    headline: "Install MacWall on Mac",
    description: "How to install.",
    datePublished: "2026-06-01",
    dateModified: "2026-08-02",
    image: ["/a-16x9.jpg", "/a-4x3.jpg", "/a-1x1.jpg", "/a-16x9.jpg"],
    section: { name: "Docs", pathname: "/docs" },
    type: "TechArticle",
    citation: [
      "https://support.apple.com/x",
      { name: "Apple", url: "https://apple.com" },
    ],
    about: "#softwareapplication",
  })
  const [breadcrumb, page, article] = doc["@graph"]
  assert.deepEqual(
    breadcrumb.itemListElement.map((crumb) => crumb.name),
    ["MacWall", "Docs", "Install MacWall on Mac"]
  )
  assert.equal(page.breadcrumb["@id"], breadcrumb["@id"])
  assert.equal(article["@type"], "TechArticle")
  assert.equal(article.mainEntityOfPage["@id"], page["@id"])
  assert.equal(article.image.length, 3)
  assert.ok(article.image.every((url) => url.startsWith(`${ORIGIN}/`)))
  assert.equal(article.citation.length, 2)
  assert.deepEqual(article.about, { "@id": `${ORIGIN}/#softwareapplication` })
  // The site Organization by reference only: no second, inline Organization.
  assert.deepEqual(article.author, { "@id": ORG_ID })
  assert.deepEqual(article.publisher, { "@id": ORG_ID })
  assert.deepEqual(organizations(doc), [])
  // No empty dates when a page has none.
  const undated = articleJsonLd({
    origin: ORIGIN,
    pathname: "/learn/x",
    headline: "X",
    description: "X",
    datePublished: "",
  })
  assert.equal(undated["@graph"][2].datePublished, undefined)
})

test("breadcrumbs: parent levels, Legal hub, short leaf, MacWall root", () => {
  const docs = webPageWithBreadcrumbsJsonLd({
    origin: ORIGIN,
    pathname: "/alternatives/plash",
    pageTitle: "Plash vs MacWall",
    headline: "Plash vs MacWall",
    description: "Compare.",
    parent: { name: "Compare", pathname: "/compare" },
    aboutId: "#softwareapplication",
  })
  const [crumbs, page] = docs["@graph"]
  assert.deepEqual(
    crumbs.itemListElement.map((crumb) => [crumb.name, crumb.item]),
    [
      ["MacWall", ORIGIN],
      ["Compare", `${ORIGIN}/compare`],
      ["Plash vs MacWall", `${ORIGIN}/alternatives/plash`],
    ]
  )
  assert.equal(page.about["@id"], `${ORIGIN}/#softwareapplication`)
  assert.equal(page.breadcrumb["@id"], crumbs["@id"])

  const legal = webPageWithBreadcrumbsJsonLd({
    origin: ORIGIN,
    pathname: "/legal/terms",
    pageTitle: "Terms of Service",
    headline: "Terms",
    description: "Terms.",
    legalHub: true,
  })
  assert.deepEqual(
    legal["@graph"][0].itemListElement.map((crumb) => crumb.name),
    ["MacWall", "Legal", "Terms of Service"]
  )

  const changelog = webPageWithBreadcrumbsJsonLd({
    origin: ORIGIN,
    pathname: "/changelog",
    pageTitle: "Changelog: MacWall Updates & Release History",
    headline: "MacWall changelog and release notes",
    description: "Releases.",
    breadcrumbName: "Changelog",
    dateModifiedIso: "2026-10-24",
  })
  assert.equal(changelog["@graph"][0].itemListElement.at(-1).name, "Changelog")
  assert.equal(changelog["@graph"][1].dateModified, "2026-10-24")

  const hub = collectionPageJsonLd({
    pathname: "/wallpapers/collections",
    name: "Wallpaper collections",
    description: "All collections.",
    breadcrumbLabel: "Collections",
    parents: [{ name: "Wallpapers", pathname: "/wallpapers" }],
    items: [{ name: "Rain", pathname: "/wallpapers/collections/rain" }],
  })
  assert.deepEqual(
    hub["@graph"][0].itemListElement.map((crumb) => crumb.name),
    ["MacWall", "Wallpapers", "Collections"]
  )
})

test("home WebPage and video: about the app, key moments as Clips", () => {
  const page = webPageJsonLd({
    origin: ORIGIN,
    pathname: "/",
    name: "Live Wallpaper App for Mac",
    description: "MacWall.",
    about: "#softwareapplication",
    mainEntity: "#softwareapplication",
    primaryImageOfPage: "/hero/hero-video-poster.jpg",
    video: `${ORIGIN}/#video`,
  })
  const [node] = page["@graph"]
  assert.equal(node["@id"], `${ORIGIN}/#webpage`)
  assert.equal(node.mainEntity["@id"], `${ORIGIN}/#softwareapplication`)
  assert.equal(
    node.primaryImageOfPage.url,
    `${ORIGIN}/hero/hero-video-poster.jpg`
  )
  assert.equal(node.breadcrumb, undefined)

  const video = videoObjectJsonLd({
    origin: ORIGIN,
    pathname: "/",
    name: "MacWall demo",
    description: "A live wallpaper on a MacBook.",
    thumbnailUrl: "/hero/hero-video-poster.jpg",
    uploadDate: "2026-10-24",
    contentUrl: "https://cdn.macwall.app/assets/hero/hero-video.mp4",
    duration: 95,
    clips: [
      { name: "Lock Screen", startOffset: 40, endOffset: 60, url: "/?t=40" },
      { name: "Set a wallpaper", startOffset: 0, endOffset: 20, url: "/?t=0" },
      { name: "Broken", startOffset: 30, endOffset: 10, url: "/?t=30" },
    ],
  })
  assert.equal(video["@id"], `${ORIGIN}/#video`)
  assert.equal(video.duration, "PT1M35S")
  assert.deepEqual(
    video.hasPart.map((clip) => [clip["@type"], clip.name, clip.startOffset]),
    [
      ["Clip", "Set a wallpaper", 0],
      ["Clip", "Lock Screen", 40],
    ]
  )
  assert.deepEqual(video.publisher, { "@id": ORG_ID })
  assert.deepEqual(organizations(video), [])

  const merged = jsonLdGraph(page, video)
  assert.equal(merged["@graph"].length, 2)
  assert.ok(merged["@graph"].every((node) => !("@context" in node)))
})

test("titles name MacWall once", () => {
  assert.equal(brandedTitle("Pricing"), "Pricing | MacWall")
  assert.equal(
    brandedTitle("MacWall vs Backdrop for Mac: Price and Features"),
    "MacWall vs Backdrop for Mac: Price and Features"
  )
  assert.equal(brandedTitle("Uninstall MacWall"), "Uninstall MacWall")
  assert.equal(
    brandedTitle("Download from macwall.app"),
    "Download from macwall.app | MacWall"
  )
})

test("page metadata: og:locale, twitter image alt, no keywords meta", () => {
  const seo = createSeoPageMetadata({
    slug: "x",
    pathname: "/docs/x",
    title: "Install",
    headline: "Install MacWall",
    description: "How to install MacWall.",
    keywords: ["install macwall"],
    sections: [],
  })
  assert.equal(seo.keywords, undefined)
  assert.equal(seo.openGraph.locale, "en_US")
  assert.ok(
    seo.twitter.images.every(
      (image) => typeof image.alt === "string" && image.alt
    )
  )

  const simple = createSimplePageMetadata({
    title: "Contact",
    description: "Contact MacWall support.",
    path: "/contact",
  })
  assert.equal(simple.openGraph.locale, "en_US")
  assert.ok(
    simple.twitter.images.every(
      (image) => typeof image.alt === "string" && image.alt
    )
  )
})
