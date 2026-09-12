import { FlagValues } from "flags/react"

import { getFlagValues } from "@/lib/flags"

/**
 * Emits evaluated flag values into the DOM (`data-flag-values`).
 * Vercel Web Analytics picks these up automatically and tags every
 * page view + client-side custom event; Flags Explorer shows them too.
 * Static values keep marketing pages prerenderable — see `lib/flags.ts`.
 */
export function SiteFlagValues() {
  return <FlagValues values={getFlagValues()} />
}
