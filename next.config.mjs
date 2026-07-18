/** @type {import('next').NextConfig} */

const R2_CDN_HOST = "cdn.macwall.app"

/**
 * Report-only CSP. Inline analytics pixels (TikTok, X) plus Next.js runtime
 * injection require 'unsafe-inline'/'unsafe-eval'; we start in Report-Only so
 * violations surface in the console without breaking analytics. Promote to an
 * enforcing `Content-Security-Policy` header once violations are triaged.
 */
const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.tiktok.com https://static.ads-twitter.com https://analytics.ahrefs.com https://www.googletagmanager.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://${R2_CDN_HOST} https://images.unsplash.com https://www.apple.com https://analytics.tiktok.com https://t.co https://analytics.twitter.com https://www.google-analytics.com`,
  `media-src 'self' blob: https://${R2_CDN_HOST} https://*.supabase.co`,
  "connect-src 'self' https://*.supabase.co https://business-api.tiktok.com https://analytics.tiktok.com https://ads-api.x.com https://static.ads-twitter.com https://analytics.ahrefs.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  `frame-src 'self'`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ")

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  /** Only used by `npm run dev:webpack`; Turbopack (default `next dev`) ignores this. */
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/.playwright-cli/**",
          "**/*.log",
        ],
      }
    }
    return config
  },
  /** Match default App Router URLs (no trailing slash) for consistent canonicals. */
  trailingSlash: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.apple.com",
        pathname: "/v/iphone-air/**",
      },
      {
        protocol: "https",
        hostname: "www.apple.com",
        pathname: "/in/iphone-air/**",
      },
      {
        protocol: "https",
        hostname: R2_CDN_HOST,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@hugeicons/core-free-icons",
      "@hugeicons/react",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: CONTENT_SECURITY_POLICY_REPORT_ONLY,
          },
        ],
      },
    ]
  },
}

export default nextConfig
