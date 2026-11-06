import { anySiteSaleLive } from "@/lib/sale.shared"

/**
 * Static feature flags, so marketing pages stay prerenderable. To flip one,
 * change it and redeploy.
 */

export const FLAGS = {
  /**
   * One downloads-only toast per session on desktop (`SocialProofMount`).
   * Off: social proof never shows purchases, and the toast stays dormant
   * until the founder signs off on bringing it back.
   */
  socialProof: false,
  /** Top launch strip above the navbar (`AnnouncementBanner`). */
  announcementBanner: false,
} as const

/**
 * The sale strip takes the banner slot while any `SITE_SALES` entry runs.
 * Decided at render time (pages are static, so not per region); the strip
 * falls back to the price line for a region with no sale right now.
 */
export function showSaleBanner(): boolean {
  return anySiteSaleLive()
}
