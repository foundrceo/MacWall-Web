import test from 'node:test'
import assert from 'node:assert/strict'
import {createHmac} from 'node:crypto'
import fs from 'node:fs'
import ts from 'typescript'
import {loadFunctions} from './source-harness.mjs'

const js=ts.transpileModule(fs.readFileSync('lib/http/bounded-json.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
const {readBoundedJson,RequestBodyError}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

function handler({ipAllowed=true,emailAllowed=true,unavailable=false,sent=true,reason='undeliverable'}={}) {
  const calls=[]
  const {POST}=loadFunctions('app/api/send-to-mac/route.ts',['POST'],{
    NextResponse:{json:Response.json},
    readBoundedJson,RequestBodyError,
    EMAIL:/^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i,
    checkIpLimit:()=>({limited:false}),clientIpFromRequest:()=> '192.0.2.1',
    getCatalogSupabaseOrigin:()=> 'https://example.test',
    process:{env:{CRON_SECRET:'offline-only'}},
    consumePublicQuota:async()=>{if(unavailable)throw Error('offline');return ipAllowed},
    consumePublicSubjectQuota:async(subject,operation,limit,window)=>{calls.push({subject,operation,limit,window});return emailAllowed},
    fetch:async(_url,options)=>{calls.push({send:true,deadline:Boolean(options.signal)});return Response.json({sent,reason})},
    after:()=>undefined,trackSiteEvent:()=>undefined,
  })
  return {POST,calls}
}
const request=body=>new Request('https://example.test/api/send-to-mac',{method:'POST',body:JSON.stringify(body)})

test('email quota denial and quota outages fail closed before sending mail',async()=>{
  for(const [options,status] of [[{ipAllowed:false},429],[{emailAllowed:false},429],[{unavailable:true},503]]){
    const {POST,calls}=handler(options)
    assert.equal((await POST(request({email:'test@example.test'}))).status,status)
    assert.equal(calls.some(call=>call.send),false)
  }
})

test('email requests bound bytes, canonicalize recipients and reflect delivery failures',async()=>{
  const {POST,calls}=handler()
  assert.equal((await POST(request({email:'test@example.test',extra:'x'.repeat(5000)}))).status,413)
  const response=await POST(request({email:' TEST@example.test '}))
  assert.equal(response.status,200)
  assert.deepEqual(calls[0],{subject:'email:test@example.test',operation:'send_to_mac_email',limit:3,window:86400})
  assert.equal(calls[1].deadline,true)
  for(const reason of ['undeliverable','internal-provider-detail']){
    const {POST}=handler({sent:false,reason})
    const failed=await POST(request({email:'test@example.test'}))
    assert.equal(failed.status,422)
    assert.equal((await failed.json()).error,reason==='undeliverable'?'undeliverable':'send_failed')
  }
})

test('shared quota sends only an HMAC to the database',async()=>{
  let parameters
  const {consumePublicSubjectQuota}=loadFunctions('lib/http/public-quota.ts',['consumePublicSubjectQuota'],{
    process:{env:{SUPABASE_SERVICE_ROLE_KEY:'offline-only'}},createHmac,
    getSupabaseAdmin:()=>({rpc:async(_name,args)=>{parameters=args;return {data:true,error:null}}}),
  })
  assert.equal(await consumePublicSubjectQuota('email:test@example.test','send_to_mac_email',3,86400),true)
  assert.match(parameters.p_subject_hash,/^[0-9a-f]{64}$/)
  assert.equal(JSON.stringify(parameters).includes('test@example.test'),false)
})
