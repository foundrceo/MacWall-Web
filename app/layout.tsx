import { ThemeProvider } from "@/components/providers/theme-provider"
import { macwall } from "@/lib/macwall-site"
import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: `${macwall.name} — ${macwall.tagline}`,
    template: `%s · ${macwall.name}`,
  },
  description:
    "Browse live video wallpapers on every display, explore a curated catalog with search and filters, import your own clips, and unlock Lock Screen video with MacWall Pro.",
  metadataBase: new URL(macwall.website),
  /* Favicons: app/favicon.ico, app/icon.png, app/apple-icon.png (see npm run icons:build). */
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: macwall.name,
    title: `${macwall.name} — ${macwall.tagline}`,
    description:
      "Live video wallpapers for Mac. Curated catalog, multi-display playback, and MacWall Pro for Lock Screen video.",
    url: macwall.website,
    images: [
      {
        url: "/macwall-app-icon.png",
        width: 512,
        height: 512,
        alt: `${macwall.name} icon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} — ${macwall.tagline}`,
    description:
      "Live video wallpapers for Mac. Curated catalog, multi-display playback, and MacWall Pro for Lock Screen video.",
    images: ["/macwall-app-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* eslint-disable @next/next/no-page-custom-font -- fonts load from root layout site-wide (rule targets Pages router) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
        {/* eslint-enable @next/next/no-page-custom-font */}
      </head>
      {/* Avoid hydration warnings when extensions inject attributes on <body> */}
      <body
        className="w-full bg-background font-sans font-light text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
