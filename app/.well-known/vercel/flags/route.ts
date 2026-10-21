import { createFlagsDiscoveryEndpoint } from "flags/next"

import { FLAG_DEFINITIONS } from "@/lib/flags"

/**
 * Flags Explorer reads flag definitions here. The helper's `verifyAccess`
 * returns 401 without a valid FLAGS_SECRET Authorization header. Dynamic per
 * request; marketing page caching is unaffected.
 */
export const GET = createFlagsDiscoveryEndpoint(async () => ({
  definitions: FLAG_DEFINITIONS,
  // Toolbar encrypts overrides with FLAGS_SECRET; the app only needs to
  // decrypt them once flags are evaluated per-request (see lib/flags.ts).
  overrideEncryptionMode: "encrypted",
}))
