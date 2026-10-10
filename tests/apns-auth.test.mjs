import test from 'node:test'
import assert from 'node:assert/strict'
import { loadFunctions } from './source-harness.mjs'
const {isServiceRole, isBroadcastAuthorized} = loadFunctions('supabase/functions/macwall-apns/index.ts', ['bearerToken','broadcastSecretExpected','isServiceRole','isBroadcastAuthorized'], {Deno: {env: {get: () => 'b'.repeat(32)}}})
const request = headers => new Request('https://example.test', {headers})
const fake = `e30.${Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')}.invalid-signature`
test('privileged APNs rejects forged role claims through both headers', () => {
 for (const headers of [{Authorization:`Bearer ${fake}`},{apikey:fake}, {}, {apikey:'wrong'}]) {
  assert.equal(isServiceRole(request(headers),'real-service-secret'),false)
  assert.equal(isBroadcastAuthorized(request(headers),{},'real-service-secret'),false)
 }
 assert.equal(isServiceRole(request({}),''),false)
})
test('exact server credentials and broadcast secret remain valid', () => {
 for (const headers of [{Authorization:'Bearer real-service-secret'}, {apikey:'real-service-secret'}]) assert.equal(isServiceRole(request(headers),'real-service-secret'),true)
 assert.equal(isBroadcastAuthorized(request({}),{broadcastSecret:'b'.repeat(32)},'real-service-secret'),true)
 assert.equal(isBroadcastAuthorized(request({}),{broadcastSecret:'wrong'},'real-service-secret'),false)
})
