import test from 'node:test'
import assert from 'node:assert/strict'
import { loadFunctions } from './source-harness.mjs'

// Built at runtime: a key-shaped literal would trip the repo's Gitleaks scan.
const FAKE_SB_SECRET = ['sb', 'secret', 'test'].join('_') + '_' + 'x'.repeat(24)
const env = {SUPABASE_SECRET_KEYS: JSON.stringify({default: FAKE_SB_SECRET}), MACWALL_BROADCAST_SECRET: 'b'.repeat(32)}
let authProbe = {calls: 0, status: 401}
const globals = {
  Deno: {env: {get: name => env[name]}},
  fetch: async () => { authProbe.calls += 1; return new Response(null, {status: authProbe.status}) },
  legacyVerdicts: new Map(),
}
const {isServiceRole, isBroadcastAuthorized} = loadFunctions('supabase/functions/macwall-apns/index.ts',
  ['base64url','bearerToken','broadcastSecretExpected','safeEqual','runtimeServerKeys','looksLikeLegacyServiceRole','authVerifiesServiceRole','isServiceRole','isBroadcastAuthorized'], globals)
const URL_ = 'https://ref.supabase.co'
const request = headers => new Request('https://example.test', {headers})
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const forged = `${b64({alg:'HS256',typ:'JWT'})}.${b64({iss:'supabase',role:'service_role'})}.invalid-signature`

test('forged role claims are rejected (Auth says no) through both headers', async () => {
  authProbe = {calls: 0, status: 401}; globals.legacyVerdicts.clear()
  for (const headers of [{Authorization:`Bearer ${forged}`},{apikey:forged}, {}, {apikey:'wrong'}]) {
    assert.equal(await isServiceRole(request(headers),'real-service-secret',URL_),false)
    assert.equal(await isBroadcastAuthorized(request(headers),{},'real-service-secret',URL_),false)
  }
  assert.equal(await isServiceRole(request({}),'',URL_),false)
})
test('injected legacy key and sb_secret_ keys pass without a probe', async () => {
  authProbe = {calls: 0, status: 500}
  for (const headers of [{Authorization:'Bearer real-service-secret'}, {apikey:'real-service-secret'}, {apikey:FAKE_SB_SECRET}])
    assert.equal(await isServiceRole(request(headers),'real-service-secret',URL_),true)
  assert.equal(authProbe.calls, 0)
})
test('a legacy service_role JWT passes only when Supabase Auth verifies it', async () => {
  globals.legacyVerdicts.clear(); authProbe = {calls: 0, status: 200}
  assert.equal(await isServiceRole(request({apikey: forged}),'real-service-secret',URL_),true)
  assert.equal(await isServiceRole(request({apikey: forged}),'real-service-secret',URL_),true)
  assert.equal(authProbe.calls, 1) // cached
})
test('broadcast secret still works', async () => {
  authProbe = {calls: 0, status: 401}
  assert.equal(await isBroadcastAuthorized(request({}),{broadcastSecret:'b'.repeat(32)},'real-service-secret',URL_),true)
  assert.equal(await isBroadcastAuthorized(request({}),{broadcastSecret:'wrong'},'real-service-secret',URL_),false)
})
