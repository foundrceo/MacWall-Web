import { ThemeProvider } from "@/components/providers/theme-provider"
import { JsonLd } from "@/components/seo/json-ld"
import { macwallSchemaGraph } from "@/lib/macwall-json-ld"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin, metadataBaseUrl } from "@/lib/site-url"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
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

export const metadata: Metadata = {
  title: {
    default: `${macwall.name} — ${macwall.tagline}`,
    template: `%s · ${macwall.name}`,
  },
  description: SITE_DESCRIPTION_FALLBACK,
  metadataBase: metadataBaseUrl(),
  keywords: [
    "Mac wallpaper app",
    "live wallpapers for Mac",
    "video wallpaper macOS",
    "motion desktop background",
    "dynamic wallpapers Mac",
    "Mac desktop backgrounds",
    "daily wallpaper discovery",
    "Sonoma Ventura Sequoia wallpaper",
    `${macwall.name}`,
  ],
  /* Favicons: app/favicon.ico, app/icon.png, app/apple-icon.png (see npm run icons:build). */
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: macwall.name,
    title: `${macwall.name} — ${macwall.tagline}`,
    description: SITE_DESCRIPTION_FALLBACK,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} — ${macwall.tagline}`,
    description: SITE_DESCRIPTION_FALLBACK,
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
        </ThemeProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
