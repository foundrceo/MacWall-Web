import assert from "node:assert/strict"
import test from "node:test"

const { activeSiteSale, applySaleCents, isSaleLive } = await import(
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

const at = (iso) => Date.parse(iso)

test("India: Diwali to Nov 10 IST, full price, then Black Friday", () => {
  assert.equal(activeSiteSale("india", at("2026-11-06T00:00:00Z"))?.code, "DIWALI")
  // Ends with the DIWALI Stripe code (expires_at 1794335400).
  assert.equal(activeSiteSale("india", 1794335400 * 1000 - 1)?.code, "DIWALI")
  assert.equal(activeSiteSale("india", 1794335400 * 1000), null)
  assert.equal(activeSiteSale("india", at("2026-11-20T00:00:00Z")), null)
  assert.equal(activeSiteSale("india", at("2026-11-26T18:30:00Z"))?.code, "BLACKFRIDAY")
  assert.equal(activeSiteSale("india", 1796198400 * 1000), null)
})

test("everyone else: Black Friday until the BLACKFRIDAY code expires", () => {
  assert.equal(activeSiteSale("default", at("2026-11-06T00:00:00Z"))?.code, "BLACKFRIDAY")
  assert.equal(activeSiteSale("default", at("2026-11-20T00:00:00Z"))?.code, "BLACKFRIDAY")
  assert.equal(activeSiteSale("default", 1796198400 * 1000 - 1)?.code, "BLACKFRIDAY")
  assert.equal(activeSiteSale("default", 1796198400 * 1000), null)
})
