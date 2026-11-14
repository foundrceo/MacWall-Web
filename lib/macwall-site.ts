/** Mirrors public brand strings from MacWall macOS app (`AppBrand` in Theme.swift). */

/** Server route: creates a Stripe session and redirects straight to Stripe Checkout. */
export const macwallCheckoutPath =
  "/api/checkout/create-session?offer=permanent" as const

/** POST/GET endpoint that creates a Stripe Checkout Session (permanent Pro). */
export const macwallCheckoutApiPath = macwallCheckoutPath

/**
 * Stripe checkout entry for in-browser CTAs (same path as `MacWallPaidCheckoutURL` in the Mac app,
 * but relative so localhost / preview hosts stay on the current origin).
 * Always includes `offer=permanent` so TrackedLink / palette resolve the correct SKU.
 * Optional override: `NEXT_PUBLIC_MACWALL_PRO_CHECKOUT_URL` for a fixed absolute URL.
 */
const proCheckoutFromEnv =
  process.env.NEXT_PUBLIC_MACWALL_PRO_CHECKOUT_URL?.trim()
export const macwallProCheckoutURL =
  proCheckoutFromEnv && proCheckoutFromEnv.length > 0
    ? proCheckoutFromEnv
    : macwallCheckoutPath

/** Post-checkout landing page: Stripe success redirect + Google Ads purchase conversion URL. */
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

/**
 * Opens a catalog wallpaper in the Mac app (`macwall://wallpaper?id=…`).
 * The app opens that wallpaper’s detail surface and starts download if needed.
 */
export function macwallWallpaperDeepLink(wallpaperId: string): string {
  const id = wallpaperId.trim()
  if (!id) return "macwall://wallpaper"
  return `macwall://wallpaper?id=${encodeURIComponent(id)}`
}

/**
 * HTTPS bridge that attempts the wallpaper deep link, then offers installer download.
 * Mirror of `/activate` for license keys.
 */
export const macwallOpenWallpaperPath = "/open" as const

export function macwallOpenWallpaperHref(
  wallpaperId: string,
  options?: { name?: string | null }
): string {
  const id = wallpaperId.trim()
  const params = new URLSearchParams()
  if (id) params.set("id", id)
  const name = options?.name?.trim()
  if (name) params.set("name", name)
  const qs = params.toString()
  return qs ? `${macwallOpenWallpaperPath}?${qs}` : macwallOpenWallpaperPath
}

/** UI/marketing app icon (`public/MacWall.png`, 1024×1024). Not for favicons: use `macwallFavicons`. */
export const macwallAppIconPath = "/MacWall.png" as const

/** Matches macOS app icon corner ratio: outer silhouette only. */
export const macwallAppIconRadiusClass = "rounded-[22.37%]" as const

/** Browser tab / PWA favicons only, never use in page UI (footer, nav, admin, etc.). */
export const macwallFaviconBase = "/favicon_io" as const

export const macwallFavicons = {
  icon16: `${macwallFaviconBase}/favicon-16x16.png`,
  icon32: `${macwallFaviconBase}/favicon-32x32.png`,
  appleTouch: `${macwallFaviconBase}/apple-touch-icon.png`,
  android192: `${macwallFaviconBase}/android-chrome-192x192.png`,
  android512: `${macwallFaviconBase}/android-chrome-512x512.png`,
} as const

/** Minimum macOS for desktop live wallpapers (Sequoia+). */
export const macwallMinimumMacOSVersion = "macOS 15" as const
/** Lock Screen / Screen Saver video requires Apple's native wallpaper APIs (Tahoe+). */
export const macwallLockScreenMacOSVersion = "macOS 26 (Tahoe)" as const
/** Short hint under download CTAs (hero, bottom strip). */
export const macwallMinimumMacOSRequirement = "Minimum macOS 15+" as const
/** Compact version label shown under marketing CTAs. */
export const macwallMinimumMacOSVersionLabel =
  "Minimum macOS 15.0 or later" as const
/** Split requirements line for hero / pricing footers. */
export const macwallMacOSRequirementsHint =
  "Desktop: macOS 15+ · Lock Screen: macOS 26+" as const
/**
 * System requirements bullets and JSON-LD `operatingSystem`. Built from the
 * version, not the "15+" hint (that read "Minimum macOS 15+ or later").
 */
export const macwallMinimumMacOSRequirementOrLater =
  `${macwallMinimumMacOSVersion} or later` as const

/** "A, B and C" (the site's list style, no serial comma). */
function listPhrase(items: readonly string[], conjunction = "and"): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`
}

/*
 * Product facts, single-sourced. Each one is checked against the shipped Mac
 * app (MacWall-App, 4.1.0) before it changes; copy everywhere builds on these
 * instead of restating them, so docs, FAQs, JSON-LD and llms.txt can't drift.
 */

/**
 * macOS versions MacWall runs on: the app's deployment target is macOS 15, it
 * ships as a universal binary (Apple silicon and Intel) and is tested on
 * macOS 27. Lock Screen video needs macOS 26 or later. macOS 27 itself runs
 * only on Apple silicon (Apple Support 127255, read 2026-11-05).
 */
export const macwallSupportedMacOS = {
  versions: ["macOS 15 Sequoia", "macOS 26 Tahoe", "macOS 27 Golden Gate"],
  /** "macOS 15 Sequoia, macOS 26 Tahoe and macOS 27 Golden Gate" */
  label: "macOS 15 Sequoia, macOS 26 Tahoe and macOS 27 Golden Gate",
  lockScreenVersions: ["macOS 26 Tahoe", "macOS 27 Golden Gate"],
  architectures: "Apple silicon and Intel Macs",
  /** One sentence for FAQs, docs and AI summaries. */
  summary:
    "MacWall runs on macOS 15 Sequoia, macOS 26 Tahoe and macOS 27 Golden Gate, on Apple silicon and Intel Macs (macOS 27 itself needs Apple silicon). Live Lock Screen and Screen Saver video needs macOS 26 or later.",
} as const

/**
 * The two playback modes (Settings → Wallpaper → Playback). Users see the
 * Settings names, so lead with those; the homepage's marketing names map to
 * them. Before macOS 26 MacWall always uses MacWall App; new installs on
 * macOS 26+ start on System Wallpaper.
 */
export const macwallPlaybackModes = {
  settingsPath: "Settings → Wallpaper → Playback",
  systemWallpaper: {
    setting: "System Wallpaper",
    marketing: "MacWall Native",
    minimumMacOS: "macOS 26",
    keepsPlayingAfterQuit: true,
    summary:
      "macOS plays your wallpaper on the desktop, Lock Screen and screen saver, even when MacWall is closed or after a restart. The Lock Screen always shows the desktop's wallpaper.",
    /** Founder-approved CPU wording for this mode. */
    cpu: "the MacWall process uses 0% CPU after you quit; macOS still decodes the video",
  },
  app: {
    setting: "MacWall App",
    marketing: "MacWall Player",
    minimumMacOS: "macOS 15",
    keepsPlayingAfterQuit: false,
    summary:
      "MacWall plays the desktop itself while it's open, and the Lock Screen can have a different wallpaper. After you quit, the desktop holds a still frame until MacWall opens again.",
  },
} as const

/**
 * The free trial as the app runs it: 24 hours, once per Mac, started with an
 * email address (required since 2026-10-24) and never a card. It covers the
 * catalog, Set Wallpaper and the Lock Screen; imports and uploads need Pro.
 */
const TRIAL_INCLUDES = [
  "the full catalog",
  "Set Wallpaper",
  "the Lock Screen",
] as const

export const macwallTrial = {
  hours: 24,
  /** "free 24-hour trial" (never "Pro trial": imports aren't part of it). */
  name: "free 24-hour trial",
  includes: TRIAL_INCLUDES,
  /** "the full catalog, Set Wallpaper and the Lock Screen" */
  includesLabel: listPhrase(TRIAL_INCLUDES),
  excludes: ["importing your own videos", "community uploads"],
  requiresEmail: true,
  requiresCard: false,
  oncePerMac: true,
  /** Pricing tile and short lines. */
  short: "Catalog and Lock Screen free for 24 hours",
  summary: `Every Mac gets one free 24-hour trial of ${listPhrase(TRIAL_INCLUDES)}. It asks for your email address but never a card. Importing your own videos needs Pro.`,
} as const

/**
 * Pause and power settings (Settings → Battery & Performance), as of 4.1.0.
 * Only "Pause behind full-screen apps" is on by default. Through 4.0.9 Pause
 * on battery only acted in Low Power Mode or at the low-battery warning; it
 * now holds the frame whenever the Mac is unplugged, even with MacWall closed.
 */
export const macwallBatteryPolicy = {
  settingsPath: "Settings → Battery & Performance",
  pauseBehindFullScreen: {
    label: "Pause behind full-screen apps",
    onByDefault: true,
  },
  pauseOnBattery: {
    label: "Pause on battery",
    onByDefault: false,
    detail:
      "holds the frame whenever your Mac is unplugged and plays again when you plug it in",
  },
  lowerQualityOnBattery: {
    label: "Lower quality on battery",
    onByDefault: false,
    detail:
      "decodes less while your Mac runs on battery, never on the Lock Screen",
  },
  pauseWhenBusy: {
    label: "Pause when your Mac is busy",
    onByDefault: false,
    detail: "gives games, exports and builds the full processor",
  },
  summary:
    "MacWall pauses behind full-screen apps by default and stops while your displays sleep. In Settings → Battery & Performance you can also turn on Pause on battery, which holds the frame whenever your Mac is unplugged, Lower quality on battery, and Pause when your Mac is busy. A paused wallpaper keeps its last frame and starts again on its own.",
} as const

/**
 * Video files you can add as your own wallpapers (Upload Wallpaper → Private,
 * Pro). No GIF or still images; WebM exists only for server-side community
 * uploads. H.264 or HEVC inside plays best; ProRes, AV1 and VP9 are converted
 * when set.
 */
export const macwallImportFormats = ["MP4", "MOV", "M4V"] as const
/** "MP4, MOV and M4V" */
export const macwallImportFormatsLabel = listPhrase(macwallImportFormats)
/** "MP4, MOV or M4V" */
export const macwallImportFormatsOrLabel = listPhrase(
  macwallImportFormats,
  "or"
)

/**
 * What MacWall asks macOS for. Setting a wallpaper needs no permission, and
 * Bend draws without capturing the screen. Only Music Sync asks: Automation
 * (the current track) and System Audio Recording (the beat; nothing is
 * recorded or stored).
 */
export const macwallPermissions = {
  never: ["Full Disk Access", "Accessibility", "Screen Recording"],
  musicSync: ["Automation", "System Audio Recording"],
  optional: ["Notifications", "Open at login"],
  summary:
    "MacWall never asks for Full Disk Access, Accessibility or Screen Recording. Only Music Sync asks for anything: Automation, to read the track playing in Apple Music or Spotify, and System Audio Recording, to move with the beat. Nothing is recorded or stored.",
} as const

/** What a Reel refund or creator post must carry so viewers know it's paid. */
export const macwallCreatorDisclosure = {
  tag: "#ad",
  label: "#ad or the platform's paid-partnership label",
} as const

/**
 * Catalog count used by every page, meta description, FAQ and llms.txt line.
 * A fixed label, not computed from the live catalog. The founder set it to
 * "1,000+" on 2026-11-06. The seo-check catalog-claim check fails if the API
 * total or the sitemap's wallpaper pages drop below it, for example if
 * unreviewed imports are hidden.
 */
export const macwallCatalog = {
  liveCountLabel: "1,000+",
  stillCount: 22,
} as const

/**
 * "25,000+ downloads": installer downloads from macwall.app (once per browser
 * session, Mac browsers, bots excluded), rounded down. It counts downloads,
 * not people: never present it as users, customers or purchases.
 */
const MACWALL_DOWNLOADS_LABEL = "25,000+" as const

export const macwallSocialProof = {
  downloadsLabel: MACWALL_DOWNLOADS_LABEL,
  downloadsLine: `${MACWALL_DOWNLOADS_LABEL} downloads`,
  verifiedOnIso: "2026-10-16",
} as const

const MACWALL_NAME = "MacWall" as const
/** Also the <title> suffix and OG alt text: keep it short and keyword-led. */
const MACWALL_TAGLINE = "Live wallpapers for Mac." as const
const MACWALL_FULL_TAGLINE = `${MACWALL_NAME} - ${MACWALL_TAGLINE}` as const

export const macwall = {
  name: MACWALL_NAME,
  /** Public app identity: verified against the shipping macOS target. */
  bundleIdentifier: "com.macwall.ogapps",
  /** Keep in sync with the updater feed; `/changelog` remains the live source of truth. */
  currentVersion: "4.1.0",
  currentVersionReleasedIso: "2026-10-24",
  currentVersionReleasedLabel: "October 24, 2026",
  /**
   * Review stamp for the canonical `/ai-info` product reference: the day the
   * product facts above were last checked against the shipped app. Never
   * older than `currentVersionReleasedIso`; bump it with every release.
   */
  productInfoLastReviewedIso: "2026-11-05",
  productInfoLastReviewedLabel: "November 5, 2026",
  /**
   * Legal entity that owns and operates MacWall. Must match the payment
   * account's legal entity. Public pages show only this name, as plain text
   * with no link: no addresses, agent, file number or formation date.
   */
  legalCompanyName: "OG APPS, LLC",
  /** Checkout and card processing for Pro purchases. */
  paymentProcessor: "Stripe",
  paymentProcessorUrl: "https://stripe.com",
  /** Short brand tagline: one line, no breaks. */
  tagline: MACWALL_TAGLINE,
  /** Full brand title for document titles, OG alt text, and JSON-LD. */
  fullTagline: MACWALL_FULL_TAGLINE,
  website: "https://macwall.app",
  /** Community invite: matches `discordInviteURLString` in the Mac app. */
  discordInvite: "https://discord.gg/4tq2Axvg2h",
  /** Official channel ("MacWall", @MacWallApp), which links back to macwall.app. */
  youtubeChannelURL: "https://www.youtube.com/channel/UC0AggWIjNCI-iCQC1NNHdeA",
  supportEmail: "support@macwall.app",
  /** Reel refund program: 50% at 10k views, 100% at 20k views. */
  reelRefundEmail: "discount@macwall.app",
  reelRefundInstagram: "@macwallapp_",
  reelRefundInstagramURL: "https://www.instagram.com/macwallapp_",
  reelRefundTiktok: "@macwall.app",
  reelRefundTiktokURL: "https://www.tiktok.com/@macwall.app",
  reelRefundHashtag: "#macwall",
  reelRefundHashtagURL: "https://www.instagram.com/explore/tags/macwall/",
  reelRefundHalfViews: 10_000,
  reelRefundFullViews: 20_000,
  legalHub: "https://macwall.app/legal",
  legalTerms: "https://macwall.app/legal/terms",
  legalPrivacy: "https://macwall.app/legal/privacy",
  /** Shown at top of Terms / Privacy (update when policies change). */
  legalEffectiveDate: "October 30, 2026",
  /** ISO form for JSON-LD `dateModified` (keep in sync with `legalEffectiveDate`). */
  legalEffectiveDateIso: "2026-10-30",
  /** Same buckets as Home → Categories in the Mac app */
  categories: [
    "Anime",
    "Nature",
    "Cars",
    "Gaming",
    "Space",
    "Heroes",
    "Dark",
    "Abstract",
    "Others",
  ],
  pro: {
    headline: "Permanent License",
    strikePrice: null,
    suffix: "permanent",
    socialProofDownloads: macwallSocialProof.downloadsLabel,
    features: [
      `Complete cloud catalog (${macwallCatalog.liveCountLabel} live wallpapers)`,
      `Live Lock Screen & Screen Saver (${macwallLockScreenMacOSVersion}+)`,
      "Unlimited favorites, Shuffle and Day Schedule",
      "Lifetime updates and future Pro benefits",
    ],
  },
  annual: {
    suffix: "per year",
  },
  /** Shown in Pro discount flows: keep in sync with AppBrand.proDiscountPromoCode + Stripe. */
  proDiscountPromoCode: "MAC10",
  /** Personal base-license device limit. The 5-Mac bundle raises it to 5. */
  maxLicensedMacs: 3,
  /** Money-back window for license purchases, in calendar days. */
  refundWindowDays: 7,
  /** Everything included with a Pro license. */
  proIncludedFeatures: [
    "Cloud catalog: featured, newest, and most popular",
    "Explore with search, filters, and community engagement",
    "Save favorites and browse 9 categories",
    `Import your own ${macwallImportFormatsLabel} videos`,
    "Multi-display playback, synced or solo (hardware decode)",
    "Music Sync: visuals from the album cover for Apple Music and Spotify",
    "Menu bar control: play, pause, skip, stop and switch wallpapers",
    "Shuffle and a Day Schedule that changes the wallpaper through the day",
    `Live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later`,
    "Pauses behind full-screen apps; optional pause on battery or when the Mac is busy",
  ],
} as const

export const mailtoReelRefund = `mailto:${macwall.reelRefundEmail}`
export const mailtoSupport = `mailto:${macwall.supportEmail}`

/**
 * Stable canonical path served by `/download/latest` (302 → `MACWALL_INSTALLER_REDIRECT_URL`).
 * Same pattern as `https://download.example.app/latest` → object storage URL.
 */
export const macwallInstallerLatestPath = "/download/latest" as const
