import Script from "next/script"

/**
 * Google Analytics 4 (gtag.js). Same markup as `@next/third-parties/google`,
 * whose CommonJS client component renders as `undefined` under vinext and
 * crashes the page. Defines the global `gtag` that
 * purchase-conversion-tracker and lib/analytics/retargeting call.
 */
export function GoogleAnalytics({ gaId }: Readonly<{ gaId: string }>) {
  return (
    <>
      <Script
        id="_next-ga-init"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');
          `.trim(),
        }}
      />
      <Script
        id="_next-ga"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
    </>
  )
}
