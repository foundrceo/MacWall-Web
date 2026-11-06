import { SOCIAL_PROOF_FEED } from "@/lib/social-proof/feed"

export const dynamic = "force-static"
export const revalidate = 86400

/**
 * Public social proof: the downloads line and nothing else. Purchases,
 * license counts and buyer countries are never exposed here.
 */
export function GET(): Response {
  return Response.json(SOCIAL_PROOF_FEED)
}
