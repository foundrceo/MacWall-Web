/** Affonso affiliate program — pixel + Stripe attribution. */
export const AFFONSO_PROGRAM_ID = "cmrezh6d4001kizvt1itcyccb" as const

export const AFFONSO_COOKIE_DURATION_DAYS = 30 as const

/** First-party pixel path prefix (proxied in `next.config.mjs`). */
export const AFFONSO_FIRST_PARTY_BASE = "/r" as const

export const AFFONSO_PIXEL_SRC = `${AFFONSO_FIRST_PARTY_BASE}/pixel.js` as const

export const AFFONSO_REFERRAL_COOKIE = "affonso_referral" as const

const affiliatePortalFromEnv =
  process.env.NEXT_PUBLIC_MACWALL_AFFILIATE_PORTAL_URL?.trim()

/** Partner signup / dashboard (Affonso white-label portal). */
export const macwallAffiliatePortalURL =
  affiliatePortalFromEnv && affiliatePortalFromEnv.length > 0
    ? affiliatePortalFromEnv
    : "https://macwall.affonso.io"
