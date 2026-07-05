import { ThemeProvider } from "@/components/providers/theme-provider"
import { macwall } from "@/lib/macwall-site"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
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
