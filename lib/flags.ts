/**
 * Static feature flags, so marketing pages stay prerenderable. Values gate UI,
 * are emitted to the DOM via `<SiteFlagValues />` and are described in
 * `app/.well-known/vercel/flags/route.ts`. To flip one, change it and redeploy.
 */

export const FLAGS = {
  /** Floating purchase nudges (`SocialProofMount`). */
  socialProof: true,
  /** Top launch strip above the navbar (`AnnouncementBanner`). */
  announcementBanner: false,
} as const

export type SiteFlagKey = keyof typeof FLAGS

/** Static snapshot served to the DOM + used for gating. */
export function getFlagValues(): Record<SiteFlagKey, boolean> {
  return { ...FLAGS }
}

type FlagDefinition = {
  description: string
  options: { value: boolean; label: string }[]
}

/** Served by the Flags Discovery Endpoint (Toolbar definitions). */
export const FLAG_DEFINITIONS: Record<SiteFlagKey, FlagDefinition> = {
  socialProof: {
    description:
      "Show floating social-proof purchase nudges on marketing pages.",
    options: [
      { value: true, label: "Show" },
      { value: false, label: "Hide" },
    ],
  },
  announcementBanner: {
    description: "Show the top announcement strip above the navbar.",
    options: [
      { value: true, label: "Show" },
      { value: false, label: "Hide" },
    ],
  },
}
