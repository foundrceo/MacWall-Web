/**
 * Social proof is downloads only: `macwallSocialProof.downloadsLine`, the
 * installer download count from macwall.app. Never show or expose purchases,
 * customers, license counts, revenue or buyer countries, and never present
 * the download figure as users.
 */

import { macwall, macwallSocialProof } from "@/lib/macwall-site"

/** The whole public payload of `/api/social-proof`. */
export type SocialProofFeed = {
  downloadsLine: string
}

export const SOCIAL_PROOF_FEED: SocialProofFeed = {
  downloadsLine: macwallSocialProof.downloadsLine,
}

export type SocialProofMessage = {
  /** Stable per line, so the toast can key its enter/exit animation. */
  key: string
  text: string
}

/** The one toast line, e.g. "25,000+ downloads of MacWall". */
export function socialProofMessage(
  feed: SocialProofFeed = SOCIAL_PROOF_FEED
): SocialProofMessage {
  return {
    key: `downloads:${feed.downloadsLine}`,
    text: `${feed.downloadsLine} of ${macwall.name}`,
  }
}
