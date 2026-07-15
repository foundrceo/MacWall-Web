import { PageViewTracker } from "@/components/analytics/page-view-tracker"
import {
  resolveTikTokPixelId,
  TikTokPixel,
} from "@/components/analytics/tiktok-pixel"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { JsonLd } from "@/components/seo/json-ld"
import { macwallSchemaGraph } from "@/lib/macwall-json-ld"
import { macwall } from "@/lib/macwall-site"
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

const SITE_DESCRIPTION_FALLBACK =
  "Bring motion wallpapers to your Mac Desktop: curated daily catalog lanes, search & filters for new backgrounds, your own clips, intelligent pause on battery/full screen, optional MacWall Pro for Lock Screen live wallpaper where Sonoma, Ventura, Sequoia, and newer builds allow."

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

const ahrefsWebAnalyticsKey = resolveAhrefsWebAnalyticsKey()
const tiktokPixelId = resolveTikTokPixelId()

export const metadata: Metadata = {
  title: {
    default: `${macwall.name} – ${macwall.tagline}`,
    template: `${macwall.name} – %s`,
  },
  description: SITE_DESCRIPTION_FALLBACK,
  metadataBase: metadataBaseUrl(),
  keywords: [
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
    "wallper alternative",
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
    "Sonoma Ventura Sequoia wallpaper",
    "macos 27 live wallpaper",
    "macos 27 lock screen wallpaper",
    "macos 26 tahoe live wallpaper",
    "screen saver video mac",
    `${macwall.name}`,
  ],
  /* Favicons: app/favicon.ico, app/icon.png, app/apple-icon.png (see npm run icons:build). */
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: macwall.name,
    title: `${macwall.name} – ${macwall.tagline}`,
    description: SITE_DESCRIPTION_FALLBACK,
    url: "/",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} – ${macwall.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} – ${macwall.tagline}`,
    description: SITE_DESCRIPTION_FALLBACK,
    images: [openGraphImageAbsoluteUrl()],
  },
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {tiktokPixelId ? <TikTokPixel pixelId={tiktokPixelId} /> : null}
      </head>
      {/* Avoid hydration warnings when extensions inject attributes on <body> */}
      <body
        className="w-full bg-background font-sans font-light text-foreground antialiased"
        suppressHydrationWarning
      >
        <JsonLd payload={jsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <PageViewTracker />
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
