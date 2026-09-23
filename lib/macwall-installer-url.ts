/**
 * MacWall `.dmg` download — served from R2 via the web app's installer API
 * (redirects to a presigned R2 GET; no Supabase Storage).
 */

const DEFAULT_SITE_URL = "https://macwall.app"

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL
  try {
    return new URL(raw).origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

/** Stable HTTPS URL for a `.dmg` (302 → presigned R2 object). */
export function macwallInstallerDmgApiUrl(version?: string): string {
  const base = `${siteOrigin()}/api/installers/releases/MacWall.dmg`
  const tag = version?.trim()
  if (tag && /^\d+\.\d+\.\d+$/.test(tag)) {
    return `${base}?version=${encodeURIComponent(tag)}`
  }
  return base
}

/** Default redirect target for `/download/latest`. */
export const MACWALL_DEFAULT_INSTALLER_REDIRECT_URL =
  macwallInstallerDmgApiUrl()
