/**
 * Site feature flags — code-as-config defaults.
 *
 * These flags are evaluated statically (no per-request dynamic APIs) so
 * marketing pages stay prerenderable / ISR-friendly. Their values are:
 *  1. used to gate UI below,
 *  2. emitted to the DOM via `<SiteFlagValues />` (`flags/react`),
 *     which makes Vercel Web Analytics annotate every page view and
 *     custom event with them, and makes them visible in Flags Explorer,
 *  3. described to Flags Explorer via `app/.well-known/vercel/flags/route.ts`.
 *
 * To flip a flag, change the default here and redeploy. To graduate to
 * live per-request overrides (Vercel Toolbar) or a provider (Vercel Flags,
 * Statsig, …), evaluate with `flag()` from `flags/next` inside a dynamic
 * server component instead — the emission + discovery wiring stays the same.
 */

export const FLAGS = {
  /** Floating purchase nudges (`SocialProofMount`). Kill-switch + A/B lever. */
  socialProof: true,
  /** Top launch strip above the navbar (`AnnouncementBanner`). */
  announcementBanner: true,
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
