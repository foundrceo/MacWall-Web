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
 const globals={cancelCheckoutRecovery:noop,cancelTrialEndedEmails:noop,parseDeviceCount:()=>3,purchasedDeviceCount:async()=>3,inferDeviceCountFromAmounts:()=>3,sendTikTokPurchase:noop,sendXPurchase:noop,sendPostHogPurchase:noop,Deno:{env:{get:()=>undefined}},deliverLicenseEmail:async()=>{calls.push(['email']);return options.emailFailure?{ok:false,status:429,error:'retry',retryable:true}:{ok:true}}}
 const {handleCheckoutCompleted}=loadFunctions('supabase/functions/stripe-license-email/index.ts',['handleCheckoutCompleted'],globals)
 const args={event:{id:'evt_test'},stripe:{subscriptions:{retrieve:async()=>({status:options.subscriptionInactive?'canceled':'active'})},invoices:{retrieve:async()=>({status:'paid',payment_intent:'pi_invoice'})},paymentIntents:{retrieve:async()=>({status:'succeeded',latest_charge:{refunded:!!options.refunded,amount_refunded:options.refunded?100:0,amount:100}})}},session:{id:'cs_test',mode:options.annual?'subscription':'payment',invoice:options.annual?'in_invoice':null,subscription:options.annual?'sub_test':null,payment_status:options.unpaid?'unpaid':'paid',metadata:{license_key:'synthetic'},customer_email:'test@example.test',payment_intent:options.annual?null:'pi_test'},supabase,resendKey:'synthetic',from:'test@example.test'}
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
