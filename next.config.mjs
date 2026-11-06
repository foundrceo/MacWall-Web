import path from "node:path"
import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */

const R2_CDN_HOST = "cdn.macwall.app"

/** Pin Turbopack to this app so it ignores lockfiles in parent folders. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/**
 * Report-only so violations show up without breaking analytics. The inline
 * TikTok and X pixels and Next's runtime need 'unsafe-inline'/'unsafe-eval'.
 * Switch to an enforcing `Content-Security-Policy` once the reports are clean.
 */
const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.tiktok.com https://static.ads-twitter.com https://analytics.ahrefs.com https://www.googletagmanager.com https://us-assets.i.posthog.com https://cdn.affonso.io https://connect.facebook.net https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://${R2_CDN_HOST} https://*.r2.cloudflarestorage.com https://*.supabase.co https://analytics.tiktok.com https://t.co https://analytics.twitter.com https://www.google-analytics.com https://www.facebook.com`,
  `media-src 'self' blob: https://${R2_CDN_HOST} https://*.r2.cloudflarestorage.com https://*.supabase.co`,
  "connect-src 'self' https://*.supabase.co https://*.r2.cloudflarestorage.com https://business-api.tiktok.com https://analytics.tiktok.com https://ads-api.x.com https://static.ads-twitter.com https://analytics.ahrefs.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://us.i.posthog.com https://us-assets.i.posthog.com https://api.affonso.io https://cdn.affonso.io https://www.facebook.com https://connect.facebook.net https://cloudflareinsights.com",
  "frame-src 'self' https://www.facebook.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://www.facebook.com/tr/",
  "object-src 'none'",
].join("; ")

/**
 * Gallery category slugs that were retired. `hub` replaces the old category
 * page: the matching collection where one exists. `category` is where the
 * slug's wallpapers now live (`LEGACY_SLUG_TO_NAME` in
 * lib/seo/category-slugs.ts), so old `/page/{n}` URLs keep showing the same
 * wallpapers.
 */
const LEGACY_GALLERY_CATEGORIES = {
  city: { hub: "/wallpapers/collections/city", category: "dark" },
  cats: { hub: "/wallpapers/collections/cat", category: "others" },
  fantasy: { hub: "/wallpapers/collections/dark-fantasy", category: "others" },
  "sci-fi": { hub: "/wallpapers/collections/cyberpunk", category: "heroes" },
  "video-games": { hub: "/wallpapers/gaming", category: "gaming" },
}

/**
 * Gallery hub redirects, each a single hop. Order matters (first match wins):
 * the legacy slugs come before the generic rules so `/wallpapers/city/page/1`
 * doesn't chain through `/wallpapers/city`.
 *
 * Only `/wallpaper/{category}` with a single segment is handled here. Detail
 * URLs (`/wallpaper/{category}/{slug}`, legacy categories included) are
 * canonicalised in worker/index.ts, never in this file.
 */
const galleryRedirects = [
  ...Object.entries(LEGACY_GALLERY_CATEGORIES).flatMap(
    ([slug, { hub, category }]) => [
      { source: `/wallpapers/${slug}`, destination: hub, permanent: true },
      { source: `/wallpaper/${slug}`, destination: hub, permanent: true },
      {
        source: `/wallpapers/${slug}/page/1`,
        destination: hub,
        permanent: true,
      },
      {
        source: `/wallpapers/${slug}/page/:page`,
        destination: `/wallpapers/${category}/page/:page`,
        permanent: true,
      },
    ]
  ),
  // Page 1 is the hub itself (`galleryPageHref`); the `/page/{n}` routes 404 on 1.
  { source: "/wallpapers/page/1", destination: "/wallpapers", permanent: true },
  {
    source: "/wallpapers/display/:slug/page/1",
    destination: "/wallpapers/display/:slug",
    permanent: true,
  },
  {
    source: "/wallpapers/collections/:slug/page/1",
    destination: "/wallpapers/collections/:slug",
    permanent: true,
  },
  {
    source: "/wallpapers/:category/page/1",
    destination: "/wallpapers/:category",
    permanent: true,
  },
  // A trimmed detail URL: `/wallpaper/anime` means the Anime gallery.
  {
    source: "/wallpaper/:category",
    destination: "/wallpapers/:category",
    permanent: true,
  },
]

/**
 * Blog posts merged into the page that owns their search intent, so each
 * query has one URL: category posts into the gallery hubs, device posts into
 * the display pages, and thin how-tos into the pillar guide that now covers
 * them. Destinations are live pages, never another redirect source
 * (tests/crawl-rules.test.mjs and tests/blog-content.test.mjs check this).
 */
const BLOG_MERGES = {
  "anime-live-wallpaper-mac": "/wallpapers/anime",
  "nature-live-wallpaper-mac": "/wallpapers/nature",
  "space-wallpaper-mac": "/wallpapers/space",
  "gaming-wallpaper-mac": "/wallpapers/gaming",
  "live-wallpaper-macbook-air": "/wallpapers/display/macbook-air",
  "live-wallpaper-macbook-pro": "/wallpapers/display/macbook-pro",
  "4k-video-wallpaper-mac": "/wallpapers/display/4k",
  "mp4-wallpaper-mac-guide": "/blog/how-to-use-video-as-wallpaper-mac",
  "import-custom-wallpaper-mac": "/blog/how-to-use-video-as-wallpaper-mac",
  "macbook-animated-wallpaper-guide": "/blog/how-to-set-live-wallpaper-mac",
  "lock-screen-live-wallpaper-macos": "/blog/how-to-change-lock-screen-on-mac",
  "macos-sequoia-dynamic-wallpaper": "/blog/macos-wallpapers",
  "menu-bar-wallpaper-controls-mac": "/docs/menu-bar-controls",
  // The performance posts, until a measured benchmark replaces them.
  "live-wallpaper-battery-drain-mac": "/blog/live-wallpaper-cpu-usage-mac",
  "apple-silicon-wallpaper-performance": "/blog/live-wallpaper-cpu-usage-mac",
  "macwall-performance-zero-overhead-guide":
    "/blog/live-wallpaper-cpu-usage-mac",
}

const blogMergeRedirects = Object.entries(BLOG_MERGES).map(
  ([slug, destination]) => ({
    source: `/blog/${slug}`,
    destination,
    permanent: true,
  })
)

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
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
    // Fewer width variants → fewer Image Optimization transforms + cache entries.
    deviceSizes: [640, 750, 1080, 1280],
    imageSizes: [32, 64, 128, 256],
    qualities: [75],
    /**
     * The optimizer only handles our own `/public` art. Catalog thumbs go
     * through `catalogImageLoader` (Cloudflare resizing on the R2 CDN), so no
     * remote hosts: an open pattern lets anyone bill transforms to this
     * project. `search: ""` stops `?v=1`, `?v=2`... cache-busting.
     */
    remotePatterns: [],
    localPatterns: [
      { pathname: "/Img.png", search: "" },
      { pathname: "/MacWall.png", search: "" },
      { pathname: "/how/**", search: "" },
      { pathname: "/install/**", search: "" },
      { pathname: "/reviews/**", search: "" },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      // Marketing videos live on the R2 CDN (lib/marketing-assets-urls.ts).
      // Old links and video indexes still point here.
      {
        source:
          "/hero/:file(hero-video|hero-video-720|hero-video-mobile|bend-demo|lockscreen|music-sync).mp4",
        destination: `https://${R2_CDN_HOST}/assets/hero/:file.mp4`,
        permanent: true,
      },
      // www -> apex. The Worker answers both hostnames, so it happens here.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.macwall.app" }],
        destination: "https://macwall.app/:path*",
        permanent: true,
      },
      // Same invite as `macwall.discordInvite` and the Mac app.
      {
        source: "/discord",
        destination: "https://discord.gg/4tq2Axvg2h",
        permanent: true,
      },
      {
        source: "/affilate",
        destination: "/affiliate",
        permanent: true,
      },
      // Uploads and support live in the Mac app now.
      {
        source: "/submit",
        destination: "/download",
        permanent: true,
      },
      {
        source: "/support",
        destination: "/docs",
        permanent: true,
      },
      // The old landing page for the head term, which the homepage now owns.
      // Most of its search traffic was the brand query.
      {
        source: "/live-wallpaper-mac",
        destination: "/",
        permanent: true,
      },
      {
        source: "/lock-screen-wallpaper",
        destination: "/blog/how-to-change-lock-screen-on-mac",
        permanent: true,
      },
      {
        source: "/pricing/reel-refund",
        destination: "/creator",
        permanent: true,
      },
      // No index page lives at /alternatives; /compare lists every comparison.
      {
        source: "/alternatives",
        destination: "/compare",
        permanent: true,
      },
      {
        source: "/alternatives/macwall-vs-wallper",
        destination: "/best-live-wallpaper-mac",
        permanent: true,
      },
      {
        source: "/blog/macwall-vs-wallper",
        destination: "/best-live-wallpaper-mac",
        permanent: true,
      },
      // Blog posts that duplicated a landing page. One page per search intent.
      {
        source: "/blog/best-live-wallpaper-app-mac-2026",
        destination: "/best-live-wallpaper-mac",
        permanent: true,
      },
      {
        source: "/blog/why-macwall-best-native-wallpaper-app",
        destination: "/best-live-wallpaper-mac",
        permanent: true,
      },
      {
        source: "/blog/wallpaper-engine-alternative-mac",
        destination: "/alternatives/wallpaper-engine",
        permanent: true,
      },
      {
        source: "/blog/macwall-vs-backdrop",
        destination: "/alternatives/macwall-vs-backdrop",
        permanent: true,
      },
      {
        source: "/blog/macwall-vs-wallspace",
        destination: "/alternatives/macwall-vs-wallspace",
        permanent: true,
      },
      {
        source: "/blog/macwall-vs-lively-wallpaper",
        destination: "/alternatives/lively-wallpaper-mac",
        permanent: true,
      },
      ...blogMergeRedirects,
      {
        source: "/privacy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/refund",
        destination: "/legal/refund",
        permanent: true,
      },
      {
        source: "/refunds",
        destination: "/legal/refund",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/legal/terms",
        permanent: true,
      },
      ...galleryRedirects,
    ]
  },
  /**
   * Affonso first-party static assets (`/r/*.js`).
   * `/r/track` and `/r/signups` are App Router proxies that forward client IP.
   * @see https://affonso.io/help/installation-guides/proxy-setup/pixel-tracking-proxy
   */
  async rewrites() {
    return [
      {
        source: "/r/pixel.js",
        destination: "https://cdn.affonso.io/js/pixel.min.js",
      },
      {
        source: "/r/psl.min.js",
        destination: "https://cdn.affonso.io/js/psl.min.js",
      },
      /**
       * Markdown twin of every content page: `/blog/example.md` is served by
       * `app/md/[...path]/route.ts`. A dynamic App Router segment cannot carry
       * a file extension, so the public `.md` URL is a rewrite.
       * `:path+` / `:path*` (not a `(.+)\\.md` regex) so Next.js and vinext
       * (Cloudflare) both match it the same way.
       */
      {
        source: "/:path+.md",
        destination: "/md/:path*",
      },
    ]
  },
  async headers() {
    /**
     * Gallery pages are prerendered and apply `?q=&tag=&sort=` client-side, so
     * filtered views share the canonical HTML. Keep them out of the index.
     */
    const filteredGalleryNoindex = ["q", "tag", "sort"].flatMap((key) =>
      ["/wallpapers", "/wallpapers/:category"].map((source) => ({
        source,
        has: [{ type: "query", key }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      }))
    )

    /**
     * `/public` files default to `max-age=0`, so every page view re-checks each
     * icon, poster and thumb. Names aren't content-hashed, so cache for a day
     * (not `immutable`) with a week of stale-while-revalidate. Asset folders
     * only, never page routes like `/blog/[slug]`.
     *
     * Under vinext (the Cloudflare build) static files never reach these
     * rules; the Worker sets the same header (worker/edge.ts
     * `staticAssetCacheControl`). Kept for `next start`.
     */
    const PUBLIC_ASSET_CACHE_CONTROL =
      "public, max-age=86400, stale-while-revalidate=604800"
    const publicAssetCaching = [
      "/:dir(favicon_io|hero|how|install|reviews|og|screenshots|images|email)/:path+",
      "/blog/:dir(thumbs|vs)/:path+",
      "/:file(MacWall.png|Img.png|og-share.jpg|Settings.jpg)",
    ].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE_CONTROL }],
    }))

    /**
     * Skip the framing and HSTS headers in dev. They stop `next dev` from
     * loading inside an editor's preview iframe, and HSTS on localhost can
     * pin the browser to https:// long after you stop the server.
     */
    const isDev = process.env.NODE_ENV !== "production"
    const csp = isDev
      ? CONTENT_SECURITY_POLICY_REPORT_ONLY.replace(
          "; frame-ancestors 'self'",
          ""
        )
      : CONTENT_SECURITY_POLICY_REPORT_ONLY

    /**
     * Share images from `npm run og:generate` carry a content hash in the name
     * (`{slug}.{hash}.jpg`), so a file never changes once published.
     */
    const hashedShareImages = {
      source: "/og/:file([a-z0-9-]+\\.[a-f0-9]{10}\\.jpg)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    }

    return [
      ...filteredGalleryNoindex,
      ...publicAssetCaching,
      hashedShareImages,
      {
        // `/(.*)`, not `/:path*`: vinext doesn't match the bare `/` with
        // `/:path*`, so the homepage would miss these headers.
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
              ]),
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: csp,
          },
        ],
      },
    ]
  },
}

export default nextConfig
