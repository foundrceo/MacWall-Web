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

test("every region: Black Friday until the BLACKFRIDAY code expires", () => {
  for (const region of ["default", "india"]) {
    assert.equal(activeSiteSale(region, at("2026-11-04T23:59:59Z")), null, region)
    assert.equal(activeSiteSale(region, at("2026-11-06T00:00:00Z"))?.code, "BLACKFRIDAY", region)
    assert.equal(activeSiteSale(region, at("2026-11-12T00:00:00Z"))?.code, "BLACKFRIDAY", region)
    assert.equal(activeSiteSale(region, at("2026-11-20T00:00:00Z"))?.code, "BLACKFRIDAY", region)
    // Ends with the BLACKFRIDAY Stripe code (expires_at 1796198400).
    assert.equal(activeSiteSale(region, 1796198400 * 1000 - 1)?.code, "BLACKFRIDAY", region)
    assert.equal(activeSiteSale(region, 1796198400 * 1000), null, region)
  }
})
