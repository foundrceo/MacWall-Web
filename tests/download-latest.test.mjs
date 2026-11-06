import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import {loadFunctions} from './source-harness.mjs'

const {installerPlatformFromUserAgent,cannotOpenInstaller}=loadFunctions('lib/installer-platform.ts',['installerPlatformFromUserAgent','cannotOpenInstaller'])
const botJs=ts.transpileModule(fs.readFileSync('lib/analytics/bot-user-agent.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
const {isBotUserAgent}=await import(`data:text/javascript;base64,${Buffer.from(botJs).toString('base64')}`)

class NextResponse extends Response {
  static redirect(url,init){
    const status=typeof init==='number'?init:init?.status??307
    const headers=new Headers(typeof init==='object'?init.headers:undefined)
    headers.set('Location',String(url))
    return new Response(null,{status,headers})
  }
}

function route(){
  const tracked=[]
  const {GET}=loadFunctions('app/download/latest/route.ts',['visitorFingerprint','resolveInstallerRedirectDestination','isHttpsProductionUrl','GET'],{
    NextResponse,isBotUserAgent,installerPlatformFromUserAgent,cannotOpenInstaller,
    after:callback=>callback(),
    trackSiteEvent:event=>{tracked.push(event.eventName)},
    ENV_INSTALLER_REDIRECT:'MACWALL_INSTALLER_REDIRECT_URL',
    MACWALL_DEFAULT_INSTALLER_REDIRECT_URL:'https://example.test/api/installers/releases/MacWall.dmg',
    process:{env:{NODE_ENV:'production'}},
  })
  return {GET,tracked}
}
const get=(GET,ua)=>GET(new Request('https://example.test/download/latest',{headers:{'user-agent':ua}}))

const MAC_SAFARI='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const CRAWLERS=[
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
  'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)',
  'CCBot/2.0 (https://commoncrawl.org/faq/)',
]

test('people still count as downloads and send-to-Mac redirects',async()=>{
  const {GET,tracked}=route()
  const mac=await get(GET,MAC_SAFARI)
  assert.equal(mac.status,302)
  assert.equal(mac.headers.get('location'),'https://example.test/api/installers/releases/MacWall.dmg')
  const phone=await get(GET,IPHONE)
  assert.equal(phone.status,303)
  assert.equal(new URL(phone.headers.get('location')).search,'?send=1')
  assert.deepEqual(tracked,['download_redirect','download_send_to_mac'])
})

test('crawlers get the same redirect but no analytics row',async()=>{
  for(const ua of CRAWLERS){
    assert.equal(isBotUserAgent(ua),true,ua)
    const {GET,tracked}=route()
    const response=await get(GET,ua)
    assert.ok([302,303].includes(response.status),ua)
    assert.deepEqual(tracked,[],ua)
  }
  for(const ua of [MAC_SAFARI,IPHONE,null,''])assert.equal(isBotUserAgent(ua),false)
})
