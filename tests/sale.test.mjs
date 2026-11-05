import assert from "node:assert/strict"
import test from "node:test"

const { applySaleCents, isSaleLive, SITE_SALE } = await import(
  "../lib/sale.shared.ts"
)

test("sale prices match Stripe's percent-off rounding", () => {
  // Stripe rounds the discount to the nearest cent.
  assert.equal(applySaleCents(1299, 30), 909)
  assert.equal(applySaleCents(1999, 30), 1399)
  assert.equal(applySaleCents(3499, 30), 2449)
  assert.equal(applySaleCents(499, 30), 349)
  assert.equal(applySaleCents(799, 30), 559)
  assert.equal(applySaleCents(1299, 0), 1299)
})

test("sale window is start-inclusive, end-exclusive", () => {
  const sale = { startsAt: "2026-11-05T00:00:00Z", endsAt: "2026-12-02T08:00:00Z" }
  assert.equal(isSaleLive(sale, Date.parse("2026-11-04T23:59:59Z")), false)
  assert.equal(isSaleLive(sale, Date.parse("2026-11-05T00:00:00Z")), true)
  assert.equal(isSaleLive(sale, Date.parse("2026-12-02T07:59:59Z")), true)
  assert.equal(isSaleLive(sale, Date.parse("2026-12-02T08:00:00Z")), false)
  assert.equal(isSaleLive(null), false)
})

test("configured sale ends when the Stripe BLACKFRIDAY code expires", () => {
  // promo_1UYLj5IZgqo0QIlXBPO96ZMC expires_at 1796198400
  if (SITE_SALE) assert.equal(Date.parse(SITE_SALE.endsAt) / 1000, 1796198400)
})
