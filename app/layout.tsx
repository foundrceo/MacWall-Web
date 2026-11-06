import { AffonsoPixel } from "@/components/analytics/affonso-pixel"
import { AhrefsWebAnalytics } from "@/components/analytics/ahrefs-web-analytics"
import { MarketingOnlyScripts } from "@/components/analytics/marketing-only-scripts"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"
import { CheckoutRetargetingTracker } from "@/components/analytics/checkout-retargeting-tracker"
import {
  resolveMetaPixelId,
  MetaPixel,
} from "@/components/analytics/meta-pixel"
import {
  resolveTikTokPixelId,
  TikTokPixel,
} from "@/components/analytics/tiktok-pixel"
import {
  resolveXAdsPixelId,
  XAdsPixel,
} from "@/components/analytics/x-ads-pixel"
import {
  AdPixelsGate,
  CookieConsentBanner,
} from "@/components/consent/ad-consent"
import { VisitorPlatformScript } from "@/components/platform/visitor-platform-script"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { JsonLd } from "@/components/seo/json-ld"
import { macwallSchemaGraph } from "@/lib/macwall-json-ld"
import { macwall, macwallFavicons, macwallCatalog } from "@/lib/macwall-site"
import { SITE_BANNER_RESTORE_SCRIPT } from "@/lib/marketing/site-banner"
import {
  canonicalSiteOrigin,
  feedAlternateTypes,
  metadataBaseUrl,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata, Viewport } from "next"
import { averiaSerif, geistSans } from "@/app/fonts"
import { PostHogAnalytics } from "@/components/analytics/posthog-analytics"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import "./globals.css"
import { cn } from "@/lib/utils"

const SITE_DESCRIPTION_FALLBACK = `${macwall.tagline} Native Mac app with ${macwallCatalog.liveCountLabel} live loops (most in 4K), your own videos, every display, and Lock Screen on macOS 26. Free to try, then one payment. macOS 15+.`

const SITE_TITLE_DEFAULT = macwall.fullTagline

/** Google Search Console / Bing verification tokens (set in env to claim the entity). */
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined
const bingSiteVerification =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || undefined

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
const gaId =
  gaMeasurementId && /^G-[A-Z0-9]+$/i.test(gaMeasurementId)
    ? gaMeasurementId
    : undefined

/** Ahrefs Web Analytics key from env only (no baked-in production fallback). */
function resolveAhrefsWebAnalyticsKey(): string | undefined {
  const trimmed = process.env.NEXT_PUBLIC_AHREFS_WEB_ANALYTICS_KEY?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

const ahrefsWebAnalyticsKey =
  process.env.NODE_ENV === "production"
    ? resolveAhrefsWebAnalyticsKey()
    : undefined
const metaPixelId = resolveMetaPixelId()
const tiktokPixelId = resolveTikTokPixelId()
const xAdsPixelId = resolveXAdsPixelId()

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE_DEFAULT,
    template: `%s | ${macwall.name}`,
  },
  description: SITE_DESCRIPTION_FALLBACK,
  applicationName: macwall.name,
  metadataBase: metadataBaseUrl(),
  alternates: {
    types: feedAlternateTypes(),
  },
  // /favicon.ico comes from app/favicon.ico (48x48, linked by the framework);
  // these add the PNG sizes and the Apple touch icon.
  icons: {
    icon: [
      {
        url: macwallFavicons.icon16,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: macwallFavicons.icon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: macwallFavicons.android192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: macwallFavicons.android512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: macwallFavicons.appleTouch,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: macwall.name,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION_FALLBACK,
    url: "/",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: SITE_TITLE_DEFAULT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION_FALLBACK,
    images: [openGraphImageAbsoluteUrl()],
  },
  ...(googleSiteVerification || bingSiteVerification
    ? {
        verification: {
          ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
          ...(bingSiteVerification
            ? { other: { "msvalidate.01": bingSiteVerification } }
            : {}),
        },
      }
    : {}),
  // Preview limits on the generic robots meta too: Bing (and Copilot answers)
  // read that one, not the googlebot meta.
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-video-preview": -1,
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = macwallSchemaGraph(canonicalSiteOrigin())

  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        geistSans.variable,
        averiaSerif.variable,
        geistSans.className
      )}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="describedby"
          href="/llms.txt"
          type="text/markdown"
          title={`${macwall.name} AI-readable site index`}
        />
      </head>
      {/* Avoid hydration warnings when extensions inject attributes on <body> */}
      <body
        className="w-full bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <VisitorPlatformScript />
        <script
          dangerouslySetInnerHTML={{ __html: SITE_BANNER_RESTORE_SCRIPT }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-black focus:outline-none"
        >
          Skip to content
        </a>
        <JsonLd payload={jsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <MarketingOnlyScripts>
            {/* Ad and analytics pixels wait for consent in the EEA/UK/CH
                and stay off for Global Privacy Control browsers. */}
            <AdPixelsGate>
              <AffonsoPixel />
              {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
              {tiktokPixelId ? <TikTokPixel pixelId={tiktokPixelId} /> : null}
              {xAdsPixelId ? <XAdsPixel pixelId={xAdsPixelId} /> : null}
              {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
            </AdPixelsGate>
            <CookieConsentBanner />
            <PageViewTracker />
            <CheckoutRetargetingTracker />
            {ahrefsWebAnalyticsKey ? (
              <AhrefsWebAnalytics dataKey={ahrefsWebAnalyticsKey} />
            ) : null}
          </MarketingOnlyScripts>
        </ThemeProvider>
        {/* Also records Core Web Vitals. */}
        <PostHogAnalytics />
      </body>
    </html>
  )
}
