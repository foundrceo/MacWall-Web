import test from 'node:test'
import assert from 'node:assert/strict'
import { loadFunctions } from './source-harness.mjs'

const { purchaseDistinctId, buildPostHogPurchaseEvent } = loadFunctions(
  'supabase/functions/_shared/posthog.ts',
  ['purchaseDistinctId', 'buildPostHogPurchaseEvent']
)
const install = '0F8B1C3E-7A2D-4C55-9E61-2B7D4A9C0E11'
const paidAt = new Date('2026-10-20T10:00:00Z')

test('a purchase from the app lands on the install id, not the email', () => {
  assert.deepEqual(purchaseDistinctId({ visitorId: install, email: 'Buyer@Example.test' }), { distinctId: install, identity: 'app_install' })
})
test('no or odd visitor id falls back to the lowercased email', () => {
  for (const visitorId of [null, undefined, '', 'short', 'x'.repeat(129), `${'a'.repeat(31)}@b.test`])
    assert.deepEqual(purchaseDistinctId({ visitorId, email: ' Buyer@Example.test ' }), { distinctId: 'buyer@example.test', identity: 'email' })
})
test('the event carries revenue, the buyer country and no server GeoIP', () => {
  const body = buildPostHogPurchaseEvent({ email: 'buyer@example.test', visitorId: install, uuid: 'u', occurredAt: paidAt, provider: 'stripe', amount: 4.99, currency: 'usd', plan: 'permanent', country: 'in' })
  assert.equal(body.distinct_id, install)
  assert.equal(body.event, 'purchase_completed')
  assert.equal(body.timestamp, paidAt.toISOString())
  assert.equal(body.properties.revenue, 4.99)
  assert.equal(body.properties.currency, 'USD')
  assert.equal(body.properties.country, 'IN')
  assert.equal(body.properties.$geoip_disable, true)
  assert.equal(body.properties.identity, 'app_install')
  assert.deepEqual(body.properties.$set, { email: 'buyer@example.test', plan: 'pro', purchase_country: 'IN' })
})
test('a webhook retry builds the identical event (same uuid and timestamp)', () => {
  const a = buildPostHogPurchaseEvent({ email: 'b@example.test', uuid: 'same', occurredAt: paidAt, provider: 'stripe' })
  const b = buildPostHogPurchaseEvent({ email: 'b@example.test', uuid: 'same', occurredAt: new Date(paidAt), provider: 'stripe' })
  assert.deepEqual(a, b)
  assert.equal(a.properties.country, undefined)
  assert.equal(a.properties.revenue, undefined)
})
test('an unknown country is left out', () => {
  for (const country of ['XX', '', null, 'USA'])
    assert.equal(buildPostHogPurchaseEvent({ email: 'b@example.test', uuid: 'u', occurredAt: paidAt, provider: 'stripe', country }).properties.country, undefined)
})
