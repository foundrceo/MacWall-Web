import Script from "next/script"

/**
 * Exact Whop Pixel snippet — do not alter.
 * @see https://docs.whop.com/developer/ads/pixel
 */
const WHOP_PIXEL_SNIPPET =
  '!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_STnhceZUrgwOQh");whop.track("page");'

export function WhopPixel() {
  return (
    <Script
      id="whop-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: WHOP_PIXEL_SNIPPET }}
    />
  )
}
