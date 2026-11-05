import { isSaleLive, SITE_SALE } from "@/lib/sale.shared"

/**
 * Static feature flags, so marketing pages stay prerenderable. To flip one,
 * change it and redeploy.
 */

export const FLAGS = {
  /** Floating purchase nudges (`SocialProofMount`). */
  socialProof: true,
  /** Top launch strip above the navbar (`AnnouncementBanner`). */
  announcementBanner: false,
} as const

/**
 * The sale strip takes the banner slot while `SITE_SALE` runs. Decided at
 * render time; the strip itself falls back to the price line if a cached
 * page outlives the sale.
 */
export function showSaleBanner(): boolean {
  return isSaleLive(SITE_SALE)
}
