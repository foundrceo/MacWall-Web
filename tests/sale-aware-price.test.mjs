import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const {
  SALE_BOUNDARY_LOOKBACK_MS,
  currentPromotionLine,
  offersFor,
  priceWithSaleText,
  proPriceFor,
  saleBoundariesBetween,
  saleLastDay,
  schemaOfferPricing,
} = await import("../lib/pricing/sale-aware-price.ts")
const { SITE_SALES } = await import("../lib/sale.shared.ts")
const { CRON_ROUTES } = await import("../worker/crons.ts")

const at = (iso) => Date.parse(iso)
const MINUTE = 60 * 1000
/** What a sale-boundary run at `now` acts on. */
const crossedAt = (now) =>
  saleBoundariesBetween(now - SALE_BOUNDARY_LOOKBACK_MS, now).map(
    (boundary) => `${boundary.saleId}:${boundary.kind}`
  )
const cents = (prices) =>
  prices.map((price) => [price.slug, price.regularCents, price.saleCents])

test("2026-11-10T18:30Z: Diwali ends and India is back at full price", () => {
  const boundary = at("2026-11-10T18:30:00Z")
  assert.deepEqual(crossedAt(boundary + MINUTE), ["diwali-2026:end"])

  const before = proPriceFor("india", boundary - 1)
  assert.equal(before.code, "DIWALI")
  assert.equal(before.saleCents, 349)

  const india = proPriceFor("india", boundary)
  assert.equal(india.saleCents, null)
  assert.equal(india.currentCents, 499)
  assert.equal(india.code, null)
  assert.equal(india.endsAt, null)
  assert.equal(priceWithSaleText(india), "$4.99")
  assert.equal(currentPromotionLine("india", boundary), null)
  assert.deepEqual(schemaOfferPricing(india), {
    price: "4.99",
    priceCurrency: "USD",
  })

  // Full price in India for the whole gap before its Black Friday.
  for (const iso of ["2026-11-15T00:00:00Z", "2026-11-26T18:29:59Z"]) {
    assert.deepEqual(cents(offersFor("india", at(iso))), [
      ["permanent", 499, null],
      ["permanent_5", 799, null],
      ["permanent_10", 1299, null],
    ])
  }

  // Everyone else stays on Black Friday prices.
  assert.equal(proPriceFor("default", boundary).currentCents, 909)
})

test("2026-11-26T18:30Z: India's Black Friday starts", () => {
  const boundary = at("2026-11-26T18:30:00Z")
  assert.deepEqual(crossedAt(boundary + MINUTE), [
    "black-friday-2026-india:start",
  ])

  const india = offersFor("india", boundary)
  assert.deepEqual(cents(india), [
    ["permanent", 499, 349],
    ["permanent_5", 799, 559],
    ["permanent_10", 1299, 909],
  ])
  assert.equal(india[0].code, "BLACKFRIDAY")
  assert.equal(india[0].endsAt, "2026-12-02T08:00:00Z")

  const global = offersFor("default", boundary)
  assert.deepEqual(cents(global), [
    ["permanent", 1299, 909],
    ["permanent_5", 1999, 1399],
    ["permanent_10", 3499, 2449],
  ])
  assert.equal(
    priceWithSaleText(global[0]),
    "$9.09 (Black Friday price, 30% off until Dec 1, 2026; regular $12.99)"
  )
  assert.equal(
    currentPromotionLine("default", boundary),
    "Black Friday: 30% off Pro and Pro+ until Dec 1, 2026 (code BLACKFRIDAY, applied automatically at checkout). Pro (3 Macs) $9.09 instead of $12.99; Pro+ (5 Macs) $13.99 instead of $19.99; Pro+ (10 Macs) $24.49 instead of $34.99."
  )
  assert.deepEqual(schemaOfferPricing(global[0]), {
    price: "9.09",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-01",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/StrikethroughPrice",
      price: "12.99",
      priceCurrency: "USD",
    },
  })
})

test("2026-12-02T08:00Z: Black Friday ends everywhere", () => {
  const boundary = at("2026-12-02T08:00:00Z")
  assert.deepEqual(crossedAt(boundary + MINUTE), [
    "black-friday-2026:end",
    "black-friday-2026-india:end",
  ])

  assert.equal(proPriceFor("default", boundary - 1).currentCents, 909)
  for (const region of ["default", "india"]) {
    for (const price of offersFor(region, boundary)) {
      assert.equal(price.saleCents, null, `${region} ${price.slug}`)
      assert.equal(price.currentCents, price.regularCents)
    }
    assert.equal(currentPromotionLine(region, boundary), null)
  }
  assert.deepEqual(schemaOfferPricing(proPriceFor("default", boundary)), {
    price: "12.99",
    priceCurrency: "USD",
  })
})

test("a run acts on each boundary once", () => {
  const boundary = at("2026-12-02T08:00:00Z")
  // The run at the boundary instant already sees new prices, so it acts.
  assert.equal(crossedAt(boundary).length, 2)
  assert.equal(crossedAt(boundary - 1).length, 0)
  // The run a full lookback later has already moved past it.
  assert.equal(crossedAt(boundary + SALE_BOUNDARY_LOOKBACK_MS).length, 0)
  assert.deepEqual(crossedAt(at("2026-11-18T12:01:00Z")), [])
})

test("the sale-boundary cron fires inside the lookback after every boundary", () => {
  const [schedule] = Object.entries(CRON_ROUTES).find(
    ([, path]) => path === "/api/cron/sale-boundary"
  ) ?? [null]
  assert.ok(schedule, "worker/crons.ts schedules /api/cron/sale-boundary")
  const [minutes, ...rest] = schedule.split(" ")
  assert.deepEqual(rest, ["*", "*", "*", "*"])
  const ticks = minutes.split(",").map(Number)
  for (const sale of SITE_SALES) {
    for (const iso of [sale.startsAt, sale.endsAt]) {
      const boundary = at(iso)
      // First tick at or after the boundary (ticks run on whole minutes).
      let tick = Math.ceil(boundary / MINUTE) * MINUTE
      while (!ticks.includes(new Date(tick).getUTCMinutes())) tick += MINUTE
      assert.ok(
        tick - boundary < SALE_BOUNDARY_LOOKBACK_MS,
        `${sale.id} ${iso}: first run at ${new Date(tick).toISOString()}`
      )
    }
  }
})

test("priceValidUntil matches the date the banner shows", () => {
  for (const sale of SITE_SALES) {
    const day = new Date(`${saleLastDay(sale.endsAt)}T12:00:00Z`)
    const label = day.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    assert.equal(label, sale.endsLabel, sale.id)
  }
})

test("wrangler.jsonc schedules exactly the crons worker/crons.ts dispatches", () => {
  const config = fs.readFileSync(
    new URL("../wrangler.jsonc", import.meta.url),
    "utf8"
  )
  const crons = JSON.parse(config.match(/"crons":\s*(\[[^\]]*\])/)[1])
  assert.deepEqual([...crons].sort(), Object.keys(CRON_ROUTES).sort())
})
