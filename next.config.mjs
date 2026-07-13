/** @type {import('next').NextConfig} */

const CATALOG_SUPABASE_DEFAULT_HOST = "YOUR_SUPABASE_PROJECT_REF.supabase.co"

function catalogSupabaseHostname() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw?.startsWith("https://")) return CATALOG_SUPABASE_DEFAULT_HOST
  try {
    return new URL(raw).hostname
  } catch {
    return CATALOG_SUPABASE_DEFAULT_HOST
  }
}

const supabaseHost = catalogSupabaseHostname()

const nextConfig = {
  poweredByHeader: false,
  compress: true,
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
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/wallpaper-catalog/**",
      },
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/render/image/public/wallpaper-catalog/**",
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
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ]
  },
}

export default nextConfig
