import { PageViewTracker } from "@/components/analytics/page-view-tracker"
import { CheckoutRetargetingTracker } from "@/components/analytics/checkout-retargeting-tracker"
import {
  resolveTikTokPixelId,
  TikTokPixel,
} from "@/components/analytics/tiktok-pixel"
import {
  resolveXAdsPixelId,
  XAdsPixel,
} from "@/components/analytics/x-ads-pixel"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { JsonLd } from "@/components/seo/json-ld"
import { macwallSchemaGraph } from "@/lib/macwall-json-ld"
import {
  macwall,
  macwallFavicons,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  metadataBaseUrl,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

const SITE_DESCRIPTION_FALLBACK = `MacWall is the native macOS app for live video wallpapers on your Mac desktop: a curated cloud catalog with search and filters, your own clips, multi-display playback, menu bar control, intelligent pause on battery and full screen, and optional MacWall Pro for live Lock Screen and Screen Saver wallpapers on ${macwallMinimumMacOSVersion}.`

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

/** Shipped default when `NEXT_PUBLIC_AHREFS_WEB_ANALYTICS_KEY` is unset. Set the env empty to disable. */
const AHREFS_WEB_ANALYTICS_KEY_FALLBACK = "YOUR_AHREFS_ANALYTICS_KEY" as const

function resolveAhrefsWebAnalyticsKey(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_AHREFS_WEB_ANALYTICS_KEY
  if (raw === undefined) return AHREFS_WEB_ANALYTICS_KEY_FALLBACK
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const ahrefsWebAnalyticsKey =
  process.env.NODE_ENV === "production"
    ? resolveAhrefsWebAnalyticsKey()
    : undefined
const tiktokPixelId = resolveTikTokPixelId()
const xAdsPixelId = resolveXAdsPixelId()
const AFFONSO_PROGRAM_ID = "cmrezh6d4001kizvt1itcyccb" as const
const AFFONSO_COOKIE_DURATION_DAYS = "30" as const

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE_DEFAULT,
    template: `%s — ${macwall.name} App`,
  },
  description: SITE_DESCRIPTION_FALLBACK,
  applicationName: `${macwall.name} App`,
  metadataBase: metadataBaseUrl(),
  keywords: [
    "MacWall app",
    "MacWall app download",
    "MacWall Mac app",
    "MacWall live wallpaper",
    "Mac wallpaper app",
    "live wallpapers for Mac",
    "live wallpaper for mac",
    "live wallpaper macbook",
    "best wallpaper app for mac",
    "best live wallpaper app mac",
    "video wallpaper macOS",
    "video wallpaper mac",
    "moving wallpaper mac",
    "moving wallpapers for macbook",
    "motion desktop background",
    "dynamic wallpapers Mac",
    "dynamic wallpaper macos",
    "Mac desktop backgrounds",
    "macbook wallpaper app",
    "macbook pro live wallpaper",
    "macbook air live wallpaper",
    "wallpaper engine alternative mac",
    "wallpaper engine for mac",
    "wallspace alternative",
    "backdrop alternative mac",
    "lively wallpaper mac",
    "lock screen live wallpaper mac",
    "animated wallpaper mac",
    "animated desktop background mac",
    "4k live wallpaper mac",
    "4k wallpaper mac",
    "hd wallpaper mac",
    "free live wallpaper mac",
    "desktop wallpaper app macos",
    "screensaver wallpaper mac",
    "daily wallpaper discovery",
    "menu bar wallpaper app mac",
    "music sync wallpaper mac",
    "multi monitor live wallpaper mac",
    "macos 26 tahoe live wallpaper",
    "macos 26 lock screen wallpaper",
    "macos tahoe screen saver video",
    "screen saver video mac",
    `${macwall.name}`,
  ],
  icons: {
    icon: [
      { url: macwallFavicons.ico, sizes: "any" },
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
    siteName: `${macwall.name} App`,
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c0d0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = macwallSchemaGraph(canonicalSiteOrigin())

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="affonso-pixel"
          async
          defer
          src="https://cdn.affonso.io/js/pixel.min.js"
          data-affonso={AFFONSO_PROGRAM_ID}
          data-cookie_duration={AFFONSO_COOKIE_DURATION_DAYS}
        />
        {tiktokPixelId ? <TikTokPixel pixelId={tiktokPixelId} /> : null}
        {xAdsPixelId ? <XAdsPixel pixelId={xAdsPixelId} /> : null}
      </head>
      {/* Avoid hydration warnings when extensions inject attributes on <body> */}
      <body
        className="w-full bg-background font-sans font-light text-foreground antialiased"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:shadow-lg focus:outline-none"
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
          <PageViewTracker />
          <CheckoutRetargetingTracker />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        {ahrefsWebAnalyticsKey ? (
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            strategy="afterInteractive"
            data-key={ahrefsWebAnalyticsKey}
          />
        ) : null}
      </body>
    </html>
  )
}
