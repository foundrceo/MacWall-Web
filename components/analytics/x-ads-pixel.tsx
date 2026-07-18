import Script from "next/script"

const X_ADS_PIXEL_ID_FALLBACK = "qwcc0" as const

export function resolveXAdsPixelId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_X_ADS_PIXEL_ID
  const pixelId = raw === undefined ? X_ADS_PIXEL_ID_FALLBACK : raw.trim()

  return /^[a-z0-9]+$/i.test(pixelId) ? pixelId : undefined
}

export function XAdsPixel({ pixelId }: Readonly<{ pixelId: string }>) {
  return (
    <Script
      id="x-ads-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','${pixelId}');
        `.trim(),
      }}
    />
  )
}
