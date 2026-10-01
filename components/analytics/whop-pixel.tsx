import Script from "next/script"

/**
 * Exact Whop Pixel snippet for the MacWall business (biz_igjHj25vmVcNW8),
 * not FoundrList — do not alter.
 * @see https://docs.whop.com/developer/ads/pixel
 */
const WHOP_PIXEL_SNIPPET =
  '!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_igjHj25vmVcNW8");whop.track("page");'

export function WhopPixel() {
  return (
    <Script
      id="whop-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: WHOP_PIXEL_SNIPPET }}
    />
  )
}

/**
 * Funnel events, written the way Whop documents them (`whop.track('lead')`).
 * Rendered as a plain inline <script> from the root layout so the calls sit
 * verbatim in the page HTML, where Whop's setup panel scans for them; the
 * site fires them through `trackWhopEvent` in lib/analytics/whop-client.ts.
 */
const WHOP_FUNNEL_EVENTS_SCRIPT =
  "window.macwallWhopEvents={" +
  "view_content:function(){whop.track('view_content')}," +
  "lead:function(){whop.track('lead')}," +
  "add_to_cart:function(){whop.track('add_to_cart')}," +
  "activated:function(){whop.track('activated')}" +
  "};"

export function WhopFunnelEvents() {
  return (
    <script
      id="whop-funnel-events"
      dangerouslySetInnerHTML={{ __html: WHOP_FUNNEL_EVENTS_SCRIPT }}
    />
  )
}
