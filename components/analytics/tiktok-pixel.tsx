import Script from "next/script"

/** Shipped default when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` is unset. Set the env empty to disable. */
const TIKTOK_PIXEL_ID_FALLBACK = "YOUR_TIKTOK_PIXEL_ID" as const

export function resolveTikTokPixelId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  if (raw === undefined) return TIKTOK_PIXEL_ID_FALLBACK
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/** TikTok Events Manager base pixel — loads on every page and fires `ttq.page()`. */
export function TikTokPixel({ pixelId }: Readonly<{ pixelId: string }>) {
  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
        `.trim(),
      }}
    />
  )
}
