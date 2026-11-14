import test from 'node:test'
import assert from 'node:assert/strict'
import { loadFunctions } from './source-harness.mjs'
function fixture(options={}) {
 const calls=[]
 const query = table => {
  let operation='select'
  const q={select(){return q},eq(){return q},in(){return q},limit(){return q},update(value){operation='update';calls.push([table,operation,value]);return q},upsert(value){operation='upsert';calls.push([table,operation,value]);return q},then(resolve,reject){return Promise.resolve({data:options.delivered?[{id:1}]:[],error:table==='macwall_stripe_license_emails' && operation==='select' && options.lookupFailure?{message:'offline'}:null}).then(resolve,reject)}}
  return q
 }
 const supabase={from:query,rpc:async()=>{calls.push(['activation']);return {data:options.ineligible?'ineligible':'active',error:options.activationFailure?{message:'offline'}:null}}}
 const noop=async()=>{}
 const reel=options.reel??[]
 const globals={scheduleReelRefundEmail:async a=>{reel.push(a)},cancelCheckoutRecovery:noop,cancelTrialEndedEmails:noop,parseDeviceCount:()=>3,purchasedDeviceCount:async()=>3,inferDeviceCountFromAmounts:()=>3,sendTikTokPurchase:noop,sendXPurchase:noop,sendPostHogPurchase:async a=>{options.posthog?.push(a)},Deno:{env:{get:()=>undefined}},deliverLicenseEmail:async()=>{calls.push(['email']);return options.emailFailure?{ok:false,status:429,error:'retry',retryable:true}:{ok:true}}}
 const {handleCheckoutCompleted}=loadFunctions('supabase/functions/stripe-license-email/index.ts',['handleCheckoutCompleted'],globals)
 const args={event:{id:'evt_test',created:1761200000},stripe:{subscriptions:{retrieve:async()=>({status:options.subscriptionInactive?'canceled':'active'})},invoices:{retrieve:async()=>({status:'paid',payment_intent:'pi_invoice'})},paymentIntents:{retrieve:async()=>({status:'succeeded',latest_charge:{refunded:!!options.refunded,amount_refunded:options.refunded?100:0,amount:100}})}},session:{id:'cs_test',mode:options.annual?'subscription':'payment',invoice:options.annual?'in_invoice':null,subscription:options.annual?'sub_test':null,payment_status:options.unpaid?'unpaid':'paid',metadata:{license_key:'synthetic',...(options.metadata??{})},customer_email:'test@example.test',payment_intent:options.annual?null:'pi_test'},supabase,resendKey:'synthetic',from:'test@example.test'}
 return {run:()=>handleCheckoutCompleted(args),calls}
}
test('activation failures are retryable and never send or ledger an email',async()=>{
 const f=fixture({activationFailure:true});assert.equal((await f.run()).status,500);assert.deepEqual(f.calls,[['activation']])
})
test('revoked/expired licenses never reactivate or receive fulfillment',async()=>{
 const f=fixture({ineligible:true});assert.equal((await f.run()).status,200);assert.deepEqual(f.calls,[['activation']])
})
test('authoritative refund before completion revokes and never fulfills',async()=>{
 const f=fixture({refunded:true});assert.equal((await f.run()).status,200);assert.equal(f.calls[0][2].status,'revoked');assert.equal(f.calls.length,1)
})
test('unpaid checkout never activates',async()=>{const f=fixture({unpaid:true});assert.equal((await f.run()).status,200);assert.equal(f.calls.length,0)})
test('successful activation records pending then acknowledges delivery as sent',async()=>{
 const f=fixture();assert.equal((await f.run()).status,200);assert.deepEqual(f.calls.map(c=>c[1]??c[0]),['activation','upsert','email','update']);assert.equal(f.calls[1][2].sent_at,null);assert.equal(f.calls[3][2].delivery_status,'sent')
})
test('provider failure records failed and returns retryable status',async()=>{
 const f=fixture({emailFailure:true});assert.equal((await f.run()).status,503);assert.equal(f.calls.at(-1)[2].delivery_status,'failed');assert.equal(f.calls.at(-1)[2].sent_at,null)
})
test('delivered email is not sent again and lookup failures do not guess',async()=>{
 for(const options of [{delivered:true},{lookupFailure:true}]){const f=fixture(options);assert.equal((await f.run()).status,options.delivered?200:500);assert.equal(f.calls.length,1)}
})

test('legacy annual checkout reconciles its invoice refund before activating',async()=>{const f=fixture({annual:true,refunded:true});assert.equal((await f.run()).status,200);assert.equal(f.calls[0][2].status,'revoked');assert.equal(f.calls.length,1)})
test('canceled annual subscription cannot be activated by an old checkout',async()=>{const f=fixture({annual:true,subscriptionInactive:true});assert.equal((await f.run()).status,200);assert.equal(f.calls.length,0)})
test('paid active annual checkout still fulfills',async()=>{const f=fixture({annual:true});assert.equal((await f.run()).status,200);assert.equal(f.calls[0][0],'activation')})
test('the purchase goes to PostHog on the app install that opened checkout',async()=>{
 const posthog=[];const f=fixture({posthog,metadata:{visitor_id:'A'.repeat(36),visitor_country:'IN'}});assert.equal((await f.run()).status,200)
 assert.equal(posthog.length,1);assert.equal(posthog[0].visitorId,'A'.repeat(36));assert.equal(posthog[0].eventIdSeed,'stripe_checkout_cs_test')
 assert.equal(posthog[0].occurredAt.toISOString(),new Date(1761200000*1000).toISOString());assert.equal(posthog[0].country,'IN')
})

test('a delivered license schedules the Reel refund email once, and a failed one does not',async()=>{
 const sent=[];assert.equal((await fixture({reel:sent}).run()).status,200);assert.equal(sent.length,1);assert.equal(sent[0].to,'test@example.test')
 const failed=[];assert.equal((await fixture({reel:failed,emailFailure:true}).run()).status,503);assert.equal(failed.length,0)
})

function refundFixture({chargeMeta={},paymentMeta={},refundMeta={},stripeDown=false}={}){
 const calls=[]
 const globals={REEL_REFUND_METADATA_KEY:'reel_refund',console:{error(){}}}
 const {handleChargeRefunded}=loadFunctions('supabase/functions/stripe-license-email/index.ts',['metadataMarksReelRefund','isReelRefund','handleChargeRefunded'],globals)
 const fail=async()=>{throw new Error('offline')}
 const stripe={paymentIntents:{retrieve:stripeDown?fail:async()=>({metadata:paymentMeta})},refunds:{list:stripeDown?fail:async()=>({data:[{metadata:refundMeta}]})}}
 const supabase={rpc:async(name,params)=>{calls.push([name,params]);return {data:1,error:null}}}
 const event={data:{object:{id:'ch_test',payment_intent:'pi_test',refunded:true,amount:100,amount_refunded:100,metadata:chargeMeta}}}
 return {run:async()=>(await handleChargeRefunded({event,stripe,supabase})).json(),calls}
}
test('a real full refund revokes the license',async()=>{
 const f=refundFixture();assert.deepEqual(await f.run(),{ok:true,revoked:1});assert.equal(f.calls[0][0],'record_macwall_stripe_refund')
})
test('a refund marked reel_refund on the payment, charge or refund keeps the license',async()=>{
 for(const options of [{paymentMeta:{reel_refund:'true'}},{chargeMeta:{reel_refund:'yes'}},{refundMeta:{reel_refund:'1'}}]){
  const f=refundFixture(options);assert.deepEqual(await f.run(),{ok:true,skipped:'reel_refund'});assert.deepEqual(f.calls,[])
 }
})
test('reel_refund=false or an unreadable Stripe is treated as a real refund',async()=>{
 for(const options of [{paymentMeta:{reel_refund:'false'}},{stripeDown:true}]){
  const f=refundFixture(options);assert.deepEqual(await f.run(),{ok:true,revoked:1})
 }
})

import crypto from 'node:crypto'
function webhookFixture(){
 const rows=[]
 const names=['base64ToBytes','bytesToBase64','safeEqual','verifySignature','suppressionReason','eventRecipients','handleEvent']
 const fns=loadFunctions('supabase/functions/resend-webhook/index.ts',names,{SIGNATURE_TOLERANCE_SECONDS:300,encoder:new TextEncoder(),console:{error(){}}})
 const supabase={from:()=>({upsert:async(values,options)=>{rows.push([values,options]);return {error:null}}})}
 return {...fns,supabase,rows}
}
test('resend webhook accepts only a fresh, correctly signed request',async()=>{
 const {verifySignature}=webhookFixture()
 const key=crypto.randomBytes(24),secret='whsec_'+key.toString('base64'),body='{"type":"email.bounced"}',id='msg_1',timestamp='1794650000'
 const sig='v1,'+crypto.createHmac('sha256',key).update(`${id}.${timestamp}.${body}`).digest('base64')
 const check=o=>verifySignature({secret,id,timestamp,signatures:sig,body,nowSeconds:1794650010,...o})
 assert.equal(await check({}),true)
 assert.equal(await check({signatures:'v1,AAAA '+sig}),true)
 assert.equal(await check({body:body+' '}),false)
 assert.equal(await check({nowSeconds:1794650000+301}),false)
 assert.equal(await check({signatures:null}),false)
 assert.equal(await check({secret:'whsec_'+crypto.randomBytes(24).toString('base64')}),false)
})
test('resend webhook suppresses hard bounces and complaints, nothing else',async()=>{
 const f=webhookFixture()
 const run=async event=>(await f.handleEvent({event,supabase:f.supabase})).json()
 assert.deepEqual(await run({type:'email.bounced',data:{to:['A@Example.test'],bounce:{type:'Permanent'}}}),{ok:true,suppressed:1,reason:'bounced'})
 assert.deepEqual(f.rows[0],[[{email:'a@example.test',reason:'bounced'}],{onConflict:'email',ignoreDuplicates:true}])
 assert.deepEqual(await run({type:'email.complained',data:{to:['b@example.test']}}),{ok:true,suppressed:1,reason:'complained'})
 assert.equal(f.rows[1][1].ignoreDuplicates,false)
 assert.deepEqual(await run({type:'email.bounced',data:{to:['c@example.test'],bounce:{type:'Transient'}}}),{ok:true,skipped:'ignored_event'})
 assert.deepEqual(await run({type:'email.delivered',data:{to:['d@example.test']}}),{ok:true,skipped:'ignored_event'})
 assert.equal(f.rows.length,2)
})
