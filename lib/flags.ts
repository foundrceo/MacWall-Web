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
