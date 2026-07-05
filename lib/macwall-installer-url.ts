/**
 * Default public HTTPS URL for the MacWall `.dmg` (Supabase Storage).
 * Matches `releases/MacWall.dmg` in `publish-macwall-dmg.sh` bucket `installers`.
 * Override anytime with env `MACWALL_INSTALLER_REDIRECT_URL`; set env to whitespace-only → disabled.
 */
export const MACWALL_DEFAULT_INSTALLER_REDIRECT_URL =
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co/storage/v1/object/public/installers/releases/MacWall.dmg" as const
