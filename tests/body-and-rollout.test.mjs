import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import {createHash} from 'node:crypto'
import {loadFunctions} from './source-harness.mjs'
const source=fs.readFileSync('lib/http/bounded-json.ts','utf8')
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
const {readBoundedJson,RequestBodyError}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
test('request reader bounds real streamed bytes without Content-Length',async()=>{
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(100));c.close()}})
 const request=new Request('https://example.test',{method:'POST',body:stream,duplex:'half'})
 await assert.rejects(readBoundedJson(request,30),error=>error instanceof RequestBodyError && error.status===413)
})
test('request reader accepts JSON objects and rejects malformed or non-object bodies',async()=>{
 const request=body=>new Request('https://example.test',{method:'POST',body})
 assert.deepEqual(await readBoundedJson(request('{"name":"valid"}'),100),{name:'valid'})
 for(const body of ['null','[]','{'])await assert.rejects(readBoundedJson(request(body),100),{status:400})
})
const {sanitizeDeviceToken,rolloutBucket,parseRolloutState}=loadFunctions('lib/macwall-rollout.ts',['sanitizeDeviceToken','rolloutBucket','parseRolloutState'],{createHash})
const {resolveServedMetadata}=loadFunctions('app/api/installers/releases/version.json/route.ts',['resolveServedMetadata'],{sanitizeDeviceToken,rolloutBucket})
test('shared release documents keep staged buckets and legacy devices correct',()=>{
 const docs={latest:{version:'2.0'},stable:{version:'1.0'},rollout:{version:'2.0',percent:0}}
 const request=did=>({nextUrl:new URL(`https://example.test?did=${did}`)})
 assert.equal(resolveServedMetadata(docs,request('a'.repeat(12))).version,'1.0')
 assert.equal(resolveServedMetadata(docs,request('invalid')).version,'2.0')
 assert.equal(resolveServedMetadata({...docs,rollout:{version:'2.0',percent:100}},request('a'.repeat(12))).version,'2.0')
 assert.equal(resolveServedMetadata({...docs,rollout:{version:'different',percent:0}},request('a'.repeat(12))).version,'2.0')
 assert.equal(parseRolloutState('{"version":"2.0","percent":200}').percent,100)
})
