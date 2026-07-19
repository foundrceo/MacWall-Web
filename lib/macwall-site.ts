/** Mirrors public brand strings from MacWall macOS app (`AppBrand` in Theme.swift). */

/** Server route — creates a Stripe session and redirects straight to Stripe Checkout. */
export const macwallCheckoutPath = "/api/checkout/create-session" as const

/** POST/GET endpoint that creates a Stripe Checkout Session. */
export const macwallCheckoutApiPath = "/api/checkout/create-session" as const

/**
 * Stripe checkout entry for in-browser CTAs (same path as `MacWallPaidCheckoutURL` in the Mac app,
 * but relative so localhost / preview hosts stay on the current origin).
 * Optional override: `NEXT_PUBLIC_MACWALL_PRO_CHECKOUT_URL` for a fixed absolute URL.
 */
const proCheckoutFromEnv =
  process.env.NEXT_PUBLIC_MACWALL_PRO_CHECKOUT_URL?.trim()
export const macwallProCheckoutURL =
  proCheckoutFromEnv && proCheckoutFromEnv.length > 0
    ? proCheckoutFromEnv
    : macwallCheckoutPath

/** Post-checkout landing page — Stripe success redirect + Google Ads purchase conversion URL. */
export const macwallThankYouPath = "/thank-you" as const

/**
 * Instant deep-link activation after Stripe checkout.
 * Success redirect: `https://macwall.app/activate?key={license_key}&session_id={CHECKOUT_SESSION_ID}`
 */
export const macwallActivatePath = "/activate" as const

/** Recommended Stripe Checkout success redirect (includes license key for auto-activate). */
export const macwallStripeSuccessRedirectUrl =
  "https://macwall.app/activate?key={license_key}&session_id={CHECKOUT_SESSION_ID}"

/** Opens MacWall and auto-activates when `key` is present (`macwall://activate?key=…`). */
export function macwallLicenseActivationDeepLink(
  licenseKey?: string | null
): string {
  const trimmed = licenseKey?.trim()
  if (!trimmed) return "macwall://activate"
  return `macwall://activate?key=${encodeURIComponent(trimmed)}`
}

/** UI/marketing app icon (`public/MacWall.png`, 1024×1024). Not for favicons — use `macwallFavicons`. */
export const macwallAppIconPath = "/MacWall.png" as const

/** Matches macOS app icon corner ratio — outer silhouette only. */
export const macwallAppIconRadiusClass = "rounded-[22.37%]" as const

/** Browser tab / PWA favicons only — never use in page UI (footer, nav, admin, etc.). */
export const macwallFaviconBase = "/favicon_io" as const

export const macwallFavicons = {
  ico: `${macwallFaviconBase}/favicon.ico`,
  icon16: `${macwallFaviconBase}/favicon-16x16.png`,
  icon32: `${macwallFaviconBase}/favicon-32x32.png`,
  appleTouch: `${macwallFaviconBase}/apple-touch-icon.png`,
  android192: `${macwallFaviconBase}/android-chrome-192x192.png`,
  android512: `${macwallFaviconBase}/android-chrome-512x512.png`,
  webManifest: `${macwallFaviconBase}/site.webmanifest`,
} as const

/** Minimum macOS for MacWall (Apple skipped versions 16–25; 26 Tahoe is the current baseline). */
export const macwallMinimumMacOSVersion = "macOS 26 (Tahoe)" as const
/** Short hint under download CTAs (hero, bottom strip). */
export const macwallMinimumMacOSRequirement =
  "Minimum macOS 26 (Tahoe)" as const
/** System requirements bullets and explicit requirement lines. */
export const macwallMinimumMacOSRequirementOrLater =
  `${macwallMinimumMacOSRequirement} or later` as const

const MACWALL_NAME = "MacWall" as const
const MACWALL_TAGLINE = "Cinematic live wallpapers, built for Mac." as const
const MACWALL_FULL_TAGLINE = `${MACWALL_NAME} - ${MACWALL_TAGLINE}` as const

export const macwall = {
  name: MACWALL_NAME,
  /** Legal entity for copyright notices and policy footers (not the product name). */
  legalCompanyName: "OG Apps, LLC",
  /** Short brand tagline — one line, no breaks. */
  tagline: MACWALL_TAGLINE,
  /** Full brand title for document titles, OG alt text, and JSON-LD. */
  fullTagline: MACWALL_FULL_TAGLINE,
  website: "https://macwall.app",
  /** Community invite — matches `discordInviteURLString` in the Mac app. */
  discordInvite: "https://discord.gg/qhtYwEvHND",
  supportEmail: "support@macwall.app",
  /** Reel refund program — 50% at 2k views, 100% at 20k views. */
  reelRefundEmail: "discount@macwall.com",
  reelRefundInstagram: "@macwallapp",
  reelRefundInstagramURL: "https://www.instagram.com/macwallapp",
  reelRefundTiktok: "@macwall.app",
  reelRefundTiktokURL: "https://www.tiktok.com/@macwall.app",
  reelRefundHashtag: "#macwall",
  reelRefundHashtagURL: "https://www.instagram.com/explore/tags/macwall/",
  reelRefundHalfViews: 2_000,
  reelRefundFullViews: 20_000,
  legalTerms: "https://macwall.app/terms",
  legalPrivacy: "https://macwall.app/privacy",
  /** Shown at top of Terms / Privacy (update when policies change). */
  legalEffectiveDate: "May 9, 2026",
  /** ISO form for JSON-LD `dateModified` (keep in sync with `legalEffectiveDate`). */
  legalEffectiveDateIso: "2026-05-09",
  /** Same buckets as Home → Categories in the Mac app */
  categories: [
    "Nature",
    "Space",
    "Anime",
    "Cars",
    "City",
    "Video Games",
    "Sci-fi",
    "Fantasy",
    "Cats",
  ],
  pro: {
    headline: "Early Bird Offer",
    strikePrice: "$9.99",
    price: "$7.99",
    suffix: "one-time",
    socialProofMembers: "1,000+",
    features: [
      "Full cloud catalog (1,000+ live wallpapers)",
      `Live Lock Screen & Screen Saver (${macwallMinimumMacOSVersion}+)`,
      "Unlimited favorites and playlists",
      "Lifetime updates and future Pro features",
    ],
  },
  /** Shown in Pro discount flows (`AppBrand.proDiscountPromoCode` in Theme.swift). */
  proDiscountPromoCode: "MACWALLPRO",
  /** India-only flash sale — 50% off, 24hr personal timer (web promo). */
  indiaPromoCode: "INDIA50",
  /** Personal license device limit (`AppBrand.maxLicensedMacs`). */
  maxLicensedMacs: 3,
  /** Everything included with a Pro license. */
  proIncludedFeatures: [
    "Cloud catalog: featured, newest, and most popular",
    "Explore with search, filters, and community likes",
    "Save favorites and browse 9 categories",
    "Import your own MP4 and MOV clips",
    "Multi-display playback, synced or solo (hardware decode)",
    "Music Sync: album-art gradients from Apple Music and Spotify",
    "Menu bar control: pause, resume, stop, switch wallpapers",
    "Auto-pause on battery, full screen, and high CPU",
  ],
} as const

export const mailtoReelRefund = `mailto:${macwall.reelRefundEmail}`
export const mailtoSupport = `mailto:${macwall.supportEmail}`

/**
 * Stable canonical path served by `/download/latest` (302 → `MACWALL_INSTALLER_REDIRECT_URL`).
 * Same pattern as `https://download.example.app/latest` → object storage URL.
 */
export const macwallInstallerLatestPath = "/download/latest" as const
