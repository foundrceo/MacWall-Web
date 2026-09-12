import { createFlagsDiscoveryEndpoint } from "flags/next"

import { FLAG_DEFINITIONS } from "@/lib/flags"

/**
 * Flags Discovery Endpoint — Flags Explorer fetches definitions here.
 * Authenticated via `FLAGS_SECRET` (`verifyAccess` inside the helper
 * returns 401 without a valid Toolbar Authorization header).
 * Request-scoped, so this route is dynamic by design (no caching impact
 * on marketing pages).
 */
export const GET = createFlagsDiscoveryEndpoint(async () => ({
  definitions: FLAG_DEFINITIONS,
  // Toolbar encrypts overrides with FLAGS_SECRET; the app only needs to
  // decrypt them once flags are evaluated per-request (see lib/flags.ts).
  overrideEncryptionMode: "encrypted",
}))
