import test from 'node:test'
import assert from 'node:assert/strict'
import {loadFunctions} from './source-harness.mjs'
const {normalizeCatalogQuery}=loadFunctions('lib/public-catalog/query.ts',['normalizeCatalogQuery'],{InvalidCatalogQuery:Error,WALLPAPER_CATEGORIES:['Nature','Anime']})
const {sanitizeAnalyticsUrl,isPrivateAnalyticsPath,redactAnalyticsProperties}=loadFunctions('lib/analytics/privacy.ts',['sanitizeAnalyticsUrl','isPrivateAnalyticsPath','redactAnalyticsProperties'])
test('equivalent query inputs share one integer bounded key',()=>{
 assert.deepEqual(normalizeCatalogQuery({q:'  anime**  ',page:1.8,limit:999}),normalizeCatalogQuery({q:'anime',page:1,limit:60}))
 assert.equal(normalizeCatalogQuery({page:Infinity,limit:NaN}).page,1)
 assert.equal(normalizeCatalogQuery({category:' nature '}).category,'Nature')
 for(const options of [{q:'x'.repeat(101)},{tag:'x,y'},{category:'(name.eq.foo)'},{category:'unknown-random-category'}])assert.throws(()=>normalizeCatalogQuery(options))
})
test('analytics redacts synthetic credentials and private routes',()=>{
 const url='https://macwall.app/activate?license=SYNTHETIC&email=test%40example.test#device'
 assert.equal(sanitizeAnalyticsUrl(url),'https://macwall.app/activate')
 assert.equal(sanitizeAnalyticsUrl('macwall://activate?key=SYNTHETIC'),null)
 assert.deepEqual(redactAnalyticsProperties({$current_url:url,key:'SYNTHETIC',visitor_id:'DEVICE',page:'pricing'}),{$current_url:'https://macwall.app/activate',page:'pricing'})
 for(const path of ['/admin','/admin/feedback','/activate','/support/ticket'])assert.equal(isPrivateAnalyticsPath(path),true)
 assert.equal(isPrivateAnalyticsPath('/wallpapers'),false)
})
