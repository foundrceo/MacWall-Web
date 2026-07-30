import Script from "next/script"

import {
  AFFONSO_COOKIE_DURATION_DAYS,
  AFFONSO_FIRST_PARTY_BASE,
  AFFONSO_PIXEL_SRC,
  getAffonsoProgramId,
} from "@/lib/macwall-affiliate"

/**
 * Affonso affiliate pixel — first-party mode (`/r`) so ad blockers are less
 * likely to drop tracking. Must load on every page via the root layout.
 *
 * @see https://affonso.io/help/installation-guides/proxy-setup/pixel-tracking-proxy
 */
export function AffonsoPixel() {
  const programId = getAffonsoProgramId()
  if (!programId) return null

  return (
    <Script
      id="affonso-pixel"
      src={AFFONSO_PIXEL_SRC}
      strategy="afterInteractive"
      data-affonso={programId}
      data-cookie_duration={String(AFFONSO_COOKIE_DURATION_DAYS)}
      data-api-base={AFFONSO_FIRST_PARTY_BASE}
    />
  )
}
