import test from 'node:test'
import assert from 'node:assert/strict'
import { loadFunctions } from './source-harness.mjs'

function fixture(options = {}) {
  const calls = []
  const row = { id: 'row_1', status: options.refunded ? 'refunded' : 'paid', paid_at: '2026-10-16T00:00:00Z', confirmation_email_status: options.alreadySent ? 'sent' : 'pending' }
  const query = table => {
    let operation = 'select'
    const q = {
      select() { return q }, eq() { return q }, in() { return q }, lte() { return q },
      upsert(value) { operation = 'upsert'; calls.push([table, operation, value]); return q },
      update(value) { operation = 'update'; calls.push([table, operation, value]); return q },
      single() { return Promise.resolve({ data: options.upsertFailure ? null : row, error: options.upsertFailure ? { message: 'offline' } : null }) },
      then(resolve, reject) { return Promise.resolve({ data: [], count: 7, error: null }).then(resolve, reject) },
    }
    return q
  }
  const supabase = { from: query, rpc: async () => { calls.push(['activation']); return { data: 'active', error: null } } }
  const noop = async () => {}
  const fail = name => () => { throw new Error(`${name} must not run for Windows preorders`) }
  const globals = {
    WINDOWS_PREORDER_PRODUCT: 'windows_preorder',
    cancelCheckoutRecovery: fail('cancelCheckoutRecovery'),
    cancelTrialEndedEmails: fail('cancelTrialEndedEmails'),
    deliverLicenseEmail: fail('deliverLicenseEmail'),
    sendPostHogPurchase: noop,
    formatSessionAmount: () => '$12.99',
    windowsPreorderEmailSubject: () => 'subject',
    buildWindowsPreorderEmailHtml: args => { calls.push(['html', args]); return '<p/>' },
    buildWindowsPreorderEmailPlainText: () => 'text',
    sendResendEmail: async args => { calls.push(['email', args]); return options.emailFailure ? { ok: false, status: 429, error: 'retry', retryable: true } : { ok: true, id: 'em_1' } },
    Deno: { env: { get: () => undefined } },
  }
  const { handleCheckoutCompleted } = loadFunctions(
    'supabase/functions/stripe-license-email/index.ts',
    ['handleCheckoutCompleted', 'isWindowsPreorder', 'handleWindowsPreorderCompleted'],
    globals
  )
  const args = {
    event: { id: 'evt_test' },
    stripe: { paymentIntents: { retrieve: async () => ({ status: 'succeeded', latest_charge: { refunded: !!options.refunded, amount_refunded: options.refunded ? 100 : 0, amount: 100 } }) } },
    session: { id: 'cs_win', mode: 'payment', payment_status: 'paid', amount_total: 1299, currency: 'usd', metadata: { product: 'windows_preorder', pricing_region: 'default', visitor_country: 'US' }, customer_details: { email: 'Buyer@Example.test' }, payment_intent: 'pi_win' },
    supabase, resendKey: 'synthetic', from: 'test@example.test',
  }
  return { run: () => handleCheckoutCompleted(args), calls }
}

test('windows preorder records the waitlist row and emails confirmation, no license', async () => {
  const f = fixture()
  const res = await f.run()
  assert.equal(res.status, 200)
  assert.ok(!f.calls.some(c => c[0] === 'activation'))
  assert.equal(f.calls[0][0], 'macwall_windows_waitlist')
  assert.equal(f.calls[0][2].email, 'buyer@example.test')
  assert.equal(f.calls[0][2].stripe_payment_intent_id, 'pi_win')
  assert.equal(f.calls.find(c => c[0] === 'html')[1].spot, 7)
  const email = f.calls.find(c => c[0] === 'email')[1]
  assert.equal(email.idempotencyKey, 'windows-preorder/cs_win')
  assert.equal(f.calls.at(-1)[2].confirmation_email_status, 'sent')
})

test('refunded windows preorder is recorded refunded and never emailed', async () => {
  const f = fixture({ refunded: true })
  assert.equal((await f.run()).status, 200)
  assert.equal(f.calls[0][2].status, 'refunded')
  assert.ok(!f.calls.some(c => c[0] === 'email'))
})

test('windows confirmation is not sent twice', async () => {
  const f = fixture({ alreadySent: true })
  assert.equal((await f.run()).status, 200)
  assert.ok(!f.calls.some(c => c[0] === 'email'))
})

test('windows email failure is recorded and retryable', async () => {
  const f = fixture({ emailFailure: true })
  assert.equal((await f.run()).status, 503)
  assert.equal(f.calls.at(-1)[2].confirmation_email_status, 'failed')
})

test('windows record failure is retryable and sends nothing', async () => {
  const f = fixture({ upsertFailure: true })
  assert.equal((await f.run()).status, 500)
  assert.ok(!f.calls.some(c => c[0] === 'email'))
})
